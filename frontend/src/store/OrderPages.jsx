// Order tracking for customers: one order (with the delivery tracker) and the list of orders placed from this browser.
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ConfirmButton, ErrorNote, Img, Loading, PayBadge, StatusBadge } from "../components.jsx";
import { api } from "../lib/api.js";
import { fmtDate, fmtDateTime, money, PAY_METHOD, STATUSES, useAsync, useInterval } from "../lib/format.js";
import { myOrders } from "./StoreContext.jsx";

const cleanPhone = (v) => v.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

function Tracker({ order }) {
  const reached = Object.fromEntries(order.timeline.map((t) => [t.status, t.at]));
  if (order.status === "cancelled") {
    const end = order.timeline[order.timeline.length - 1] || {};
    return (
      <ul className="track">
        {reached.placed && <li className="done"><b>Order placed</b><small>{fmtDateTime(reached.placed)}</small></li>}
        <li className="done cancelled now"><b>Cancelled</b><small>{fmtDateTime(end.at)}{end.note ? `. ${end.note}` : ""}</small></li>
      </ul>
    );
  }
  return (
    <ul className="track">
      {STATUSES.map((s) => {
        const done = Boolean(reached[s.key]);
        return (
          <li key={s.key} className={`${done ? "done" : ""}${order.status === s.key ? " now" : ""}`}>
            <b>{s.label}</b>
            <small>
              {done ? fmtDateTime(reached[s.key]) : "Not yet"}
              {s.key === "dispatched" && done && order.courier ? `. ${order.courier.name}${order.courier.awb ? `, tracking no. ${order.courier.awb}` : ""}` : ""}
            </small>
          </li>
        );
      })}
    </ul>
  );
}

function TrackForm({ initialId = "" }) {
  const navigate = useNavigate();
  const [id, setId] = useState(initialId);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    const p = cleanPhone(phone);
    if (!id.trim()) return setError("Enter your order number, for example PB10012.");
    if (!/^[6-9]\d{9}$/.test(p)) return setError("Enter the 10-digit mobile number used for the order.");
    navigate(`/order/${id.trim().toUpperCase()}?phone=${p}`);
  };
  return (
    <form className="panel" onSubmit={submit} noValidate>
      <h2>Track an order</h2>
      <div className="form-grid">
        <label className="field"><span>Order number</span><input value={id} onChange={(e) => setId(e.target.value)} placeholder="PB10012" /></label>
        <label className="field"><span>Mobile number</span><input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" /></label>
      </div>
      {error && <p className="form-error" style={{ marginTop: 12 }} role="alert">{error}</p>}
      <button className="btn" style={{ marginTop: 14 }} type="submit">Track order</button>
    </form>
  );
}

