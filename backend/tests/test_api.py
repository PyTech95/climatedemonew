"""API tests. Run from backend/:  python -m pytest -q

They use an in-memory stand-in for MongoDB (mongomock), so no database server is needed.
"""
import hashlib
import hmac
import os

os.environ["MONGO_URL"] = "memory://"
os.environ["DEMO_MODE"] = "true"
os.environ["RAZORPAY_KEY_ID"] = ""
os.environ["RAZORPAY_KEY_SECRET"] = ""

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import logic  # noqa: E402
from app.db import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.seed import seed_database  # noqa: E402

CUSTOMER = {"name": "Test Customer", "phone": "9876543210", "address": "12 Test Lane", "city": "Patna", "state": "Bihar", "pincode": "800001"}


@pytest.fixture()
def api():
    seed_database(get_db(), reset=True)
    with TestClient(app) as client:
        yield client


def token(api, username="superadmin", password="demo123"):
    r = api.post("/api/admin/login", json={"username": username, "password": password})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def stock_of(api, pid):
    return api.get(f"/api/products/{pid}").json()["stock"]


def place(api, items, method="cod", coupon=None, customer=None):
    body = {"customer": customer or CUSTOMER, "items": items, "payMethod": method, "couponCode": coupon}
    return api.post("/api/orders", json=body)


# ------------------------------------------------------------------------------- shop
def test_catalogue_and_filters(api):
    cfg = api.get("/api/config").json()
    assert cfg["payment"]["mode"] == "demo" and len(cfg["categories"]) == 5 and len(cfg["demoLogins"]) == 3
    all_products = api.get("/api/products").json()
    assert len(all_products) == 20 and "opening" not in all_products[0]
    sarees = api.get("/api/products", params={"category": "Sarees"}).json()
    assert len(sarees) == 6 and all(p["category"] == "Sarees" for p in sarees)
    cheap = api.get("/api/products", params={"sort": "price_low"}).json()
    assert cheap[0]["price"] == 149 and cheap[0]["price"] <= cheap[1]["price"]
    found = api.get("/api/products", params={"q": "bandhani"}).json()
    assert [p["name"] for p in found] == ["Bandhani dupatta"]
    assert api.get("/api/products/NOPE").status_code == 404


def test_quote_coupon_and_shipping(api):
    q = api.post("/api/cart/quote", json={"items": [{"productId": "P0013", "qty": 1, "size": "M"}]}).json()
    assert q["subtotal"] == 699 and q["shipping"] == 60 and q["total"] == 759
    q = api.post("/api/cart/quote", json={"items": [{"productId": "P0013", "qty": 1, "size": "M"}], "couponCode": "welcome10"}).json()
    assert not q["couponOk"] and "more to use" in q["couponMsg"]
    q = api.post("/api/cart/quote", json={"items": [{"productId": "P0001", "qty": 1}], "couponCode": "welcome10"}).json()
    assert q["couponOk"] and q["discount"] == 250 and q["shipping"] == 0 and q["total"] == 2249
    q = api.post("/api/cart/quote", json={"items": [{"productId": "P0001", "qty": 1}], "couponCode": "FESTIVE15"}).json()
    assert not q["couponOk"]  # coupon exists but is switched off
    q = api.post("/api/cart/quote", json={"items": [{"productId": "P0006", "qty": 1}]}).json()
    assert q["problems"] == ["Green occasion saree is out of stock."]


def test_cod_order_reserves_stock_and_is_assigned(api):
    before = stock_of(api, "P0013")
    r = place(api, [{"productId": "P0013", "qty": 2, "size": "L"}])
    assert r.status_code == 201, r.text
    order = r.json()["order"]
    assert r.json()["payment"] is None and order["status"] == "placed" and order["payment"]["status"] == "pending"
    assert order["id"] == "PB10008" and order["total"] == 1398
    assert stock_of(api, "P0013") == before - 2
    # customers can only open an order with the right mobile number
    assert api.get(f"/api/orders/{order['id']}", params={"phone": "9876543210"}).status_code == 200
    assert api.get(f"/api/orders/{order['id']}", params={"phone": "9876500000"}).status_code == 404
    # auto-assigned to the admin with the fewest open orders (Rohit has 2 open, Neha 2 -> first by id wins on a tie)
    admin_view = api.get(f"/api/admin/orders/{order['id']}", headers=token(api)).json()
    assert admin_view["assignedTo"] in ("A002", "A003") and admin_view["assignedName"] in ("Neha", "Rohit")


def test_cannot_buy_more_than_stock(api):
    r = place(api, [{"productId": "P0004", "qty": 3}])  # only 2 left
    assert r.status_code == 409 and "Only 2 left" in r.json()["detail"]
    r = place(api, [{"productId": "P0013", "qty": 1}, {"productId": "P0006", "qty": 1}])
    assert r.status_code == 409
    assert stock_of(api, "P0013") == 11  # nothing was taken from stock


