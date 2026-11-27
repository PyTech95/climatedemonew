import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ConfirmButton, ErrorNote, Field, Img, Loading, PayBadge, StatusBadge } from "../components.jsx";
import { api } from "../lib/api.js";
import { fmtDateTime, money, PAY_METHOD, statusLabel, STATUSES, useAsync, useInterval } from "../lib/format.js";
import { PageHead, useAuth } from "./shared.jsx";

const TABS = [["all", "All"], ...STATUSES.map((s) => [s.key, s.key === "placed" ? "New" : s.label]), ["cancelled", "Cancelled"]];
const NEXT_ACTION = { confirmed: "Confirm order", packed: "Mark as packed", dispatched: "Mark as dispatched", out: "Mark as out for delivery", delivered: "Mark as delivered" };

export function OrdersList() {
  const { isSuper } = useAuth();
  const [params, setParams] = useSearchParams();
  const status = params.get("status") || "all";
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  useEffect(() => { const t = setTimeout(() => setQ(search.trim()), 300); return () => clearTimeout(t); }, [search]);

  const { data: orders, error, loading, reload } = useAsync(
    () => api(`/admin/orders?status=${status}${q ? `&q=${encodeURIComponent(q)}` : ""}`, { auth: true }),
    [status, q],
  );
  useInterval(useCallback(() => reload(), [reload]), 15000);

  return (
    <>
      <PageHead title="Orders" />
      <div className="adm-content">
        <div className="filter-row">
          <div className="tabs" role="group" aria-label="Filter by status">
            {TABS.map(([key, label]) => (
              <button key={key} type="button" className={`chip${status === key ? " is-on" : ""}`} onClick={() => setParams(key === "all" ? {} : { status: key })}>{label}</button>
            ))}
          </div>
          <input className="input" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Order no., name or mobile" aria-label="Search orders" />
        </div>
        {error ? <ErrorNote message={error} onRetry={reload} /> : loading && !orders ? <Loading label="Loading orders" /> : (
          <div className="card">
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th>Items</th><th className="num">Total</th><th>Payment</th><th>Status</th>{isSuper && <th>Admin</th>}</tr></thead>
                <tbody>
                  {orders.length === 0 && <tr><td colSpan={8} className="muted">{isSuper ? "No orders match this filter." : "No orders are assigned to you in this view."}</td></tr>}
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td><Link to={`/admin/orders/${o.id}`}>{o.id}</Link></td>
                      <td className="nowrap">{fmtDateTime(o.createdAt)}</td>
                      <td>{o.customer.name}<div className="small muted">{o.customer.phone} &middot; {o.customer.city}</div></td>
                      <td>{o.items.reduce((n, it) => n + it.qty, 0)}</td>
                      <td className="num">{money(o.total)}</td>
                      <td><PayBadge status={o.payment.status} /><div className="small muted">{PAY_METHOD[o.payment.method]}</div></td>
                      <td><StatusBadge status={o.status} /></td>
                      {isSuper && <td>{o.assignedName || <span className="badge badge-pending">Not assigned</span>}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { isSuper } = useAuth();
  const { data: order, error, loading, reload } = useAsync(() => api(`/admin/orders/${id}`, { auth: true }), [id]);
  const { data: admins } = useAsync(() => (isSuper ? api("/admin/admins", { auth: true }) : Promise.resolve([])), [isSuper]);
  const [courier, setCourier] = useState("");
  const [awb, setAwb] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function act(path, body) {
    setBusy(true);
    setActionError("");
    try { await api(`/admin/orders/${id}/${path}`, { method: "POST", body, auth: true }); reload(); }
    catch (e) { setActionError(e.message); }
    finally { setBusy(false); }
  }

  if (error) return (<><PageHead title="Order" /><div className="adm-content"><ErrorNote message={error} /><Link to="/admin/orders">Back to orders</Link></div></>);
  if (loading && !order) return <Loading label="Loading order" />;

  const next = order.nextStatus;
  const needsCourier = next === "dispatched";

  return (
    <>
      <PageHead title={`Order ${order.id}`}><Link className="btn btn-sm btn-quiet" to="/admin/orders">Back to orders</Link></PageHead>
      <div className="adm-content">
        <div className="cols-2">
          <div style={{ display: "grid", gap: 18 }}>
            <div className="card">
              <div className="card-head"><h2>Status</h2><StatusBadge status={order.status} /></div>
              <div className="card-body" style={{ display: "grid", gap: 16 }}>
                {next && (
                  <form className="action-box" onSubmit={(e) => { e.preventDefault(); act("status", { status: next, courier, awb }); }}>
                    <b>Next step: {statusLabel(next)}</b>
                    {needsCourier && (
                      <div className="form-grid">
                        <Field label="Courier name"><input value={courier} onChange={(e) => setCourier(e.target.value)} placeholder="Courier or transport" /></Field>
                        <Field label="Tracking number" hint="Optional"><input value={awb} onChange={(e) => setAwb(e.target.value)} /></Field>
                      </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      <button className="btn btn-sm" type="submit" disabled={busy}>{NEXT_ACTION[next]}</button>
                      {order.canCancel && <ConfirmButton label="Cancel order" confirmLabel="Click again to cancel and restock" disabled={busy} onConfirm={() => act("status", { status: "cancelled", note: "Cancelled by the shop" })} />}
                    </div>
                  </form>
                )}
                {actionError && <p className="form-error" role="alert">{actionError}</p>}
                <ul className="timeline">
                  {[...order.timeline].reverse().map((t, i) => (
                    <li key={i}>
                      <StatusBadge status={t.status} /><span>{fmtDateTime(t.at)} by {t.by}</span>
                      {t.note && <small>{t.note}</small>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h2>Items</h2><span className="muted small">Stock was reduced when the order was placed</span></div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Product</th><th>Size</th><th className="num">Qty</th><th className="num">Price</th><th className="num">Amount</th></tr></thead>
                  <tbody>
                    {order.items.map((it) => (
                      <tr key={it.productId + it.size}>
                        <td><div className="cell-product"><div className="ph"><Img src={it.image} w={120} alt="" /></div>{it.name}</div></td>
                        <td>{it.size}</td><td className="num">{it.qty}</td><td className="num">{money(it.price)}</td><td className="num">{money(it.price * it.qty)}</td>
                      </tr>
                    ))}
                    <tr><td colSpan={4} className="num muted">Items</td><td className="num">{money(order.subtotal)}</td></tr>
                    {order.discount > 0 && <tr><td colSpan={4} className="num muted">Coupon {order.coupon}</td><td className="num">&minus; {money(order.discount)}</td></tr>}
                    <tr><td colSpan={4} className="num muted">Delivery</td><td className="num">{order.shipping ? money(order.shipping) : "Free"}</td></tr>
                    <tr><td colSpan={4} className="num"><b>Total</b></td><td className="num"><b>{money(order.total)}</b></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 18 }}>
            <div className="card">
              <div className="card-head"><h2>Customer</h2></div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Name</dt><dd>{order.customer.name}</dd>
                  <dt>Mobile</dt><dd><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></dd>
                  <dt>Address</dt><dd>{order.customer.address}, {order.customer.city}, {order.customer.state} {order.customer.pincode}</dd>
                  <dt>Placed</dt><dd>{fmtDateTime(order.createdAt)}</dd>
                </dl>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h2>Payment</h2><PayBadge status={order.payment.status} /></div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Method</dt><dd>{PAY_METHOD[order.payment.method]}</dd>
                  <dt>Amount</dt><dd>{money(order.total)}</dd>
                  <dt>Reference</dt><dd>{order.payment.ref || "—"}</dd>
                </dl>
                {order.payment.status === "pending" && <p className="small muted" style={{ marginTop: 10 }}>Cash on delivery: marked as paid when the order is delivered.</p>}
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h2>Handled by</h2></div>
              <div className="card-body">
                {isSuper ? (
                  <Field label="Assigned admin" hint="The admin sees this order in their own list.">
                    <select value={order.assignedTo || ""} disabled={busy} onChange={(e) => act("assign", { adminId: e.target.value || null })}>
                      <option value="">Not assigned</option>
                      {(admins || []).filter((a) => a.role === "admin" && (a.active || a.id === order.assignedTo)).map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </Field>
                ) : <p>{order.assignedName}</p>}
                {order.courier && <p className="small" style={{ marginTop: 12 }}>Courier: {order.courier.name}{order.courier.awb ? `, tracking no. ${order.courier.awb}` : ""}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
