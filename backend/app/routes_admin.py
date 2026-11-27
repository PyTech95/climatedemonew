"""Admin API. Every route needs a login token; some need the super admin.

Roles
    super  everything: all orders, assigning orders, admins, offers, payments, demo reset
    admin  only the orders assigned to them, plus products, stock and purchases
"""
import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from . import logic
from .config import settings
from .db import get_db, next_seq, now_ms, out
from .schemas import (ActiveIn, AdminIn, AssignIn, CouponIn, LoginIn, ProductIn, PurchaseIn, PurchaseStatusIn,
                      ReceiveIn, SettingsIn, StatusIn)
from .security import current_admin, hash_password, make_token, super_admin, verify_password
from .seed import SIZES, seed_database

router = APIRouter(prefix="/api/admin", tags=["admin"])

LOW_STOCK = 3


def _scope(admin: dict) -> dict:
    """Mongo filter that limits an ordinary admin to their own orders."""
    return {} if admin["role"] == "super" else {"assignedTo": admin["_id"]}


def _order(order_id: str, admin: dict) -> dict:
    order = get_db().orders.find_one({"_id": order_id.upper(), **_scope(admin)})
    if not order:
        raise HTTPException(404, "Order not found, or it is assigned to someone else.")
    return order


def _admin_names(db) -> dict:
    return {a["_id"]: a["name"] for a in db.admins.find({})}


def _order_out(order: dict, names: dict) -> dict:
    o = out(order)
    o["assignedName"] = names.get(order.get("assignedTo"), "")
    o["nextStatus"] = (logic.STATUS_KEYS[logic.STATUS_KEYS.index(o["status"]) + 1]
                       if o["status"] in logic.STATUS_KEYS[:-1] else None)
    o["canCancel"] = o["status"] in logic.CANCELLABLE
    return o


# ------------------------------------------------------------------------------ login
@router.post("/login")
def login(body: LoginIn):
    admin = get_db().admins.find_one({"username": body.username.strip().lower()})
    if not admin or not verify_password(body.password, admin["passwordHash"]):
        raise HTTPException(401, "Wrong username or password.")
    if not admin["active"]:
        raise HTTPException(403, "This login has been switched off by the super admin.")
    return {"token": make_token(admin["_id"]), "admin": out(admin)}


@router.get("/me")
def me(admin=Depends(current_admin)):
    return out(admin)


# -------------------------------------------------------------------------- dashboard
@router.get("/dashboard")
def dashboard(admin=Depends(current_admin)):
    db = get_db()
    scope = _scope(admin)
    orders = list(db.orders.find({**scope, "status": {"$ne": "awaiting_payment"}}).sort("createdAt", -1))
    count = lambda *st: sum(1 for o in orders if o["status"] in st)  # noqa: E731
    start_of_day = now_ms() - (now_ms() % 86_400_000)
    names = _admin_names(db)
    low = [out(p) for p in db.products.find({"active": True, "stock": {"$lte": LOW_STOCK}}, {"image": 0, "desc": 0}).sort("stock", 1)]
    incoming = [out(po) for po in db.purchases.find({"status": {"$in": ["ordered", "transit", "partial"]}}).sort("expectedOn", 1)]
    return {
        "newOrders": count("placed"), "toDispatch": count("confirmed", "packed"), "onTheWay": count("dispatched", "out"),
        "delivered": count("delivered"), "unassigned": sum(1 for o in orders if o["status"] in logic.OPEN_STATUSES and not o["assignedTo"]),
        "salesPaid": sum(o["total"] for o in orders if o["payment"]["status"] == "paid"),
        "codPending": sum(o["total"] for o in orders if o["payment"]["status"] == "pending" and o["status"] in logic.OPEN_STATUSES),
        "ordersToday": sum(1 for o in orders if o["createdAt"] >= start_of_day),
        "recent": [_order_out(o, names) for o in orders[:6]], "lowStock": low, "incoming": incoming,
    }


# ----------------------------------------------------------------------------- orders
@router.get("/orders")
def list_orders(status: Optional[str] = None, q: Optional[str] = None, admin=Depends(current_admin)):
    db = get_db()
    query = dict(_scope(admin))
    query["status"] = status if status and status != "all" else {"$ne": "awaiting_payment"}
    if q and q.strip():
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$or"] = [{"_id": rx}, {"customer.name": rx}, {"customer.phone": rx}]
    names = _admin_names(db)
    return [_order_out(o, names) for o in db.orders.find(query).sort("createdAt", -1).limit(200)]


@router.get("/orders/{order_id}")
def get_order(order_id: str, admin=Depends(current_admin)):
    return _order_out(_order(order_id, admin), _admin_names(get_db()))


@router.post("/orders/{order_id}/status")
def set_status(order_id: str, body: StatusIn, admin=Depends(current_admin)):
    db = get_db()
    order = logic.change_status(db, _order(order_id, admin), body.status, admin["name"], body.courier, body.awb, body.note)
    return _order_out(order, _admin_names(db))