def test_validation_messages(api):
    bad = dict(CUSTOMER, phone="12345")
    r = place(api, [{"productId": "P0013", "qty": 1}], customer=bad)
    assert r.status_code == 422 and "10-digit" in r.json()["detail"]
    bad = dict(CUSTOMER, pincode="80")
    assert "PIN" in place(api, [{"productId": "P0013", "qty": 1}], customer=bad).json()["detail"]


def test_online_payment_success_and_failure(api):
    before = stock_of(api, "P0001")
    r = place(api, [{"productId": "P0001", "qty": 1}], method="upi", coupon="WELCOME10").json()
    oid = r["order"]["id"]
    assert r["payment"]["mode"] == "demo" and r["payment"]["amount"] == 2249 and r["order"]["status"] == "awaiting_payment"
    assert stock_of(api, "P0001") == before - 1  # held while the customer pays
    # not yet visible to admins
    assert oid not in [o["id"] for o in api.get("/api/admin/orders", headers=token(api)).json()]
    paid = api.post(f"/api/orders/{oid}/payment", json={"phone": "9876543210", "result": "success"}).json()
    assert paid["status"] == "placed" and paid["payment"]["status"] == "paid" and paid["payment"]["ref"].startswith("DEMO")
    assert oid in [o["id"] for o in api.get("/api/admin/orders", headers=token(api)).json()]

    r = place(api, [{"productId": "P0001", "qty": 1}], method="card").json()
    failed = api.post(f"/api/orders/{r['order']['id']}/payment", json={"phone": "9876543210", "result": "failed"}).json()
    assert failed["status"] == "cancelled" and failed["payment"]["status"] == "failed"
    assert stock_of(api, "P0001") == before - 1  # the failed order gave its piece back


def test_customer_cancel_restores_stock(api):
    before = stock_of(api, "P0018")
    oid = place(api, [{"productId": "P0018", "qty": 3}]).json()["order"]["id"]
    assert stock_of(api, "P0018") == before - 3
    r = api.post(f"/api/orders/{oid}/cancel", json={"phone": "9876543210"})
    assert r.status_code == 200 and r.json()["status"] == "cancelled" and not r.json()["canCancel"]
    assert stock_of(api, "P0018") == before
    assert api.post(f"/api/orders/{oid}/cancel", json={"phone": "9876543210"}).status_code == 409


# ------------------------------------------------------------------------------ admin
def test_login_and_roles(api):
    assert api.post("/api/admin/login", json={"username": "superadmin", "password": "wrong"}).status_code == 401
    assert api.get("/api/admin/orders").status_code == 401
    assert api.get("/api/admin/orders", headers={"Authorization": "Bearer junk"}).status_code == 401
    boss, neha = token(api), token(api, "neha")
    assert api.get("/api/admin/me", headers=neha).json()["role"] == "admin"
    assert "passwordHash" not in api.get("/api/admin/me", headers=neha).json()
    everything = api.get("/api/admin/orders", headers=boss).json()
    mine = api.get("/api/admin/orders", headers=neha).json()
    assert len(everything) == 7 and {o["assignedTo"] for o in mine} == {"A002"} and len(mine) == 3
    # an admin cannot open someone else's order, manage admins, see payments or reset the demo
    assert api.get("/api/admin/orders/PB10002", headers=neha).status_code == 404
    for method, path in [("get", "/api/admin/admins"), ("get", "/api/admin/payments"), ("get", "/api/admin/offers"), ("post", "/api/admin/demo/reset")]:
        assert getattr(api, method)(path, headers=neha).status_code == 403
    assert api.post("/api/admin/orders/PB10006/assign", json={"adminId": "A002"}, headers=neha).status_code in (403, 404)


def test_order_moves_step_by_step_to_delivered(api):
    boss = token(api)
    oid = place(api, [{"productId": "P0011", "qty": 1, "size": "M"}]).json()["order"]["id"]
    url = f"/api/admin/orders/{oid}/status"
    assert api.post(url, json={"status": "packed"}, headers=boss).status_code == 409  # cannot skip "confirmed"
    assert api.post(url, json={"status": "confirmed"}, headers=boss).json()["nextStatus"] == "packed"
    assert api.post(url, json={"status": "packed"}, headers=boss).status_code == 200
    assert api.post(url, json={"status": "dispatched"}, headers=boss).status_code == 422  # courier name required
    r = api.post(url, json={"status": "dispatched", "courier": "Test Courier", "awb": "TC123"}, headers=boss).json()
    assert r["courier"] == {"name": "Test Courier", "awb": "TC123"} and not r["canCancel"]
    assert api.post(url, json={"status": "cancelled"}, headers=boss).status_code == 409  # too late to cancel
    api.post(url, json={"status": "out"}, headers=boss)
    done = api.post(url, json={"status": "delivered"}, headers=boss).json()
    assert done["status"] == "delivered" and done["payment"]["status"] == "paid" and done["nextStatus"] is None
    public = api.get(f"/api/orders/{oid}", params={"phone": "9876543210"}).json()
    assert [t["status"] for t in public["timeline"]] == ["placed", "confirmed", "packed", "dispatched", "out", "delivered"]
    assert "by" not in public["timeline"][1] and "assignedTo" not in public  # staff names stay private


