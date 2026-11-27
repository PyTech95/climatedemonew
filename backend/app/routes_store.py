"""Public API used by the shop (no login)."""
import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from . import logic
from .config import settings
from .db import get_db, out
from .schemas import OrderIn, PaymentIn, PhoneIn, QuoteIn, clean_phone
from .seed import CATEGORIES, SIZES

router = APIRouter(prefix="/api", tags=["shop"])

PUBLIC_PRODUCT = {"opening": 0}  # everything except the opening-stock figure


def _order_for(order_id: str, phone: str) -> dict:
    """Customers open an order with its number plus the mobile number used at checkout."""
    try:
        phone = clean_phone(phone)
    except ValueError as e:
        raise HTTPException(422, str(e))
    order = get_db().orders.find_one({"_id": order_id.strip().upper()})
    if not order or order["customer"]["phone"] != phone:
        raise HTTPException(404, "No order matches that order number and mobile number.")
    return order


@router.get("/config")
def config():
    db = get_db()
    s = logic.store_settings(db)
    cfg = {
        "storeName": "Prisha Boutique", "demo": settings.demo_mode, "categories": CATEGORIES, "sizes": SIZES,
        "offerText": s["offerText"], "freeShipAbove": s["freeShipAbove"], "shipFee": s["shipFee"],
        "payment": {"mode": "razorpay" if settings.razorpay_enabled else "demo", "keyId": settings.razorpay_key_id},
    }
    if settings.demo_mode:  # shown on the admin login page so the demo can be tried
        cfg["demoLogins"] = [
            {"label": f"{a['name']} ({'super admin' if a['role'] == 'super' else 'admin'})", "username": a["username"],
             "password": settings.demo_admin_password}
            for a in db.admins.find({"_id": {"$in": ["A001", "A002", "A003"]}}).sort("_id", 1)
        ]
    return cfg


@router.get("/products")
def list_products(
    category: Optional[str] = None,
    q: Optional[str] = Query(default=None, max_length=60),
    sort: str = "new",
    max_price: Optional[int] = Query(default=None, ge=0),
    limit: int = Query(default=60, ge=1, le=100),
):
    query = {"active": True}
    if category:
        query["category"] = category
    if q and q.strip():
        query["name"] = {"$regex": re.escape(q.strip()), "$options": "i"}
    if max_price is not None:
        query["price"] = {"$lte": max_price}
    order = {"new": [("createdAt", -1)], "price_low": [("price", 1)], "price_high": [("price", -1)],
             "popular": [("sold", -1)]}.get(sort, [("createdAt", -1)])
    cursor = get_db().products.find(query, PUBLIC_PRODUCT).sort(order).limit(limit)
    return [out(p) for p in cursor]


@router.get("/products/{product_id}")
def get_product(product_id: str):
    p = get_db().products.find_one({"_id": product_id, "active": True}, PUBLIC_PRODUCT)
    if not p:
        raise HTTPException(404, "This product is not available.")
    return out(p)


@router.post("/cart/quote")
def cart_quote(body: QuoteIn):
    return logic.quote(get_db(), body.items, body.couponCode)


@router.post("/orders", status_code=201)
def place_order(body: OrderIn):
    order = logic.create_order(get_db(), body)
    result = {"order": logic.public_order(order), "payment": None}
    if order["status"] == "awaiting_payment":
        pay = order["payment"]
        result["payment"] = {
            "mode": pay["gateway"], "amount": order["total"],
            "keyId": settings.razorpay_key_id if pay["gateway"] == "razorpay" else "",
            "gatewayOrderId": pay["gatewayOrderId"],
        }
    return result


@router.post("/orders/{order_id}/payment")
def settle_payment(order_id: str, body: PaymentIn):
    order = _order_for(order_id, body.phone)
    return logic.public_order(logic.settle_payment(get_db(), order, body))


@router.get("/orders/{order_id}")
def track_order(order_id: str, phone: str):
    return logic.public_order(_order_for(order_id, phone))


@router.post("/orders/{order_id}/cancel")
def cancel_order(order_id: str, body: PhoneIn):
    order = _order_for(order_id, body.phone)
    return logic.public_order(logic.change_status(get_db(), order, "cancelled", "Customer", note="Cancelled by customer"))
