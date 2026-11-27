import { Link } from "react-router-dom";
import { ErrorNote, Loading, PayBadge } from "../components.jsx";
import { api } from "../lib/api.js";
import { fmtDateTime, money, PAY_METHOD, useAsync } from "../lib/format.js";
import { PageHead } from "./shared.jsx";

export default function Payments() {
  const { data, error, loading, reload } = useAsync(() => api("/admin/payments", { auth: true }), []);
  if (error) return <ErrorNote message={error} onRetry={reload} />;
  if (loading && !data) return <Loading label="Loading payments" />;
  return (
    <>
      <PageHead title="Payments" />
      <div className="adm-content">
        <p className={data.mode === "demo" ? "form-error" : "form-ok"} style={data.mode === "demo" ? { background: "var(--warn-soft)", color: "var(--warn)" } : undefined}>
          {data.mode === "demo"
            ? "Test mode: online payments use the built-in test screen and no money moves. Add the Razorpay keys on the server to take real payments."
            : "Razorpay is connected. Online payments are verified by the server before an order is confirmed."}
        </p>
        <div className="stats">
          <div className="stat"><span>Received</span><b>{money(data.paid)}</b><small>Online payments and collected cash</small></div>
          <div className="stat"><span>Cash to collect</span><b>{money(data.pending)}</b><small>Cash-on-delivery orders not yet delivered</small></div>
          <div className="stat"><span>Refunded</span><b>{money(data.refunded)}</b><small>Paid orders that were cancelled</small></div>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Method</th><th className="num">Amount</th><th>Status</th><th>Reference</th></tr></thead>
              <tbody>
                {data.rows.length === 0 && <tr><td colSpan={7} className="muted">No payments yet.</td></tr>}
                {data.rows.map((r) => (
                  <tr key={r.orderId}>
                    <td><Link to={`/admin/orders/${r.orderId}`}>{r.orderId}</Link></td>
                    <td className="nowrap">{fmtDateTime(r.createdAt)}</td>
                    <td>{r.customer}</td>
                    <td>{PAY_METHOD[r.method]}</td>
                    <td className="num">{money(r.amount)}</td>
                    <td><PayBadge status={r.status} /></td>
                    <td>{r.ref || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