def test_assign_and_admin_scope(api):
    boss, neha, rohit = token(api), token(api, "neha"), token(api, "rohit")
    assert api.get("/api/admin/orders/PB10006", headers=rohit).status_code == 404  # unassigned
    r = api.post("/api/admin/orders/PB10006/assign", json={"adminId": "A003"}, headers=boss)
    assert r.status_code == 200 and r.json()["assignedName"] == "Rohit"
    assert api.post("/api/admin/orders/PB10006/status", json={"status": "confirmed"}, headers=rohit).status_code == 200
    assert api.post("/api/admin/orders/PB10006/status", json={"status": "packed"}, headers=neha).status_code == 404
    assert api.post("/api/admin/orders/PB10006/assign", json={"adminId": "NOPE"}, headers=boss).status_code == 422


def test_stock_report_and_purchases(api):
    boss = token(api)
    rows = {r["id"]: r for r in api.get("/api/admin/stock", headers=boss).json()}
    for r in rows.values():
        assert r["opening"] + r["received"] - r["sold"] == r["stock"], r["name"]
    assert rows["P0006"]["stock"] == 0 and rows["P0006"]["incoming"] == 8
    assert rows["P0002"]["received"] == 6 and rows["P0004"]["incoming"] == 12

    # part of PO-1002 arrives, then the rest
    r = api.post("/api/admin/purchases/PO-1002/receive", json={"quantities": {"P0006": 5}}, headers=boss).json()
    assert r == {"ok": True, "received": 5, "complete": False}
    assert stock_of(api, "P0006") == 5
    po = [p for p in api.get("/api/admin/purchases", headers=boss).json() if p["id"] == "PO-1002"][0]
    assert po["status"] == "partial" and po["items"][0]["name"] == "Green occasion saree"
    r = api.post("/api/admin/purchases/PO-1002/receive", json={"quantities": {"P0006": 99, "P0019": 60, "P0020": 25}}, headers=boss).json()
    assert r["complete"] and r["received"] == 3 + 60 + 25  # never more than was ordered
    assert stock_of(api, "P0006") == 8
    assert api.post("/api/admin/purchases/PO-1002/receive", json={"quantities": {"P0006": 1}}, headers=boss).status_code == 409

    # a new purchase from Surat
    body = {"supplier": "New supplier", "city": "Surat", "expectedOn": 1_900_000_000_000, "items": [{"productId": "P0001", "qty": 10}]}
    po = api.post("/api/admin/purchases", json=body, headers=token(api, "neha"))
    assert po.status_code == 201 and po.json()["id"] == "PO-1004" and po.json()["status"] == "ordered"
    assert api.post("/api/admin/purchases/PO-1004/status", json={"status": "transit"}, headers=boss).status_code == 200
    rows = {r["id"]: r for r in api.get("/api/admin/stock", headers=boss).json()}
    assert rows["P0001"]["incoming"] == 10
    for r in rows.values():
        assert r["opening"] + r["received"] - r["sold"] == r["stock"], r["name"]


def test_products_crud(api):
    neha = token(api, "neha")
    body = {"name": "New test saree", "category": "Sarees", "price": 1500, "mrp": 1200, "fabric": "Cotton", "stock": 4, "image": "https://example.com/a.jpg"}
    r = api.post("/api/admin/products", json=body, headers=neha)
    assert r.status_code == 201
    p = r.json()
    assert p["id"] == "P0021" and p["mrp"] == 1500 and p["sizes"] == ["Free size"] and p["stock"] == 4 and p["opening"] == 4
    assert api.get("/api/products").json()[0]["id"] == "P0021"  # newest first in the shop
    body.update(price=1400, stock=999)
    r = api.put("/api/admin/products/P0021", json=body, headers=neha).json()
    assert r["price"] == 1400 and r["stock"] == 4  # editing never changes stock
    api.post("/api/admin/products/P0021/active", json={"active": False}, headers=neha)
    assert api.get("/api/products/P0021").status_code == 404
    assert len(api.get("/api/admin/products", headers=neha).json()) == 21
    assert api.post("/api/admin/products", json=dict(body, name=""), headers=neha).status_code == 422