@router.post("/orders/{order_id}/assign")
def assign(order_id: str, body: AssignIn, admin=Depends(super_admin)):
    db = get_db()
    order = _order(order_id, admin)
    if body.adminId and not db.admins.find_one({"_id": body.adminId, "active": True}):
        raise HTTPException(422, "Choose an active admin.")
    db.orders.update_one({"_id": order["_id"]}, {"$set": {"assignedTo": body.adminId or None}})
    return _order_out(db.orders.find_one({"_id": order["_id"]}), _admin_names(db))


# --------------------------------------------------------------------------- products
def _product_fields(body: ProductIn) -> dict:
    if body.image.startswith("data:") and len(body.image) > 450_000:
        raise HTTPException(413, "That photo is too large. Use one under 300 KB, or paste a photo link.")
    return {
        "name": body.name.strip(), "category": body.category.strip(), "price": body.price, "mrp": max(body.mrp, body.price),
        "fabric": body.fabric.strip(), "desc": body.desc.strip(), "image": body.image.strip(), "active": body.active,
        "sizes": [s.strip() for s in body.sizes if s.strip()] or list(SIZES.get(body.category, ["Free size"])),
    }


@router.get("/products")
def admin_products(admin=Depends(current_admin)):
    return [out(p) for p in get_db().products.find({}).sort("createdAt", -1)]


@router.post("/products", status_code=201)
def create_product(body: ProductIn, admin=Depends(current_admin)):
    db = get_db()
    doc = {"_id": f"P{next_seq(db, 'product'):04d}", **_product_fields(body), "opening": body.stock, "sold": 0,
           "stock": body.stock, "createdAt": now_ms()}
    db.products.insert_one(doc)
    return out(doc)


@router.put("/products/{product_id}")
def update_product(product_id: str, body: ProductIn, admin=Depends(current_admin)):
    db = get_db()
    res = db.products.update_one({"_id": product_id}, {"$set": _product_fields(body)})  # stock changes only through purchases and orders
    if res.matched_count != 1:
        raise HTTPException(404, "Product not found.")
    return out(db.products.find_one({"_id": product_id}))


@router.post("/products/{product_id}/active")
def product_active(product_id: str, body: ActiveIn, admin=Depends(current_admin)):
    res = get_db().products.update_one({"_id": product_id}, {"$set": {"active": body.active}})
    if res.matched_count != 1:
        raise HTTPException(404, "Product not found.")
    return {"ok": True}


# ---------------------------------------------------------------- stock and purchases
@router.get("/stock")
def stock(admin=Depends(current_admin)):
    return logic.stock_rows(get_db())


@router.get("/purchases")
def purchases(admin=Depends(current_admin)):
    db = get_db()
    names = {p["_id"]: p["name"] for p in db.products.find({}, {"name": 1})}
    result = []
    for po in db.purchases.find({}).sort("orderedOn", -1):
        doc = out(po)
        for it in doc["items"]:
            it["name"] = names.get(it["productId"], it["productId"])
        result.append(doc)
    return result


@router.post("/purchases", status_code=201)
def create_purchase(body: PurchaseIn, admin=Depends(current_admin)):
    db = get_db()
    for it in body.items:
        if not db.products.find_one({"_id": it.productId}, {"_id": 1}):
            raise HTTPException(422, "One of the selected products no longer exists.")
    doc = {
        "_id": f"PO-{next_seq(db, 'purchase')}", "supplier": body.supplier.strip(), "city": body.city.strip(),
        "orderedOn": now_ms(), "expectedOn": body.expectedOn, "receivedOn": None, "status": "ordered", "note": body.note.strip(),
        "items": [{"productId": it.productId, "qty": it.qty, "received": 0} for it in body.items], "createdBy": admin["name"],
    }
    db.purchases.insert_one(doc)
    return out(doc)


@router.post("/purchases/{po_id}/status")
def purchase_status(po_id: str, body: PurchaseStatusIn, admin=Depends(current_admin)):
    db = get_db()
    po = db.purchases.find_one({"_id": po_id})
    if not po:
        raise HTTPException(404, "Purchase not found.")
    if po["status"] in ("received", "cancelled"):
        raise HTTPException(409, "This purchase is already closed.")
    db.purchases.update_one({"_id": po_id}, {"$set": {"status": body.status}})
    return {"ok": True}


