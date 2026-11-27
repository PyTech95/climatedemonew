"""Request bodies. FastAPI validates every incoming request against these."""
import re
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator

PHONE = re.compile(r"^[6-9]\d{9}$")


def clean_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    if not PHONE.match(digits):
        raise ValueError("Enter a 10-digit mobile number.")
    return digits


class CartItem(BaseModel):
    productId: str
    size: str = Field(default="Free size", max_length=20)
    qty: int = Field(ge=1, le=50)


class QuoteIn(BaseModel):
    items: List[CartItem] = []
    couponCode: Optional[str] = None


class Customer(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    phone: str
    address: str = Field(min_length=5, max_length=300)
    city: str = Field(min_length=2, max_length=60)
    state: str = Field(min_length=2, max_length=60)
    pincode: str

    @field_validator("phone")
    @classmethod
    def _phone(cls, v):
        return clean_phone(v)

    @field_validator("pincode")
    @classmethod
    def _pincode(cls, v):
        if not re.fullmatch(r"\d{6}", (v or "").strip()):
            raise ValueError("Enter a 6-digit PIN code.")
        return v.strip()


class OrderIn(BaseModel):
    customer: Customer
    items: List[CartItem] = Field(min_length=1)
    couponCode: Optional[str] = None
    payMethod: Literal["upi", "card", "netbanking", "cod"]


class PaymentIn(BaseModel):
    phone: str
    result: Literal["success", "failed"] = "success"  # used by the test payment screen
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None


class PhoneIn(BaseModel):
    phone: str


class LoginIn(BaseModel):
    username: str
    password: str


class StatusIn(BaseModel):
    status: Literal["confirmed", "packed", "dispatched", "out", "delivered", "cancelled"]
    courier: Optional[str] = Field(default=None, max_length=60)
    awb: Optional[str] = Field(default=None, max_length=40)
    note: Optional[str] = Field(default=None, max_length=200)


class AssignIn(BaseModel):
    adminId: Optional[str] = None


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: str = Field(min_length=2, max_length=40)
    price: int = Field(ge=1, le=10_000_000)
    mrp: int = Field(ge=0, le=10_000_000)
    fabric: str = Field(default="", max_length=80)
    desc: str = Field(default="", max_length=2000)
    sizes: List[str] = []
    image: str = Field(default="", max_length=600_000)  # a URL, or a small uploaded photo as a data: URL
    stock: int = Field(default=0, ge=0, le=100_000)  # opening stock, used only when the product is created
    active: bool = True


class PurchaseItemIn(BaseModel):
    productId: str
    qty: int = Field(ge=1, le=100_000)


class PurchaseIn(BaseModel):
    supplier: str = Field(min_length=2, max_length=80)
    city: str = Field(default="", max_length=60)
    expectedOn: int
    note: str = Field(default="", max_length=200)
    items: List[PurchaseItemIn] = Field(min_length=1)


class PurchaseStatusIn(BaseModel):
    status: Literal["ordered", "transit", "cancelled"]


class ReceiveIn(BaseModel):
    quantities: Dict[str, int]


class CouponIn(BaseModel):
    code: str = Field(min_length=3, max_length=20)
    percent: int = Field(ge=1, le=90)
    minTotal: int = Field(default=0, ge=0)


class ActiveIn(BaseModel):
    active: bool


class SettingsIn(BaseModel):
    offerText: Optional[str] = Field(default=None, max_length=200)
    freeShipAbove: Optional[int] = Field(default=None, ge=0)
    shipFee: Optional[int] = Field(default=None, ge=0)
    autoAssign: Optional[bool] = None


class AdminIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    username: str = Field(min_length=3, max_length=30, pattern=r"^[A-Za-z0-9._-]+$")
    password: str = Field(min_length=6, max_length=100)