export function OrderPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const phone = params.get("phone") || myOrders.phoneFor(id);
  const justPlaced = params.get("placed") === "1";
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async (quiet) => {
    if (!phone) return;
    try {
      setOrder(await api(`/orders/${id}?phone=${encodeURIComponent(phone)}`));
      setError("");
    } catch (e) {
      if (!quiet) { setOrder(null); setError(e.message); }
    }
  }, [id, phone]);

  useEffect(() => { setOrder(null); setError(""); load(false); }, [load]);
  useInterval(useCallback(() => load(true), [load]), 12000); // pick up status changes made in the admin panel

  if (!phone || error) return (
    <div className="wrap" style={{ maxWidth: 640 }}>
      <h1 className="page-title">Find your order</h1>
      {error && <ErrorNote message={error} />}
      <div style={{ marginTop: 18 }}><TrackForm initialId={id} /></div>
    </div>
  );
  if (!order) return <Loading label="Loading your order" />;

  async function cancel() {
    try { setOrder(await api(`/orders/${id}/cancel`, { method: "POST", body: { phone } })); }
    catch (e) { setError(e.message); }
  }

  const paidOnline = order.payment.method !== "cod";
  return (
    <div className="wrap">
      {justPlaced && order.status !== "cancelled" && (
        <div className="placed-note" role="status">
          <b>Order placed. Thank you, {order.customer.name.split(" ")[0]}.</b>
          Your order number is {order.id}. Keep it with your mobile number to track the delivery.
        </div>
      )}
      <div className="order-head">
        <h1 className="page-title" style={{ paddingTop: 0 }}>Order {order.id}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="muted small">Placed on {fmtDateTime(order.createdAt)}</p>

      <div className="two-col">
        <div>
          <div className="panel">
            <h2>Delivery status</h2>
            <Tracker order={order} />
            {order.canCancel && (
              <div style={{ marginTop: 16 }}>
                <ConfirmButton label="Cancel this order" confirmLabel="Click again to cancel the order" onConfirm={cancel} />
              </div>
            )}
          </div>
          <div className="panel">
            <h2>Items</h2>
            {order.items.map((it) => (
              <div className="line" key={it.productId + it.size}>
                <Link className="ph" to={`/product/${it.productId}`}><Img src={it.image} w={200} alt="" /></Link>
                <div><div className="line-name">{it.name}</div><div className="line-meta">Size: {it.size} &middot; Qty {it.qty}</div></div>
                <b className="line-price">{money(it.price * it.qty)}</b>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="panel">
            <h2>Payment</h2>
            <div className="sum-row"><span>{PAY_METHOD[order.payment.method]}</span><PayBadge status={order.payment.status} /></div>
            {paidOnline && order.payment.ref && <p className="small muted">Reference {order.payment.ref}</p>}
            <div className="sum-row"><span>Items</span><span>{money(order.subtotal)}</span></div>
            {order.discount > 0 && <div className="sum-row"><span>Coupon {order.coupon}</span><span className="save">&minus; {money(order.discount)}</span></div>}
            <div className="sum-row"><span>Delivery</span><span>{order.shipping ? money(order.shipping) : "Free"}</span></div>
            <div className="sum-row total"><span>Total</span><span>{money(order.total)}</span></div>
          </div>
          <div className="panel">
            <h2>Delivering to</h2>
            <p><b>{order.customer.name}</b><br />{order.customer.address}<br />{order.customer.city}, {order.customer.state} {order.customer.pincode}<br />Mobile {order.customer.phone}</p>
          </div>
          <p style={{ marginTop: 16 }}><Link className="btn btn-line btn-block" to="/shop">Continue shopping</Link></p>
        </div>
      </div>
    </div>
  );
}

export function MyOrders() {
  const mine = myOrders.list();
  const { data: orders, loading } = useAsync(
    () => Promise.all(mine.map((m) => api(`/orders/${m.id}?phone=${m.phone}`).catch(() => null)))
      .then((list) => list.filter((o) => o && o.status !== "awaiting_payment" && o.payment.status !== "failed")),
    [],
  );
  return (
    <div className="wrap" style={{ maxWidth: 820 }}>
      <h1 className="page-title">My orders</h1>
      <div style={{ marginTop: 18, display: "grid", gap: 14 }}>
        {loading && !orders ? <Loading label="Loading your orders" />
          : orders.length === 0 ? <div className="panel muted">No orders have been placed from this phone or computer yet. Use the form below to track an order placed elsewhere.</div>
          : orders.map((o) => (
            <Link className="panel order-card" key={o.id} to={`/order/${o.id}`} style={{ marginTop: 0 }}>
              <div>
                <b>Order {o.id}</b>
                <div className="small muted">{fmtDate(o.createdAt)} &middot; {o.items.reduce((n, it) => n + it.qty, 0)} items &middot; {money(o.total)}</div>
              </div>
              <div className="thumbs">{o.items.slice(0, 3).map((it) => <div className="ph" key={it.productId + it.size}><Img src={it.image} w={120} alt="" /></div>)}</div>
              <StatusBadge status={o.status} />
            </Link>
          ))}
        <TrackForm />
      </div>
    </div>
  );
}
