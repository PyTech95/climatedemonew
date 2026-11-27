import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ErrorNote, Img, Loading } from "../components.jsx";
import { api } from "../lib/api.js";
import { money, useAsync } from "../lib/format.js";
import { Price } from "./ProductCard.jsx";
import { useStore } from "./StoreContext.jsx";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, config } = useStore();
  const { data: product, error, loading } = useAsync(() => api(`/products/${id}`), [id]);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [needSize, setNeedSize] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSize(product.sizes.length === 1 ? product.sizes[0] : ""); // one size: pick it for the customer
    setQty(1);
    setNeedSize(false);
  }, [product]);

  if (loading && !product) return <Loading label="Loading product" />;
  if (error) return (
    <div className="wrap">
      <ErrorNote message={error} />
      <p className="empty"><Link className="btn btn-line" to="/shop">Back to the shop</Link></p>
    </div>
  );

  const out = product.stock <= 0;
  const low = !out && product.stock <= 3;

  const add = (thenCheckout) => {
    if (!size) { setNeedSize(true); return; }
    addToCart(product, size, qty);
    if (thenCheckout) navigate("/checkout");
  };

  return (
    <div className="wrap pdp">
      <div className="ph"><Img src={product.image} w={1000} alt={product.name} eager /></div>
      <div>
        <p className="small muted"><Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link></p>
        <h1>{product.name}</h1>
        <div style={{ marginTop: 10 }}><Price product={product} /></div>
        <p className="small muted">Inclusive of all taxes. {product.price >= (config?.freeShipAbove ?? 999) ? "Free delivery." : `Delivery ${money(config?.shipFee ?? 60)}.`}</p>

        <div className="pdp-block">
          <b>Size</b>
          <div className="sizes" role="group" aria-label="Size">
            {product.sizes.map((s) => (
              <button key={s} type="button" className={`size${size === s ? " is-on" : ""}`} aria-pressed={size === s} onClick={() => { setSize(s); setNeedSize(false); }}>{s}</button>
            ))}
          </div>
          {needSize && <p className="stock-note out" role="alert">Choose a size first.</p>}
        </div>

        {!out && (
          <div className="pdp-block">
            <b>Quantity</b>
            <div className="qty">
              <button type="button" onClick={() => setQty((n) => n - 1)} disabled={qty <= 1} aria-label="Decrease quantity">&minus;</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((n) => n + 1)} disabled={qty >= product.stock} aria-label="Increase quantity">+</button>
            </div>
          </div>
        )}

        <p className={`stock-note ${out ? "out" : low ? "low" : "ok"}`}>
          {out ? "Out of stock. New stock is on the way." : low ? `Only ${product.stock} left in stock` : "In stock"}
        </p>

        <div className="pdp-actions">
          <button type="button" className="btn btn-line" disabled={out} onClick={() => add(false)}>Add to cart</button>
          <button type="button" className="btn" disabled={out} onClick={() => add(true)}>Buy now</button>
        </div>

        <ul className="facts">
          <li><span>Fabric</span><span>{product.fabric || "—"}</span></li>
          <li><span>Details</span><span>{product.desc}</span></li>
          <li><span>Payment</span><span>UPI, card, net banking or cash on delivery</span></li>
          <li><span>Cancellation</span><span>Free until the order is dispatched</span></li>
        </ul>
      </div>
    </div>
  );
}
