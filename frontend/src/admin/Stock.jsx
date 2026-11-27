// Stock report and purchases from suppliers (Surat, Ahmedabad, ...).
// Stock only moves in three ways: goods received on a purchase (+), an order placed (-), an order cancelled (+).
import { useState } from "react";
import { ErrorNote, Field, Img, Loading, Modal } from "../components.jsx";
import { api } from "../lib/api.js";
import { fmtDate, PO_STATUS, useAsync } from "../lib/format.js";
import { PageHead } from "./shared.jsx";

const dateInput = (ms) => new Date(ms - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function NewPurchase({ products, onClose, onSaved }) {
  const [supplier, setSupplier] = useState("");
  const [city, setCity] = useState("Surat");
  const [expected, setExpected] = useState(dateInput(Date.now() + 7 * 86400000));
  const [note, setNote] = useState("");
  const [rows, setRows] = useState([{ productId: "", qty: "" }]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const setRow = (i, patch) => setRows((r) => r.map((row, n) => (n === i ? { ...row, ...patch } : row)));

  async function submit(e) {
    e.preventDefault();
    const items = rows.filter((r) => r.productId && Number(r.qty) > 0).map((r) => ({ productId: r.productId, qty: Math.round(Number(r.qty)) }));
    if (supplier.trim().length < 2) return setError("Enter the supplier's name.");
    if (!items.length) return setError("Choose at least one product and enter how many pieces were ordered.");
    setBusy(true);
    setError("");
    try {
      await api("/admin/purchases", { method: "POST", auth: true, body: { supplier, city, note, items, expectedOn: new Date(`${expected}T12:00:00`).getTime() } });
      onSaved();
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title="New purchase from a supplier" onClose={onClose} wide>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <div className="form-grid">
          <Field label="Supplier"><input value={supplier} onChange={(e) => setSupplier(e.target.value)} /></Field>
          <Field label="City">
            <input value={city} onChange={(e) => setCity(e.target.value)} list="po-cities" />
            <datalist id="po-cities"><option value="Surat" /><option value="Ahmedabad" /><option value="Varanasi" /><option value="Kolkata" /><option value="Jaipur" /></datalist>
          </Field>
          <Field label="Expected arrival"><input type="date" value={expected} onChange={(e) => setExpected(e.target.value)} /></Field>
          <Field label="Note" hint="Optional: transport, bill number"><input value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        </div>
        <div>
          <b className="small">Items ordered</b>
          <div className="item-rows" style={{ marginTop: 8 }}>
            {rows.map((row, i) => (
              <div className="item-row" key={i}>
                <select className="input" value={row.productId} onChange={(e) => setRow(i, { productId: e.target.value })} aria-label={`Product ${i + 1}`}>
                  <option value="">Choose a product</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name} (in stock: {p.stock})</option>)}
                </select>
                <input className="input" value={row.qty} onChange={(e) => setRow(i, { qty: e.target.value })} inputMode="numeric" placeholder="Pieces" aria-label={`Pieces of product ${i + 1}`} />
                <button type="button" className="icon-btn" onClick={() => setRows((r) => (r.length > 1 ? r.filter((_, n) => n !== i) : r))} aria-label={`Remove item ${i + 1}`}>&times;</button>
              </div>
            ))}
          </div>
          <button type="button" className="link-btn small" style={{ marginTop: 10 }} onClick={() => setRows((r) => [...r, { productId: "", qty: "" }])}>Add another item</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-foot">
          <button type="button" className="btn btn-sm btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-sm" disabled={busy}>{busy ? "Saving" : "Save purchase"}</button>
        </div>
      </form>
    </Modal>
  );
}

