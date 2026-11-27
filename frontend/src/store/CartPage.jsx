import { useState } from "react";
import { Link } from "react-router-dom";
import { ErrorNote, Img, Loading } from "../components.jsx";
import { api } from "../lib/api.js";
import { money, useAsync } from "../lib/format.js";
import { useStore } from "./StoreContext.jsx";

/** Ask the backend to price the cart. Prices, stock and coupons are always checked on the server. */
export function useQuote() {
  const { cart, coupon } = useStore();
  const key = JSON.stringify(cart) + "|" + coupon;
  return useAsync(
    () => (cart.length ? api("/cart/quote", { method: "POST", body: { items: cart, couponCode: coupon || null } }) : Promise.resolve(null)),
    [key],
  );
}

export function Summary({ quote }) {
  return (
    <>
      <div className="sum-row"><span>Items</span><span>{money(quote.subtotal)}</span></div>
      {quote.discount > 0 && <div className="sum-row"><span>Coupon {quote.coupon}</span><span className="save">&minus; {money(quote.discount)}</span></div>}
      <div className="sum-row"><span>Delivery</span><span>{quote.shipping ? money(quote.shipping) : <span className="save">Free</span>}</span></div>
      <div className="sum-row total"><span>Total</span><span>{money(quote.total)}</span></div>
    </>
  );
}

export default function CartPage() {
  const { cart, coupon, setCoupon, setQty, removeItem } = useStore();
  const { data: quote, error, loading, reload } = useQuote();
  const [code, setCode] = useState(coupon);

  if (!cart.length) return (
    <div className="wrap empty">
      <h1 className="page-title">Your cart is empty</h1>
      <p style={{ margin: "10px 0 18px" }}>Add a saree, a suit or some fabric to get started.</p>
      <Link className="btn" to="/shop">Go to the shop</Link>
    </div>
  );
  if (error) return <ErrorNote message={error} onRetry={reload} />;
  if (!quote) return <Loading label="Loading your cart" />;

  const blocked = quote.problems.length > 0;
  const toFree = quote.freeShipAbove - quote.subtotal;

  return (
    <div className="wrap">
      <h1 className="page-title">Your cart</h1>
      <div className="two-col">
        <div className="panel">
          {quote.lines.map((line) => (
            <div className="line" key={line.productId + line.size}>
              <Link className="ph" to={`/product/${line.productId}`}><Img src={line.image} w={200} alt="" /></Link>
              <div>
                <Link className="line-name" to={`/product/${line.productId}`}>{line.name}</Link>
                <div className="line-meta">Size: {line.size} &middot; {money(line.price)} each</div>
                {line.stock < line.qty && <div className="stock-note out small">{line.stock > 0 ? `Only ${line.stock} left` : "Out of stock"}</div>}
                <div className="line-tools">
                  <div className="qty">
                    <button type="button" onClick={() => setQty(line.productId, line.size, line.qty - 1)} aria-label={`Decrease quantity of ${line.name}`}>&minus;</button>
                    <span>{line.qty}</span>
                    <button type="button" onClick={() => setQty(line.productId, line.size, line.qty + 1)} disabled={line.qty >= line.stock} aria-label={`Increase quantity of ${line.name}`}>+</button>
                  </div>
                  <button type="button" className="link-btn small" onClick={() => removeItem(line.productId, line.size)}>Remove</button>
                </div>
              </div>
              <b className="line-price">{money(line.price * line.qty)}</b>
            </div>
          ))}
        </div>

        <div>
          <div className="panel">
            <h2>Coupon</h2>
            <form className="coupon" onSubmit={(e) => { e.preventDefault(); setCoupon(code.trim().toUpperCase()); }}>
              <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" />
              <button className="btn btn-line" type="submit">Apply</button>
            </form>
            {quote.couponMsg && <p className={`small ${quote.couponOk ? "save" : "stock-note out"}`} role="status" style={{ color: quote.couponOk ? "var(--ok)" : undefined }}>{quote.couponMsg}</p>}
            {coupon && <button type="button" className="link-btn small" onClick={() => { setCoupon(""); setCode(""); }}>Remove coupon</button>}
          </div>
          <div className="panel" style={{ opacity: loading ? 0.6 : 1 }}>
            <h2>Order summary</h2>
            <Summary quote={quote} />
            {toFree > 0 && <p className="small muted" style={{ marginTop: 8 }}>Add {money(toFree)} more for free delivery.</p>}
            {blocked && <p className="form-error" style={{ marginTop: 12 }} role="alert">{quote.problems[0]} Update the cart to continue.</p>}
            {blocked
              ? <button className="btn btn-block" style={{ marginTop: 14 }} disabled>Continue to checkout</button>
              : <Link className="btn btn-block" style={{ marginTop: 14 }} to="/checkout">Continue to checkout</Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
