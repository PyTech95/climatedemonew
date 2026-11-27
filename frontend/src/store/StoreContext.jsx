// Shop-wide state: store settings from the backend, the cart, and a small toast message.
// The cart, the customer's address and their order numbers are kept in this browser (localStorage),
// so a customer does not need an account.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const read = (key, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked: state still works for this visit */ }
};

export const savedCustomer = {
  get: () => read("prisha_customer", null),
  set: (customer) => write("prisha_customer", customer),
};

// Orders placed from this browser: [{ id, phone }]
export const myOrders = {
  list: () => read("prisha_my_orders", []),
  add: (id, phone) => write("prisha_my_orders", [{ id, phone }, ...myOrders.list().filter((o) => o.id !== id)].slice(0, 30)),
  phoneFor: (id) => (myOrders.list().find((o) => o.id === id) || {}).phone || "",
};

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [cart, setCart] = useState(() => read("prisha_cart", [])); // [{ productId, size, qty }]
  const [coupon, setCoupon] = useState(() => read("prisha_coupon", ""));
  const [toast, setToast] = useState("");

  useEffect(() => { api("/config").then(setConfig).catch(() => setConfig({ categories: [], offerText: "", freeShipAbove: 999, demo: false })); }, []);
  useEffect(() => { write("prisha_cart", cart); }, [cart]);
  useEffect(() => { write("prisha_coupon", coupon); }, [coupon]);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const same = (x, id, size) => x.productId === id && x.size === size;
    return {
      config, cart, coupon, setCoupon,
      count: cart.reduce((n, x) => n + x.qty, 0),
      notify: setToast,
      addToCart(product, size, qty) {
        setCart((c) => {
          const have = (c.find((x) => same(x, product.id, size)) || { qty: 0 }).qty;
          const next = Math.min(product.stock, have + qty); // never more than is in stock
          return have ? c.map((x) => (same(x, product.id, size) ? { ...x, qty: next } : x)) : [...c, { productId: product.id, size, qty: next }];
        });
        setToast(`${product.name} added to cart`);
      },
      setQty: (id, size, qty) => setCart((c) => c.map((x) => (same(x, id, size) ? { ...x, qty } : x)).filter((x) => x.qty > 0)),
      removeItem: (id, size) => setCart((c) => c.filter((x) => !same(x, id, size))),
      clearCart() { setCart([]); setCoupon(""); },
    };
  }, [config, cart, coupon]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </Ctx.Provider>
  );
}