function ReceiveGoods({ purchase, onClose, onSaved }) {
  const open = purchase.items.filter((it) => it.received < it.qty);
  const [qty, setQty] = useState(() => Object.fromEntries(open.map((it) => [it.productId, String(it.qty - it.received)])));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const quantities = Object.fromEntries(Object.entries(qty).map(([id, v]) => [id, Math.max(0, Math.round(Number(v) || 0))]));
    try { await api(`/admin/purchases/${purchase.id}/receive`, { method: "POST", auth: true, body: { quantities } }); onSaved(); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title={`Receive goods: ${purchase.id}`} onClose={onClose}>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <p className="muted small">Enter how many pieces actually arrived. They are added to stock straight away. If some are missing, the purchase stays open for the rest.</p>
        {open.map((it) => (
          <Field key={it.productId} label={it.name} hint={`Ordered ${it.qty}, already received ${it.received}`}>
            <input value={qty[it.productId]} onChange={(e) => setQty((q) => ({ ...q, [it.productId]: e.target.value }))} inputMode="numeric" />
          </Field>
        ))}
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-foot">
          <button type="button" className="btn btn-sm btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-sm" disabled={busy}>{busy ? "Saving" : "Add to stock"}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Stock() {
  const stock = useAsync(() => api("/admin/stock", { auth: true }), []);
  const purchases = useAsync(() => api("/admin/purchases", { auth: true }), []);
  const [dialog, setDialog] = useState(null); // "new" | purchase object
  const [onlyLow, setOnlyLow] = useState(false);
  const refresh = () => { stock.reload(); purchases.reload(); };

  async function setStatus(po, status) {
    await api(`/admin/purchases/${po.id}/status`, { method: "POST", auth: true, body: { status } }).catch(() => {});
    refresh();
  }

  if (stock.error || purchases.error) return <ErrorNote message={stock.error || purchases.error} onRetry={refresh} />;
  if (!stock.data || !purchases.data) return <Loading label="Loading stock" />;

  const rows = stock.data.filter((r) => !onlyLow || r.stock <= 3);
  return (
    <>
      <PageHead title="Stock and purchases"><button className="btn btn-sm" onClick={() => setDialog("new")}>New purchase</button></PageHead>
      <div className="adm-content">
        <div className="card">
          <div className="card-head"><h2>Purchases from suppliers</h2><span className="muted small">What was ordered, when it arrives, and how much came</span></div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Purchase</th><th>Supplier</th><th>Ordered</th><th>Expected</th><th>Items (received / ordered)</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {purchases.data.length === 0 && <tr><td colSpan={7} className="muted">No purchases yet. Add one when you order goods from a supplier.</td></tr>}
                {purchases.data.map((po) => {
                  const closed = po.status === "received" || po.status === "cancelled";
                  return (
                    <tr key={po.id}>
                      <td><b className="nowrap">{po.id}</b>{po.note && <div className="small muted">{po.note}</div>}</td>
                      <td>{po.supplier}<div className="small muted">{po.city}</div></td>
                      <td className="nowrap">{fmtDate(po.orderedOn)}</td>
                      <td className="nowrap">{po.status === "received" ? `Received ${fmtDate(po.receivedOn)}` : fmtDate(po.expectedOn)}</td>
                      <td><ul className="po-items">{po.items.map((it) => <li key={it.productId}>{it.name}: {it.received} / {it.qty}</li>)}</ul></td>
                      <td><span className={`badge badge-${po.status}`}>{PO_STATUS[po.status]}</span></td>
                      <td>
                        <div className="row-actions">
                          {!closed && <button className="btn btn-sm" onClick={() => setDialog(po)}>Receive goods</button>}
                          {!closed && po.status === "ordered" && <button className="btn btn-sm btn-quiet" onClick={() => setStatus(po, "transit")}>Mark in transit</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h2>Stock report</h2>
            <label className="switch small"><input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} /> Only low stock (3 or fewer)</label>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Product</th><th className="num">Opening</th><th className="num">Received</th><th className="num">Sold</th><th className="num">In stock</th><th className="num">On the way</th><th>Next arrival</th></tr></thead>
              <tbody>
                {rows.length === 0 && <tr><td colSpan={7} className="muted">No products are low on stock.</td></tr>}
                {rows.map((r) => (
                  <tr key={r.id} className={r.active ? "" : "is-off"}>
                    <td><div className="cell-product"><div className="ph"><Img src={r.image} w={120} alt="" /></div><div>{r.name}<div className="small muted">{r.category}</div></div></div></td>
                    <td className="num">{r.opening}</td>
                    <td className="num">{r.received ? `+${r.received}` : 0}</td>
                    <td className="num">{r.sold ? `−${r.sold}` : 0}</td>
                    <td className="num">{r.stock === 0 ? <span className="badge badge-off">Out</span> : r.stock <= 3 ? <span className="badge badge-pending">{r.stock}</span> : <b>{r.stock}</b>}</td>
                    <td className="num">{r.incoming || "—"}</td>
                    <td className="nowrap">{r.incoming ? fmtDate(r.nextArrival) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {dialog === "new" && <NewPurchase products={stock.data} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); refresh(); }} />}
      {dialog && dialog !== "new" && <ReceiveGoods purchase={dialog} onClose={() => setDialog(null)} onSaved={() => { setDialog(null); refresh(); }} />}
    </>
  );
}
