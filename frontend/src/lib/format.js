import { useCallback, useEffect, useState } from "react";

export const STATUSES = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "packed", label: "Packed" },
  { key: "dispatched", label: "Dispatched" },
  { key: "out", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];
const OTHER_STATUS = { cancelled: "Cancelled", awaiting_payment: "Awaiting payment" };
export const statusLabel = (key) => OTHER_STATUS[key] || (STATUSES.find((s) => s.key === key) || { label: key }).label;

export const PAY_METHOD = { upi: "UPI", card: "Card", netbanking: "Net banking", cod: "Cash on delivery" };
export const PAY_STATUS = { paid: "Paid", pending: "To collect", refunded: "Refunded", failed: "Failed", cancelled: "Cancelled" };
export const PO_STATUS = { ordered: "Ordered", transit: "In transit", partial: "Partly received", received: "Received", cancelled: "Cancelled" };

export const money = (n) => "₹" + Math.round(n || 0).toLocaleString("en-IN");
export const fmtDate = (t) => (t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
export const fmtDateTime = (t) =>
  t ? new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "—";
export const offPercent = (p) => (p.mrp > p.price ? Math.round((1 - p.price / p.mrp) * 100) : 0);

// Stock photos come from Unsplash, which resizes on request; other image links are used as they are.
export const imgUrl = (src, w = 600) =>
  !src ? "" : src.startsWith("https://images.unsplash.com/") ? `${src}?auto=format&fit=crop&q=70&w=${w}` : src;

/** Run an async loader, re-run when deps change or reload() is called. Keeps the old data on screen while reloading. */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: "", loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true }));
    loader()
      .then((data) => live && setState({ data, error: "", loading: false }))
      .catch((e) => live && setState({ data: null, error: e.message || "Something went wrong.", loading: false }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

/** Call fn every `ms` milliseconds while the page is visible (used to keep order screens fresh). */
export function useInterval(fn, ms) {
  useEffect(() => {
    const id = setInterval(() => { if (!document.hidden) fn(); }, ms);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ms]);
}
