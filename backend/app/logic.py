"""Shop rules: pricing, coupons, stock, order life cycle, payments."""
import base64
import hashlib
import hmac
import json
import secrets
import urllib.error
import urllib.request

from fastapi import HTTPException

from .config import settings
from .db import next_seq, now_ms

STATUS_KEYS = ["placed", "confirmed", "packed", "dispatched", "out", "delivered"]
OPEN_STATUSES = ["placed", "confirmed", "packed", "dispatched", "out"]
CANCELLABLE = ["placed", "confirmed", "packed"]


def store_settings(db) -> dict:
    return db.settings.find_one({"_id": "store"}) or {"offerText": "", "freeShipAbove": 999, "shipFee": 60, "autoAssign": True}


def money(n) -> str:
    return "₹" + format(int(round(n)), ",")


# ---------------------------------------------------------------- pricing / coupons
def check_coupon(db, code, subtotal: int) -> dict:
    code = (code or "").strip().upper()
    if not code:
        return {"ok": False, "code": None, "discount": 0, "msg": ""}
    c = db.coupons.find_one({"_id": code, "active": True})
    if not c:
        return {"ok": False, "code": None, "discount": 0, "msg": "This code is not valid."}
    if subtotal < c["minTotal"]:
        short = money(c["minTotal"] - subtotal)
        return {"ok": False, "code": None, "discount": 0, "msg": f"Add items worth {short} more to use {code}."}
    return {"ok": True, "code": code, "discount": round(subtotal * c["percent"] / 100), "msg": f"{code} applied: {c['percent']}% off."}


def quote(db, items, coupon_code) -> dict:
    """Price a cart from the database (never trust prices sent by the browser)."""
    lines, problems = [], []
    for it in items:
        p = db.products.find_one({"_id": it.productId})
        if not p or not p.get("active"):
            problems.append("An item in your cart is no longer available.")
            continue
        if p["stock"] <= 0:
            problems.append(f"{p['name']} is out of stock.")
        elif p["stock"] < it.qty:
            problems.append(f"Only {p['stock']} left of {p['name']}.")
        lines.append({"productId": p["_id"], "name": p["name"], "image": p["image"], "size": it.size,
                      "qty": it.qty, "price": p["price"], "mrp": p["mrp"], "stock": p["stock"]})
    subtotal = sum(line["price"] * line["qty"] for line in lines)
    coupon = check_coupon(db, coupon_code, subtotal)
    s = store_settings(db)
    shipping = 0 if not lines or subtotal >= s["freeShipAbove"] else s["shipFee"]
    return {
        "lines": lines, "problems": problems, "subtotal": subtotal, "discount": coupon["discount"],
        "coupon": coupon["code"], "couponOk": coupon["ok"], "couponMsg": coupon["msg"], "shipping": shipping,
        "total": subtotal - coupon["discount"] + shipping, "freeShipAbove": s["freeShipAbove"],
    }


# ----------------------------------------------------------------------------- stock
def reserve_stock(db, lines) -> None:
    """Take the ordered pieces out of stock. Each update only succeeds while enough stock is left,
    so two customers cannot buy the same last piece. If any line fails, earlier lines are put back."""
    done = []
    for line in lines:
        res = db.products.update_one(
            {"_id": line["productId"], "active": True, "stock": {"$gte": line["qty"]}},
            {"$inc": {"stock": -line["qty"], "sold": line["qty"]}},
        )
        if res.modified_count != 1:
            release_stock(db, done)
            raise HTTPException(409, f"{line['name']} just went out of stock. Update your cart and try again.")
        done.append(line)


def release_stock(db, lines) -> None:
    for line in lines:
        db.products.update_one({"_id": line["productId"]}, {"$inc": {"stock": line["qty"], "sold": -line["qty"]}})


def stock_rows(db) -> list:
    """Stock report: for every product, opening + received - sold = in stock, plus what is still on the way."""
    received, incoming, arrival = {}, {}, {}
    for po in db.purchases.find({}):
        for it in po["items"]:
            pid = it["productId"]
            received[pid] = received.get(pid, 0) + it["received"]
            left = it["qty"] - it["received"]
            if po["status"] in ("ordered", "transit", "partial") and left > 0:
                incoming[pid] = incoming.get(pid, 0) + left
                arrival[pid] = min(arrival.get(pid, po["expectedOn"]), po["expectedOn"])
    rows = []
    for p in db.products.find({}).sort("name", 1):
        rows.append({
            "id": p["_id"], "name": p["name"], "category": p["category"], "image": p["image"], "active": p["active"],
            "opening": p["opening"], "received": received.get(p["_id"], 0), "sold": p["sold"], "stock": p["stock"],
            "incoming": incoming.get(p["_id"], 0), "nextArrival": arrival.get(p["_id"]),
        })
    return rows


# ---------------------------------------------------------------------------- orders
def least_busy_admin(db):
    pick, best = None, None
    for a in db.admins.find({"role": "admin", "active": True}).sort("_id", 1):
        load = db.orders.count_documents({"assignedTo": a["_id"], "status": {"$in": OPEN_STATUSES}})
        if best is None or load < best:
            pick, best = a, load
    return pick


def confirm_placed(db, order: dict) -> dict:
    """Move an order into the admin queue: status 'placed', first timeline entry, auto-assign."""
    admin = least_busy_admin(db) if store_settings(db).get("autoAssign") else None
    update = {
        "status": "placed",
        "assignedTo": admin["_id"] if admin else None,
        "timeline": [{"status": "placed", "at": now_ms(), "by": "Customer", "note": ""}],
    }
    db.orders.update_one({"_id": order["_id"]}, {"$set": update})
    order.update(update)
    return order


