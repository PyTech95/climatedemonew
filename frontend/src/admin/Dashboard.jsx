import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmButton, ErrorNote, Loading, PayBadge, StatusBadge } from "../components.jsx";
import { api } from "../lib/api.js";
import { fmtDate, fmtDateTime, money, PO_STATUS, useAsync, useInterval } from "../lib/format.js";
import { PageHead, useAuth } from "./shared.jsx";

export default function Dashboard() {
  const { admin, isSuper } = useAuth();
  const { data, error, loading, reload } = useAsync(() => api("/admin/dashboard", { auth: true }), []);
  const [note, setNote] = useState("");
  useInterval(useCallback(() => reload(), [reload]), 15000);

  async function resetDemo() {
    try { await api("/admin/demo/reset", { method: "POST", auth: true }); setNote("Demo data has been reset to the starting sample."); reload(); }
    catch (e) { setNote(e.message); }
  }

  if (error) return <ErrorNote message={error} onRetry={reload} />;
  if (loading && !data) return <Loading label="Loading dashboard" />;

  return (
    <>
      <PageHead title={isSuper ? "Dashboard" : `${admin.name}'s orders`}>
        {isSuper && <ConfirmButton className="btn btn-sm btn-quiet" label="Reset demo data" confirmLabel="Click again to reset everything" onConfirm={resetDemo} />}
      </PageHead>
      <div className="adm-content">
        {note && <p className="form-ok" role="status">{note}</p>}
        <div className="stats">
          <Link className="stat" to="/admin/orders?status=placed"><span>New orders</span><b>{data.newOrders}</b><small>Waiting to be confirmed. {data.ordersToday} placed today</small></Link>
          <Link className="stat" to="/admin/orders?status=confirmed"><span>To pack and dispatch</span><b>{data.toDispatch}</b><small>Confirmed or packed</small></Link>
          <Link className="stat" to="/admin/orders?status=dispatched"><span>On the way</span><b>{data.onTheWay}</b><small>Dispatched or out for delivery</small></Link>
          <Link className="stat" to="/admin/orders?status=delivered"><span>Delivered</span><b>{data.delivered}</b><small>Completed orders</small></Link>
          <div className="stat"><span>Money received</span><b>{money(data.salesPaid)}</b><small>{money(data.codPending)} cash still to collect</small></div>
          {isSuper && <Link className="stat" to="/admin/orders?status=placed"><span>Not assigned</span><b>{data.unassigned}</b><small>Open orders with no admin</small></Link>}
        </div>

        <div className="card">
          <div className="card-head"><h2>Latest orders</h2><Link to="/admin/orders">All orders</Link></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th className="num">Total</th><th>Payment</th><th>Status</th>{isSuper && <th>Admin</th>}</tr></thead>
              <tbody>
                {data.recent.length === 0 && <tr><td colSpan={7} className="muted">No orders yet. Orders placed in the shop appear here.</td></tr>}
                {data.recent.map((o) => (
                  <tr key={o.id}>
                    <td><Link to={`/admin/orders/${o.id}`}>{o.id}</Link></td>
                    <td className="nowrap">{fmtDateTime(o.createdAt)}</td>
                    <td>{o.customer.name}<div className="small muted">{o.customer.city}</div></td>
                    <td className="num">{money(o.total)}</td>
                    <td><PayBadge status={o.payment.status} /></td>
                    <td><StatusBadge status={o.status} /></td>
                    {isSuper && <td>{o.assignedName || <span className="muted">Not assigned</span>}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="cols-2">
          <div className="card">
            <div className="card-head"><h2>Low stock</h2><Link to="/admin/stock">Stock report</Link></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Product</th><th className="num">In stock</th></tr></thead>
                <tbody>
                  {data.lowStock.length === 0 && <tr><td colSpan={2} className="muted">Every product has more than 3 pieces.</td></tr>}
                  {data.lowStock.map((p) => (
                    <tr key={p.id}><td>{p.name}</td><td className="num">{p.stock === 0 ? <span className="badge badge-off">Out of stock</span> : p.stock}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h2>Goods on the way</h2><Link to="/admin/stock">Purchases</Link></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Purchase</th><th>From</th><th>Expected</th><th>Status</th></tr></thead>
                <tbody>
                  {data.incoming.length === 0 && <tr><td colSpan={4} className="muted">Nothing is on order from suppliers.</td></tr>}
                  {data.incoming.map((po) => (
                    <tr key={po.id}><td>{po.id}</td><td>{po.city || po.supplier}</td><td className="nowrap">{fmtDate(po.expectedOn)}</td><td><span className={`badge badge-${po.status}`}>{PO_STATUS[po.status]}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