@router.post("/purchases/{po_id}/receive")
def receive(po_id: str, body: ReceiveIn, admin=Depends(current_admin)):
    """Goods arrived: add the received pieces to stock. A purchase can be received in parts."""
    db = get_db()
    po = db.purchases.find_one({"_id": po_id})
    if not po:
        raise HTTPException(404, "Purchase not found.")
    if po["status"] in ("received", "cancelled"):
        raise HTTPException(409, "This purchase is already closed.")
    total_now, complete = 0, True
    for it in po["items"]:
        qty = max(0, min(it["qty"] - it["received"], int(body.quantities.get(it["productId"], 0))))
        if qty:
            it["received"] += qty
            total_now += qty
            db.products.update_one({"_id": it["productId"]}, {"$inc": {"stock": qty}})
        complete = complete and it["received"] >= it["qty"]
    if not total_now:
        raise HTTPException(422, "Enter how many pieces arrived.")
    db.purchases.update_one({"_id": po_id}, {"$set": {
        "items": po["items"], "status": "received" if complete else "partial", "receivedOn": now_ms()}})
    return {"ok": True, "received": total_now, "complete": complete}


# --------------------------------------------------------------------------- payments
@router.get("/payments")
def payments(admin=Depends(super_admin)):
    orders = list(get_db().orders.find({"status": {"$ne": "awaiting_payment"}}).sort("createdAt", -1).limit(300))
    rows = [{"orderId": o["_id"], "createdAt": o["createdAt"], "customer": o["customer"]["name"], "amount": o["total"],
             "method": o["payment"]["method"], "status": o["payment"]["status"], "ref": o["payment"]["ref"],
             "orderStatus": o["status"]} for o in orders]
    total = lambda st: sum(r["amount"] for r in rows if r["status"] == st)  # noqa: E731
    return {"rows": rows, "paid": total("paid"), "pending": total("pending"), "refunded": total("refunded"),
            "mode": "razorpay" if settings.razorpay_enabled else "demo"}


# ------------------------------------------------------------------ offers / settings
@router.get("/offers")
def offers(admin=Depends(super_admin)):
    db = get_db()
    s = logic.store_settings(db)
    s.pop("_id", None)
    return {"settings": s, "coupons": [{"code": c["_id"], **{k: c[k] for k in ("percent", "minTotal", "active")}}
                                       for c in db.coupons.find({}).sort("_id", 1)]}


@router.put("/settings")
def save_settings(body: SettingsIn, admin=Depends(super_admin)):
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if patch:
        get_db().settings.update_one({"_id": "store"}, {"$set": patch}, upsert=True)
    return {"ok": True}


@router.post("/coupons", status_code=201)
def create_coupon(body: CouponIn, admin=Depends(super_admin)):
    db = get_db()
    code = re.sub(r"[^A-Z0-9]", "", body.code.upper())
    if len(code) < 3:
        raise HTTPException(422, "Use at least 3 letters or numbers for the code.")
    if db.coupons.find_one({"_id": code}):
        raise HTTPException(409, "That code already exists.")
    db.coupons.insert_one({"_id": code, "percent": body.percent, "minTotal": body.minTotal, "active": True})
    return {"ok": True, "code": code}


@router.post("/coupons/{code}/active")
def coupon_active(code: str, body: ActiveIn, admin=Depends(super_admin)):
    res = get_db().coupons.update_one({"_id": code.upper()}, {"$set": {"active": body.active}})
    if res.matched_count != 1:
        raise HTTPException(404, "Coupon not found.")
    return {"ok": True}


# ----------------------------------------------------------------------------- admins
@router.get("/admins")
def list_admins(admin=Depends(super_admin)):
    db = get_db()
    result = []
    for a in db.admins.find({}).sort("_id", 1):
        doc = out(a)
        doc["openOrders"] = db.orders.count_documents({"assignedTo": a["_id"], "status": {"$in": logic.OPEN_STATUSES}})
        doc["totalOrders"] = db.orders.count_documents({"assignedTo": a["_id"]})
        result.append(doc)
    return result


@router.post("/admins", status_code=201)
def create_admin(body: AdminIn, admin=Depends(super_admin)):
    db = get_db()
    username = body.username.strip().lower()
    if db.admins.find_one({"username": username}):
        raise HTTPException(409, "That username is already taken.")
    doc = {"_id": f"A{next_seq(db, 'admin'):03d}", "name": body.name.strip(), "username": username,
           "passwordHash": hash_password(body.password), "role": "admin", "active": True, "createdAt": now_ms()}
    db.admins.insert_one(doc)
    return out(doc)


@router.post("/admins/{admin_id}/active")
def admin_active(admin_id: str, body: ActiveIn, admin=Depends(super_admin)):
    db = get_db()
    target = db.admins.find_one({"_id": admin_id})
    if not target:
        raise HTTPException(404, "Admin not found.")
    if target["role"] == "super":
        raise HTTPException(409, "The super admin login cannot be switched off.")
    db.admins.update_one({"_id": admin_id}, {"$set": {"active": body.active}})
    return {"ok": True}


# ------------------------------------------------------------------------------- demo
@router.post("/demo/reset")
def demo_reset(admin=Depends(super_admin)):
    if not settings.demo_mode:
        raise HTTPException(403, "Resetting is only available in demo mode.")
    seed_database(get_db(), reset=True)
    return {"ok": True}
