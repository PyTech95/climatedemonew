"""MongoDB connection and small helpers.

Collections
    products   _id "P0001"   name, category, price, mrp, image, fabric, desc, sizes[], opening, sold, stock, active, createdAt
    orders     _id "PB10001" customer{}, items[], subtotal, discount, coupon, shipping, total, payment{}, status, timeline[], assignedTo, courier
    purchases  _id "PO-1001" supplier, city, orderedOn, expectedOn, receivedOn, status, note, items[{productId, qty, received}]
    admins     _id "A001"    name, username, passwordHash, role ("super" | "admin"), active, createdAt
    coupons    _id code      percent, minTotal, active
    settings   _id "store"   offerText, freeShipAbove, shipFee, autoAssign
    counters   _id name      seq

All dates are stored as milliseconds since 1970 (UTC), the same number JavaScript's Date uses.
"""
import time

from pymongo import ASCENDING, DESCENDING, MongoClient, ReturnDocument

from .config import settings

_client = None


def get_db():
    global _client
    if _client is None:
        if settings.mongo_url.startswith("memory://"):
            import mongomock  # in-memory stand-in for tests and quick previews

            _client = mongomock.MongoClient()
        else:
            _client = MongoClient(settings.mongo_url, serverSelectionTimeoutMS=8000)
    return _client[settings.mongo_db]


def reset_client_for_tests():
    global _client
    _client = None


def ensure_indexes(db):
    db.admins.create_index([("username", ASCENDING)], unique=True)
    db.orders.create_index([("createdAt", DESCENDING)])
    db.orders.create_index([("assignedTo", ASCENDING), ("status", ASCENDING)])
    db.products.create_index([("category", ASCENDING), ("active", ASCENDING)])


def now_ms() -> int:
    return int(time.time() * 1000)


def next_seq(db, name: str) -> int:
    """Atomic running number, used for readable ids (PB10008, PO-1004, ...)."""
    doc = db.counters.find_one_and_update(
        {"_id": name}, {"$inc": {"seq": 1}}, upsert=True, return_document=ReturnDocument.AFTER
    )
    return doc["seq"]


def out(doc):
    """Mongo document -> API object: `_id` becomes `id`, secrets are dropped."""
    if doc is None:
        return None
    d = dict(doc)
    d["id"] = d.pop("_id")
    d.pop("passwordHash", None)
    return d
