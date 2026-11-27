# Prisha Boutique — e-commerce demo

A working online shop with an admin panel.

- **Frontend:** React 18 (Vite, React Router). Plain CSS, no UI library.
- **Backend:** Python, FastAPI.
- **Database:** MongoDB (PyMongo).

The shop is at `/`, the admin panel at `/admin`. The backend can serve the built
React app too, so the whole thing runs as one service.

## What it does

**Shop (customers)**
- Home, category pages, search, price filter, sorting
- Product page with sizes, quantity and live stock ("Only 2 left", "Out of stock")
- Cart with coupon codes, delivery charge and free delivery above a set amount
- Checkout with UPI / card / net banking / cash on delivery
- Order tracking: Order placed, Confirmed, Packed, Dispatched (courier and tracking number), Out for delivery, Delivered
- "My orders" for orders placed from the same browser, and tracking by order number + mobile number
- Customers can cancel until the order is dispatched

**Admin panel**
- Two roles. **Super admin** sees everything and creates admins. An **admin** sees only the orders assigned to them.
- New orders go to the admin with the fewest open orders (can be switched off); the super admin can reassign.
- Orders move one step at a time, each step is recorded with time and staff name.
- Products: add, edit, hide from the shop, photo link or photo upload.
- Stock and purchases: record goods ordered from a supplier (Surat, Ahmedabad, ...), expected date,
  receive them in full or in parts. Stock report per product: opening + received - sold = in stock, plus what is on the way.
- Payments list, coupons, offer banner, delivery charge settings.

Stock changes in only three ways: goods received (+), order placed (-), order cancelled or payment failed (+).
The "last piece" cannot be sold twice: stock is reduced with a conditional MongoDB update.

## Run it locally

You need Python 3.10+, Node 18+ and MongoDB (local, or a free MongoDB Atlas cluster).

```bash
# 1. Backend
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                   # then set MONGO_URL
uvicorn app.main:app --reload --port 8000

# 2. Frontend (second terminal)
cd frontend
npm install
npm run dev                                            # http://localhost:5173
```

`frontend/dist` (a production build) is included, so step 1 alone already serves
the full site at http://localhost:8000. Run `npm run build` after changing the frontend.

No MongoDB at hand? `pip install -r requirements-dev.txt` and start with
`MONGO_URL=memory://`. Data then lives in memory and is lost on restart.

### Demo logins

With `DEMO_MODE=true` the first start creates sample products, orders and purchases,
and the staff sign-in page lists these logins (password `demo123`, change it with `DEMO_ADMIN_PASSWORD`):

| Username | Role |
|---|---|
| `superadmin` | Super admin |
| `neha` | Admin |
| `rohit` | Admin |

The super admin's dashboard has **Reset demo data**. From a terminal: `python -m app.seed --reset`.

## Put it online

Simplest setup: one web service + MongoDB Atlas.

1. Create a free cluster on MongoDB Atlas, add a database user, allow network access, copy the connection string.
2. Deploy this repository as a web service (Render, Railway, a VPS):
   - **Build:** `cd frontend && npm ci && npm run build && cd ../backend && pip install -r requirements.txt`
   - **Start:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** `MONGO_URL`, `SECRET_KEY` (long random string), `DEMO_MODE=true` for the demo.
3. Open the service URL. `/` is the shop, `/admin` the admin panel.

A `Dockerfile` and `docker-compose.yml` are included for Docker-based hosting.
**They have not been run yet**, so check them on first use.

To host the frontend separately (Netlify, Vercel): build with `VITE_API_URL=https://your-api-host`
and add that site's address to `CORS_ORIGINS` on the backend.

## Before using it for a real shop

- `DEMO_MODE=false`, a real `SECRET_KEY`, and `FIRST_ADMIN_USERNAME` / `FIRST_ADMIN_PASSWORD` for the first super admin.
- Remove `<meta name="robots" content="noindex">` from `frontend/index.html`.
- Replace the sample products. Photos are stock photos loaded from Unsplash; product names, prices and descriptions are placeholders.
- **Payments.** With no keys, online payment uses a built-in test screen and no money moves.
  Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to switch to Razorpay: the server creates the Razorpay order,
  the browser opens Razorpay Checkout, and the server verifies the signature before confirming the order.
  This path has unit tests for the signature check but **has not been run against Razorpay's servers**; test it with Razorpay test keys first.
- Uploaded product photos are stored inside the product document (fine for a demo). Move them to S3 / Cloudinary for production.
- Not built yet: customer accounts and OTP login, refunds through the gateway, automatic release of orders
  abandoned on the payment screen, GST invoices, courier API integration, rate limiting, Android/iOS apps.

## Tests

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest -q
```

15 API tests cover pricing, coupons, stock, payment success and failure, order steps, roles, purchases and admin management.
They run on an in-memory stand-in for MongoDB (mongomock), so they need no database server.

## Layout

```
backend/app/
  main.py           app, error messages, serves the built frontend
  config.py         settings from environment variables
  db.py             MongoDB connection, collection list, id counters
  security.py       password hashing, login tokens, role checks
  schemas.py        request validation
  logic.py          pricing, coupons, stock, order steps, payments
  routes_store.py   public API for the shop
  routes_admin.py   admin API
  seed.py           sample data, first-run setup
backend/tests/      API tests
frontend/src/
  main.jsx          routes: "/" shop, "/admin" admin panel
  lib/              api.js (fetch wrapper), format.js (money, dates, hooks)
  components.jsx    shared building blocks
  store/            shop pages and cart
  admin/            admin pages
  styles/           base.css (design tokens), store.css, admin.css
```

API reference with every endpoint: start the backend and open `/docs`.

Fonts: Fraunces and Plus Jakarta Sans, self-hosted, SIL Open Font License.
