"""Sample data for the demo.

    python -m app.seed            create the sample data if the database is empty
    python -m app.seed --reset    wipe the demo collections and create them again
"""
import sys

from .config import settings
from .db import ensure_indexes, get_db, now_ms
from .security import hash_password

DAY = 86_400_000
HOUR = 3_600_000
PHOTO = "https://images.unsplash.com/photo-"  # stock photos (Unsplash licence), stand-ins for real product photos

STATUS_KEYS = ["placed", "confirmed", "packed", "dispatched", "out", "delivered"]
CATEGORIES = ["Sarees", "Lehengas", "Suits & Kurtis", "Bridal", "Dupattas & Fabrics"]
SIZES = {
    "Sarees": ["Free size"],
    "Lehengas": ["S", "M", "L", "XL"],
    "Suits & Kurtis": ["S", "M", "L", "XL", "XXL"],
    "Bridal": ["Free size"],
    "Dupattas & Fabrics": ["Free size"],
}

# name, category, price, MRP, photo id, fabric, opening stock, sold so far
PRODUCTS = [
    ("Red and brown woven saree", "Sarees", 2499, 3499, "1610030469839-f909584b43f1", "Silk blend", 12, 5),
    ("Blue saree with yellow border", "Sarees", 2899, 3999, "1610189013429-a703f4b245cf", "Silk blend", 10, 7),
    ("Red and yellow festive saree", "Sarees", 1999, 2799, "1609748341932-f0206c09412b", "Georgette", 14, 9),
    ("Blue and red soft saree", "Sarees", 1499, 1999, "1609748513078-9ff6232781c5", "Cotton blend", 15, 13),
    ("Yellow and blue light saree", "Sarees", 1299, 1799, "1706943262454-84ee74854346", "Cotton", 20, 6),
    ("Green occasion saree", "Sarees", 3499, 4799, "1679006831648-7c9ea12e5807", "Silk", 6, 6),
    ("Red and gold lehenga set", "Lehengas", 6999, 9499, "1610047614256-023d7c028d0b", "Embroidered", 5, 2),
    ("Blue and gold lehenga set", "Lehengas", 5499, 7499, "1610202631408-fa6ba0f39ca3", "Embroidered", 4, 1),
    ("White and pink floral set", "Lehengas", 3999, 5499, "1609748340878-c690e3e4706b", "Organza", 6, 3),
    ("Blue and white floral set", "Lehengas", 3499, 4499, "1610189025857-f42fe6e8dd91", "Printed", 6, 2),
    ("Red kurta with floral dupatta", "Suits & Kurtis", 1199, 1699, "1759840278381-bf7d5e332050", "Cotton", 18, 11),
    ("Pink suit set", "Suits & Kurtis", 1799, 2499, "1780504863283-3157e6d141e1", "Rayon", 12, 4),
    ("Printed red kurti", "Suits & Kurtis", 699, 999, "1760287364328-e30221615f2e", "Cotton", 25, 14),
    ("Red festive suit", "Suits & Kurtis", 2199, 2999, "1759840278862-ef629e9b0f64", "Silk blend", 8, 5),
    ("Pink and orange bridal saree", "Bridal", 8999, 11999, "1617627143750-d86bc21e42bb", "Silk with zari border", 3, 1),
    ("Red and white bridal set", "Bridal", 12499, 15999, "1610047614222-d33c39abfab2", "Made to order", 2, 0),
    ("Classic red saree", "Bridal", 4499, 5999, "1646979200020-941e1deb2670", "Silk", 7, 3),
    ("Bandhani dupatta", "Dupattas & Fabrics", 499, 699, "1581793000997-b74e1d6ba85f", "Tie-dye cotton", 30, 12),
    ("Cotton running fabric (per metre)", "Dupattas & Fabrics", 149, 199, "1630920501459-f3e99320c4a5", "Cotton", 120, 46),
    ("Blouse fabric piece", "Dupattas & Fabrics", 249, 349, "1545042746-ec9e5a59b359", "Assorted shades", 40, 15),
]

