import { Link } from "react-router-dom";
import { ErrorNote, Img, Loading } from "../components.jsx";
import { api } from "../lib/api.js";
import { money, useAsync } from "../lib/format.js";
import { ProductGrid } from "./ProductCard.jsx";
import { useStore } from "./StoreContext.jsx";

export default function Home() {
  const { config } = useStore();
  const { data: products, error, loading, reload } = useAsync(() => api("/products?limit=60"), []);

  if (loading && !products) return <Loading label="Opening the shop" />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;

  const newest = products.slice(0, 8); // the API returns newest first
  const popular = [...products].sort((a, b) => b.sold - a.sold).slice(0, 4);
  const categories = (config?.categories || []).map((name) => ({ name, product: products.find((p) => p.category === name) })).filter((c) => c.product);
  const heroPhotos = ["Sarees", "Lehengas", "Suits & Kurtis"].map((c) => products.find((p) => p.category === c)).filter(Boolean);

  return (
    <div className="wrap">
      <section className="hero">
        <div>
          <h1>Sarees, lehengas and suits, delivered to your door.</h1>
          <p>Pick a piece, pay online or on delivery, and follow your order from our shop to your home.</p>
          <div className="hero-actions">
            <Link className="btn" to="/shop">Shop new arrivals</Link>
            <Link className="btn btn-line" to="/orders">Track an order</Link>
          </div>
        </div>
        <div className="hero-photos">
          {heroPhotos.map((p, i) => (
            <Link key={p.id} className="ph" to={`/product/${p.id}`} aria-label={p.name}>
              <Img src={p.image} w={i === 0 ? 900 : 600} alt={p.name} eager />
            </Link>
          ))}
        </div>
      </section>

      {config?.offerText && <div className="offer">{config.offerText}</div>}

      <section className="section" aria-labelledby="cat-title">
        <div className="section-head"><h2 id="cat-title">Shop by category</h2></div>
        <div className="cat-tiles">
          {categories.map((c) => (
            <Link key={c.name} className="cat-tile" to={`/shop?category=${encodeURIComponent(c.name)}`}>
              <div className="ph"><Img src={c.product.image} w={400} alt="" /></div>
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="new-title">
        <div className="section-head">
          <h2 id="new-title">New arrivals</h2>
          <Link to="/shop">See all</Link>
        </div>
        <ProductGrid products={newest} />
      </section>

      <section className="section" aria-labelledby="pop-title">
        <div className="section-head">
          <h2 id="pop-title">Most bought</h2>
          <Link to="/shop?sort=popular">See all</Link>
        </div>
        <ProductGrid products={popular} />
      </section>

      <section className="section">
        <div className="assure">
          <div><b>Free delivery above {money(config?.freeShipAbove ?? 999)}</b>Smaller orders ship for {money(config?.shipFee ?? 60)}.</div>
          <div><b>Pay your way</b>UPI, card, net banking or cash on delivery.</div>
          <div><b>Track every step</b>See when your order is packed, dispatched and out for delivery.</div>
        </div>
      </section>
    </div>
  );
}