def create_order(db, data) -> dict:
    q = quote(db, data.items, data.couponCode)
    if q["problems"]:
        raise HTTPException(409, q["problems"][0])
    lines = [{k: line[k] for k in ("productId", "name", "image", "size", "qty", "price")} for line in q["lines"]]
    reserve_stock(db, lines)
    cod = data.payMethod == "cod"
    order = {
        "_id": f"PB{next_seq(db, 'order')}", "createdAt": now_ms(), "customer": data.customer.model_dump(), "items": lines,
        "subtotal": q["subtotal"], "discount": q["discount"], "coupon": q["coupon"], "shipping": q["shipping"], "total": q["total"],
        "payment": {"method": data.payMethod, "gateway": "cod" if cod else "demo", "gatewayOrderId": "", "status": "pending", "ref": ""},
        "status": "awaiting_payment", "timeline": [], "assignedTo": None, "courier": None,
    }
    if not cod and settings.razorpay_enabled:
        try:
            order["payment"].update(gateway="razorpay", gatewayOrderId=razorpay_create_order(order["_id"], order["total"]))
        except Exception:
            release_stock(db, lines)
            raise HTTPException(502, "The payment service did not respond. Try again, or choose cash on delivery.")
    db.orders.insert_one(order)
    return confirm_placed(db, order) if cod else order


def settle_payment(db, order: dict, data) -> dict:
    """Called by the browser after the payment screen closes."""
    if order["status"] != "awaiting_payment":
        return order
    pay = order["payment"]
    if pay["gateway"] == "razorpay":
        if not razorpay_signature_ok(pay["gatewayOrderId"], data.razorpay_payment_id, data.razorpay_signature):
            if data.result == "failed":
                return fail_payment(db, order)
            raise HTTPException(400, "The payment could not be verified.")
        ref = data.razorpay_payment_id
    else:  # built-in test payment screen
        if data.result == "failed":
            return fail_payment(db, order)
        ref = "DEMO" + secrets.token_hex(4).upper()
    db.orders.update_one({"_id": order["_id"]}, {"$set": {"payment.status": "paid", "payment.ref": ref}})
    order["payment"].update(status="paid", ref=ref)
    return confirm_placed(db, order)


def fail_payment(db, order: dict) -> dict:
    release_stock(db, order["items"])
    update = {"status": "cancelled", "payment.status": "failed",
              "timeline": [{"status": "cancelled", "at": now_ms(), "by": "System", "note": "Payment was not completed"}]}
    db.orders.update_one({"_id": order["_id"]}, {"$set": update})
    order["status"] = "cancelled"
    order["payment"]["status"] = "failed"
    return order


def change_status(db, order: dict, status: str, by: str, courier=None, awb=None, note=None) -> dict:
    current = order["status"]
    update = {"status": status}
    if status == "cancelled":
        if current not in CANCELLABLE:
            raise HTTPException(409, "This order has already been dispatched and can no longer be cancelled.")
        release_stock(db, order["items"])
        update["payment.status"] = "refunded" if order["payment"]["status"] == "paid" else "cancelled"
    else:
        if current not in STATUS_KEYS or STATUS_KEYS.index(status) != STATUS_KEYS.index(current) + 1:
            raise HTTPException(409, "Orders move one step at a time. Refresh the page to see the current status.")
        if status == "dispatched":
            if not (courier or "").strip():
                raise HTTPException(422, "Enter the courier name before marking the order as dispatched.")
            update["courier"] = {"name": courier.strip(), "awb": (awb or "").strip()}
        if status == "delivered" and order["payment"]["status"] == "pending":
            update["payment.status"] = "paid"  # cash collected at the door
    entry = {"status": status, "at": now_ms(), "by": by, "note": (note or "").strip()}
    db.orders.update_one({"_id": order["_id"]}, {"$set": update, "$push": {"timeline": entry}})
    return db.orders.find_one({"_id": order["_id"]})


def public_order(order: dict) -> dict:
    """What a customer may see: no staff names, no internal assignment."""
    return {
        "id": order["_id"], "createdAt": order["createdAt"], "customer": order["customer"], "items": order["items"],
        "subtotal": order["subtotal"], "discount": order["discount"], "coupon": order["coupon"], "shipping": order["shipping"],
        "total": order["total"], "status": order["status"], "courier": order["courier"],
        "payment": {k: order["payment"][k] for k in ("method", "status", "ref")},
        "timeline": [{"status": t["status"], "at": t["at"], "note": t.get("note", "") if t["status"] == "cancelled" else ""} for t in order["timeline"]],
        "canCancel": order["status"] in CANCELLABLE,
    }


# -------------------------------------------------------------------------- Razorpay
# Used only when RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set. Amounts go to Razorpay in paise.
def razorpay_create_order(receipt: str, amount_rupees: int) -> str:
    body = json.dumps({"amount": int(amount_rupees) * 100, "currency": "INR", "receipt": receipt}).encode()
    token = base64.b64encode(f"{settings.razorpay_key_id}:{settings.razorpay_key_secret}".encode()).decode()
    req = urllib.request.Request(
        "https://api.razorpay.com/v1/orders", data=body, method="POST",
        headers={"Content-Type": "application/json", "Authorization": f"Basic {token}"},
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())["id"]


def razorpay_signature_ok(gateway_order_id, payment_id, signature, secret=None) -> bool:
    if not (gateway_order_id and payment_id and signature):
        return False
    key = (secret or settings.razorpay_key_secret).encode()
    expected = hmac.new(key, f"{gateway_order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