# id, supplier, city, ordered (days ago), expected (days from now), status, note, items (product no., qty, received)
PURCHASES = [
    ("PO-1001", "Saree supplier (sample)", "Surat", 12, -6, "received", "", [(2, 6, 6), (18, 20, 20)]),
    ("PO-1002", "Fabric supplier (sample)", "Ahmedabad", 3, 2, "transit", "Transport booked", [(6, 8, 0), (19, 60, 0), (20, 25, 0)]),
    ("PO-1003", "Saree supplier (sample)", "Surat", 1, 6, "ordered", "", [(4, 12, 0), (14, 6, 0), (16, 2, 0)]),
]

# id, hours ago, status, admin, customer, city, items (product no., size, qty), payment method, coupon
ORDERS = [
    ("PB10001", 120, "delivered", "A002", "Priya Sharma", "Patna", [(13, "M", 2), (18, "Free size", 1)], "upi", None),
    ("PB10002", 48, "out", "A003", "Anjali Verma", "Gaya", [(3, "Free size", 1)], "card", "WELCOME10"),
    ("PB10003", 26, "dispatched", "A002", "Kavita Singh", "Ranchi", [(11, "L", 1), (20, "Free size", 2)], "cod", None),
    ("PB10004", 8, "packed", "A003", "Sunita Devi", "Patna", [(7, "M", 1)], "netbanking", None),
    ("PB10005", 3, "confirmed", "A002", "Ritu Kumari", "Bhagalpur", [(5, "Free size", 1), (19, "Free size", 3)], "upi", None),
    ("PB10006", 0.5, "placed", None, "Pooja Gupta", "Darbhanga", [(12, "S", 1)], "cod", None),
    ("PB10007", 30, "cancelled", "A003", "Meena Jha", "Patna", [(1, "Free size", 1)], "upi", None),
]

ADMINS = [("A001", "Owner", "superadmin", "super"), ("A002", "Neha", "neha", "admin"), ("A003", "Rohit", "rohit", "admin")]

DEMO_COLLECTIONS = ["products", "orders", "purchases", "admins", "coupons", "settings", "counters"]


def pid(n: int) -> str:
    return f"P{n:04d}"


