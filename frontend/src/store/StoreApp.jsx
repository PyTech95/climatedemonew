// The customer-facing shop: header, category bar, footer and the page routes.
import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Logo } from "../components.jsx";
import { StoreProvider, useStore } from "./StoreContext.jsx";
import Home from "./Home.jsx";
import Shop from "./Shop.jsx";
import ProductPage from "./ProductPage.jsx";
import CartPage from "./CartPage.jsx";
import Checkout from "./Checkout.jsx";
import { MyOrders, OrderPage } from "./OrderPages.jsx";

const BagIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);
const BoxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
);

function Header() {
  const { config, count } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") || "");
  useEffect(() => { setQ(params.get("q") || ""); }, [params]);
  const onShop = location.pathname === "/shop";
  const activeCat = onShop ? params.get("category") || "" : null;

  return (
    <>
      {config?.demo && <div className="demo-strip">Demo store. Products, prices and orders are samples, and no real payment is taken.</div>}
      <header className="hdr">
        <div className="wrap hdr-row">
          <Logo />
          <form className="search" role="search" onSubmit={(e) => { e.preventDefault(); navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : "/shop"); }}>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search sarees, lehengas, suits" aria-label="Search products" />
            <button type="submit">Search</button>
          </form>
          <nav className="hdr-links" aria-label="Account">
            <Link className="hdr-link" to="/orders"><BoxIcon /><span className="label">My orders</span></Link>
            <Link className="hdr-link" to="/cart" aria-label={`Cart, ${count} items`}><BagIcon /><span className="label">Cart</span>{count > 0 && <span className="cart-count">{count}</span>}</Link>
          </nav>
        </div>
        <nav className="cats-nav" aria-label="Categories">
          <div className="wrap">
            <Link className={`chip${activeCat === "" && !params.get("q") ? " is-on" : ""}`} to="/shop">All</Link>
            {(config?.categories || []).map((c) => (
              <Link key={c} className={`chip${activeCat === c ? " is-on" : ""}`} to={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div>
          <b>Prisha Boutique</b>
          <div className="muted">Sarees, lehengas, suits and fabrics.</div>
        </div>
        <nav aria-label="Footer">
          <Link to="/shop">Shop</Link>
          <Link to="/orders">My orders</Link>
          <Link to="/orders">Track an order</Link>
          <Link to="/admin">Staff login</Link>
        </nav>
      </div>
    </footer>
  );
}

function NotFound() {
  return (
    <div className="wrap empty">
      <h1 className="page-title">This page does not exist</h1>
      <p style={{ marginTop: 12 }}><Link className="btn" to="/shop">Go to the shop</Link></p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]); // braces matter: scrollTo can return a Promise, and an effect must not
  return null;
}

export default function StoreApp() {
  return (
    <StoreProvider>
      <div className="shop">
        <ScrollToTop />
        <Header />
        <main>
          <Routes>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="order/:id" element={<OrderPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </StoreProvider>
  );
}
