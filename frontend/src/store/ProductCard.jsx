import { Link } from "react-router-dom";
import { Img } from "../components.jsx";
import { money, offPercent } from "../lib/format.js";
import { useStore } from "./StoreContext.jsx";

export function Price({ product }) {
  const off = offPercent(product);
  return (
    <div className="price">
      <b>{money(product.price)}</b>
      {off > 0 && <s>{money(product.mrp)}</s>}
      {off > 0 && <span className="off">{off}% off</span>}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { config } = useStore();
  const out = product.stock <= 0;
  const low = !out && product.stock <= 3;
  const freeDelivery = config && product.price >= config.freeShipAbove;
  return (
    <Link className="pcard" to={`/product/${product.id}`}>
      <div className="ph">
        <Img src={product.image} w={500} alt={product.name} />
        {out && <span className="tag tag-out">Out of stock</span>}
      </div>
      <div className="pcard-name">{product.name}</div>
      <Price product={product} />
      {low ? <div className="pcard-note low">Only {product.stock} left</div> : freeDelivery && !out ? <div className="pcard-note">Free delivery</div> : null}
    </Link>
  );
}

export const ProductGrid = ({ products }) => (
  <div className="grid">
    {products.map((p) => <ProductCard key={p.id} product={p} />)}
  </div>
);