def build(now: int) -> dict:
    products = {}
    for i, (name, cat, price, mrp, photo, fabric, opening, sold) in enumerate(PRODUCTS, start=1):
        products[pid(i)] = {
            "_id": pid(i), "name": name, "category": cat, "price": price, "mrp": mrp, "image": PHOTO + photo,
            "fabric": fabric, "sizes": list(SIZES[cat]),
            "desc": "Sample description. Replace with the real details: fabric, work, length, blouse piece, wash care.",
            "opening": opening, "sold": sold, "stock": opening - sold, "active": True,
            "createdAt": now - (i * 2 - 1) * DAY,
        }

    purchases = []
    for po_id, supplier, city, ordered_ago, expected_in, status, note, items in PURCHASES:
        lines = [{"productId": pid(n), "qty": qty, "received": rec} for n, qty, rec in items]
        for line in lines:
            products[line["productId"]]["stock"] += line["received"]
        purchases.append({
            "_id": po_id, "supplier": supplier, "city": city, "orderedOn": now - ordered_ago * DAY,
            "expectedOn": now + expected_in * DAY, "receivedOn": now + expected_in * DAY if status == "received" else None,
            "status": status, "note": note, "items": lines,
        })

    admin_name = {a[0]: a[1] for a in ADMINS}
    orders = []
    for n, (oid, hours_ago, status, admin, customer, city, items, method, coupon) in enumerate(ORDERS):
        created = int(now - hours_ago * HOUR)
        lines = []
        for num, size, qty in items:
            p = products[pid(num)]
            lines.append({"productId": p["_id"], "name": p["name"], "image": p["image"], "size": size, "qty": qty, "price": p["price"]})
        subtotal = sum(line["price"] * line["qty"] for line in lines)
        discount = round(subtotal * 0.10) if coupon else 0
        shipping = 0 if subtotal >= 999 else 60
        cancelled = status == "cancelled"
        upto = 1 if cancelled else STATUS_KEYS.index(status)
        gap = (now - created) / (upto + 1.5)
        timeline = [
            {"status": STATUS_KEYS[k], "at": int(created + gap * k), "by": "Customer" if k == 0 else admin_name[admin], "note": ""}
            for k in range(upto + 1)
        ]
        if cancelled:
            timeline.append({"status": "cancelled", "at": int(created + gap * 2), "by": admin_name[admin], "note": "Cancelled on customer request"})
        cod = method == "cod"
        orders.append({
            "_id": oid, "createdAt": created,
            "customer": {"name": customer, "phone": f"90000000{10 + n}", "address": f"House {12 + n * 7}, Sample Colony",
                         "city": city, "state": "Bihar", "pincode": f"8000{10 + n}"},
            "items": lines, "subtotal": subtotal, "discount": discount, "coupon": coupon, "shipping": shipping,
            "total": subtotal - discount + shipping,
            "payment": {"method": method, "gateway": "cod" if cod else "demo", "gatewayOrderId": "",
                        "status": "refunded" if cancelled else ("pending" if cod and status != "delivered" else "paid"),
                        "ref": "" if cod else f"DEMO{48213 + n * 977}"},
            "status": status, "timeline": timeline, "assignedTo": admin,
            "courier": {"name": "Sample Courier", "awb": f"SC{70012345 + n}"} if upto >= 3 and not cancelled else None,
        })

    password_hash = hash_password(settings.demo_admin_password)
    admins = [
        {"_id": aid, "name": name, "username": username, "passwordHash": password_hash, "role": role, "active": True,
         "createdAt": now - 30 * DAY}
        for aid, name, username, role in ADMINS
    ]

    return {
        "products": list(products.values()),
        "purchases": purchases,
        "orders": orders,
        "admins": admins,
        "coupons": [
            {"_id": "WELCOME10", "percent": 10, "minTotal": 999, "active": True},
            {"_id": "FESTIVE15", "percent": 15, "minTotal": 2999, "active": False},
        ],
        "settings": [{
            "_id": "store", "offerText": "Festive offer: use code WELCOME10 for 10% off on orders above ₹999.",
            "freeShipAbove": 999, "shipFee": 60, "autoAssign": True,
        }],
        "counters": [
            {"_id": "order", "seq": 10007}, {"_id": "purchase", "seq": 1003},
            {"_id": "product", "seq": len(PRODUCTS)}, {"_id": "admin", "seq": len(ADMINS)},
        ],
    }


def seed_database(db, reset: bool = False) -> bool:
    """Create the sample data. Returns True if anything was written."""
    if reset:
        for name in DEMO_COLLECTIONS:
            db[name].delete_many({})
    elif db.products.count_documents({}) or db.admins.count_documents({}):
        return False
    for name, docs in build(now_ms()).items():
        db[name].insert_many(docs)
    ensure_indexes(db)
    return True


def bootstrap(db) -> None:
    """Run at every start. Makes sure a fresh, non-demo database has what the app needs to work."""
    if not db.settings.find_one({"_id": "store"}):
        db.settings.insert_one({"_id": "store", "offerText": "", "freeShipAbove": 999, "shipFee": 60, "autoAssign": True})
    for name, start in (("order", 10000), ("purchase", 1000)):
        if not db.counters.find_one({"_id": name}):
            db.counters.insert_one({"_id": name, "seq": start})
    if settings.first_admin_username and settings.first_admin_password and db.admins.count_documents({}) == 0:
        db.counters.update_one({"_id": "admin"}, {"$set": {"seq": 1}}, upsert=True)
        db.admins.insert_one({
            "_id": "A001", "name": "Owner", "username": settings.first_admin_username.lower(),
            "passwordHash": hash_password(settings.first_admin_password), "role": "super", "active": True, "createdAt": now_ms(),
        })


if __name__ == "__main__":
    wrote = seed_database(get_db(), reset="--reset" in sys.argv)
    print("Sample data created." if wrote else "Database already has data. Use --reset to replace it.")
