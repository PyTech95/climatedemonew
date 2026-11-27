import { Link, useSearchParams } from "react-router-dom";
import { ErrorNote, Loading } from "../components.jsx";
import { api } from "../lib/api.js";
import { money, useAsync } from "../lib/format.js";
import { ProductGrid } from "./ProductCard.jsx";

const PRICE_CAPS = [1000, 2500, 5000];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "";
  const q = params.get("q") || "";
  const sort = params.get("sort") || "new";
  const max = params.get("max") || "";

  const query = new URLSearchParams({ sort });
  if (category) query.set("category", category);
  if (q) query.set("q", q);
  if (max) query.set("max_price", max);
  const { data: products, error, loading, reload } = useAsync(() => api(`/products?${query}`), [query.toString()]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const title = q ? `Results for "${q}"` : category || "All products";

  return (
    <div className="wrap">
      <h1 className="page-title">{title}</h1>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="Filter by price">
          <button type="button" className={`chip${!max ? " is-on" : ""}`} onClick={() => setParam("max", "")}>Any price</button>
          {PRICE_CAPS.map((cap) => (
            <button key={cap} type="button" className={`chip${max === String(cap) ? " is-on" : ""}`} onClick={() => setParam("max", String(cap))}>
              Under {money(cap)}
            </button>
          ))}
        </div>
        <label>
          <span className="muted small">Sort by </span>
          <select value={sort} onChange={(e) => setParam("sort", e.target.value === "new" ? "" : e.target.value)} aria-label="Sort products">
            <option value="new">Newest first</option>
            <option value="popular">Most bought</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
          </select>
        </label>
      </div>

      {error ? <ErrorNote message={error} onRetry={reload} />
        : loading && !products ? <Loading label="Loading products" />
        : products.length === 0 ? (
          <div className="empty">
            <p>No products match these filters.</p>
            <Link className="btn btn-line" to="/shop">Show all products</Link>
          </div>
        ) : (
          <>
            <p className="muted small" style={{ marginBottom: 14 }}>{products.length} {products.length === 1 ? "product" : "products"}</p>
            <ProductGrid products={products} />
          </>
        )}
    </div>
  );
}
