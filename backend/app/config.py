"""Settings, read from environment variables (see .env.example)."""
import os
from pathlib import Path

try:  # optional: load backend/.env during local development
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:  # pragma: no cover
    pass

REPO_ROOT = Path(__file__).resolve().parent.parent.parent


def _flag(name: str, default: str) -> bool:
    return os.getenv(name, default).strip().lower() in ("1", "true", "yes", "on")


class Settings:
    # MongoDB. "memory://" runs on an in-memory stand-in (tests / quick preview, data is lost on restart).
    mongo_url: str = os.getenv("MONGO_URL", "mongodb://localhost:27017")
    mongo_db: str = os.getenv("MONGO_DB", "prisha_boutique")

    # Admin login tokens
    secret_key: str = os.getenv("SECRET_KEY", "change-me-before-going-live-use-a-long-random-string")
    token_hours: int = int(os.getenv("TOKEN_HOURS", "12"))

    # Demo mode: sample data is created on first start, the login page lists the demo
    # logins, and the super admin can reset the data. Switch off for a real shop.
    demo_mode: bool = _flag("DEMO_MODE", "true")
    demo_admin_password: str = os.getenv("DEMO_ADMIN_PASSWORD", "demo123")

    # Real shop (DEMO_MODE=false): the first super admin is created from these when the database has no admins.
    first_admin_username: str = os.getenv("FIRST_ADMIN_USERNAME", "").strip()
    first_admin_password: str = os.getenv("FIRST_ADMIN_PASSWORD", "")

    # Payments. Leave both empty for the built-in test payment screen.
    razorpay_key_id: str = os.getenv("RAZORPAY_KEY_ID", "").strip()
    razorpay_key_secret: str = os.getenv("RAZORPAY_KEY_SECRET", "").strip()

    # Browser origins allowed to call the API (only needed when the frontend is hosted separately)
    cors_origins: list = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

    # Built React app. When this folder exists the backend serves the website too.
    frontend_dist: Path = Path(os.getenv("FRONTEND_DIST", str(REPO_ROOT / "frontend" / "dist")))

    @property
    def razorpay_enabled(self) -> bool:
        return bool(self.razorpay_key_id and self.razorpay_key_secret)


settings = Settings()