def test_offers_admins_dashboard_payments(api):
    boss = token(api)
    assert api.post("/api/admin/coupons", json={"code": "diwali 20", "percent": 20, "minTotal": 500}, headers=boss).json()["code"] == "DIWALI20"
    assert api.post("/api/admin/coupons", json={"code": "DIWALI20", "percent": 5}, headers=boss).status_code == 409
    api.post("/api/admin/coupons/WELCOME10/active", json={"active": False}, headers=boss)
    q = api.post("/api/cart/quote", json={"items": [{"productId": "P0001", "qty": 1}], "couponCode": "WELCOME10"}).json()
    assert not q["couponOk"]
    api.put("/api/admin/settings", json={"offerText": "New banner", "freeShipAbove": 5000}, headers=boss)
    assert api.get("/api/config").json()["offerText"] == "New banner"
    q = api.post("/api/cart/quote", json={"items": [{"productId": "P0001", "qty": 1}], "couponCode": "DIWALI20"}).json()
    assert q["discount"] == 500 and q["shipping"] == 60

    r = api.post("/api/admin/admins", json={"name": "Kiran", "username": "Kiran", "password": "secret12"}, headers=boss)
    assert r.status_code == 201 and r.json()["id"] == "A004" and r.json()["username"] == "kiran"
    assert api.post("/api/admin/admins", json={"name": "K", "username": "kiran", "password": "secret12"}, headers=boss).status_code in (409, 422)
    kiran = token(api, "kiran", "secret12")
    assert api.get("/api/admin/orders", headers=kiran).json() == []
    api.post("/api/admin/admins/A004/active", json={"active": False}, headers=boss)
    assert api.get("/api/admin/orders", headers=kiran).status_code == 401  # switched-off login stops working at once
    assert api.post("/api/admin/login", json={"username": "kiran", "password": "secret12"}).status_code == 403
    assert api.post("/api/admin/admins/A001/active", json={"active": False}, headers=boss).status_code == 409
    listing = {a["id"]: a for a in api.get("/api/admin/admins", headers=boss).json()}
    assert listing["A002"]["openOrders"] == 2 and listing["A003"]["openOrders"] == 2

    dash = api.get("/api/admin/dashboard", headers=boss).json()
    assert dash["newOrders"] == 1 and dash["toDispatch"] == 2 and dash["onTheWay"] == 2 and dash["delivered"] == 1
    assert dash["unassigned"] == 1 and len(dash["recent"]) == 6 and len(dash["incoming"]) == 2
    assert {p["name"] for p in dash["lowStock"]} >= {"Green occasion saree", "Blue and red soft saree"}
    neha_dash = api.get("/api/admin/dashboard", headers=token(api, "neha")).json()
    assert neha_dash["delivered"] == 1 and neha_dash["newOrders"] == 0

    pay = api.get("/api/admin/payments", headers=boss).json()
    assert pay["mode"] == "demo" and len(pay["rows"]) == 7 and pay["refunded"] == 2499
    assert pay["paid"] == sum(r["amount"] for r in pay["rows"] if r["status"] == "paid")

    assert api.post("/api/admin/demo/reset", headers=boss).status_code == 200
    assert api.get("/api/config").json()["offerText"].startswith("Festive offer")


def test_razorpay_signature_check():
    secret = "test_secret"
    good = hmac.new(secret.encode(), b"order_abc|pay_xyz", hashlib.sha256).hexdigest()
    assert logic.razorpay_signature_ok("order_abc", "pay_xyz", good, secret=secret)
    assert not logic.razorpay_signature_ok("order_abc", "pay_other", good, secret=secret)
    assert not logic.razorpay_signature_ok("order_abc", "pay_xyz", "", secret=secret)


def test_fresh_real_shop_gets_first_admin(monkeypatch):
    """DEMO_MODE=false with an empty database: settings, counters and the first super admin are created."""
    from app.config import settings
    from app.seed import DEMO_COLLECTIONS, bootstrap

    db = get_db()
    for name in DEMO_COLLECTIONS:
        db[name].delete_many({})
    monkeypatch.setattr(settings, "first_admin_username", "Owner1")
    monkeypatch.setattr(settings, "first_admin_password", "a-long-password")
    bootstrap(db)
    bootstrap(db)  # safe to run on every start
    assert db.admins.count_documents({}) == 1 and db.settings.count_documents({}) == 1
    with TestClient(app) as client:
        headers = token(client, "owner1", "a-long-password")
        assert client.get("/api/admin/me", headers=headers).json()["role"] == "super"
        assert client.get("/api/products").json() == []
