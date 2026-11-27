import { useEffect, useState } from "react";
import { ErrorNote, Field, Loading } from "../components.jsx";
import { api } from "../lib/api.js";
import { money, useAsync } from "../lib/format.js";
import { PageHead } from "./shared.jsx";

export default function Offers() {
  const { data, error, loading, reload } = useAsync(() => api("/admin/offers", { auth: true }), []);
  const [settings, setSettings] = useState(null);
  const [coupon, setCoupon] = useState({ code: "", percent: "", minTotal: "" });
  const [note, setNote] = useState({ text: "", bad: false });
  useEffect(() => { if (data) setSettings({ ...data.settings, freeShipAbove: String(data.settings.freeShipAbove), shipFee: String(data.settings.shipFee) }); }, [data]);

  const call = async (fn, done) => {
    try { await fn(); setNote({ text: done, bad: false }); reload(); }
    catch (e) { setNote({ text: e.message, bad: true }); }
  };

  if (error) return <ErrorNote message={error} onRetry={reload} />;
  if ((loading && !data) || !settings) return <Loading label="Loading offers" />;

  const saveSettings = (e) => {
    e.preventDefault();
    call(() => api("/admin/settings", { method: "PUT", auth: true, body: {
      offerText: settings.offerText, autoAssign: settings.autoAssign,
      freeShipAbove: Math.max(0, Math.round(Number(settings.freeShipAbove) || 0)), shipFee: Math.max(0, Math.round(Number(settings.shipFee) || 0)),
    } }), "Shop settings saved. The shop shows them straight away.");
  };
  const addCoupon = (e) => {
    e.preventDefault();
    call(async () => {
      await api("/admin/coupons", { method: "POST", auth: true, body: { code: coupon.code, percent: Math.round(Number(coupon.percent) || 0), minTotal: Math.round(Number(coupon.minTotal) || 0) } });
      setCoupon({ code: "", percent: "", minTotal: "" });
    }, "Coupon added.");
  };

  return (
    <>
      <PageHead title="Offers and shop settings" />
      <div className="adm-content">
        {note.text && <p className={note.bad ? "form-error" : "form-ok"} role="status">{note.text}</p>}
        <div className="cols-2">
          <form className="card" onSubmit={saveSettings}>
            <div className="card-head"><h2>Shop settings</h2></div>
            <div className="card-body" style={{ display: "grid", gap: 14 }}>
              <Field label="Offer banner" hint="Shown on the shop's home page. Leave empty to hide it."><textarea value={settings.offerText} onChange={(e) => setSettings({ ...settings, offerText: e.target.value })} /></Field>
              <div className="form-grid">
                <Field label="Free delivery above (₹)"><input value={settings.freeShipAbove} onChange={(e) => setSettings({ ...settings, freeShipAbove: e.target.value })} inputMode="numeric" /></Field>
                <Field label="Delivery charge (₹)"><input value={settings.shipFee} onChange={(e) => setSettings({ ...settings, shipFee: e.target.value })} inputMode="numeric" /></Field>
              </div>
              <label className="switch"><input type="checkbox" checked={settings.autoAssign} onChange={(e) => setSettings({ ...settings, autoAssign: e.target.checked })} /> Give each new order to the admin with the fewest open orders</label>
              <div><button className="btn btn-sm" type="submit">Save settings</button></div>
            </div>
          </form>

          <div className="card">
            <div className="card-head"><h2>Coupons</h2></div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Code</th><th className="num">Discount</th><th className="num">Minimum order</th><th>Active</th></tr></thead>
                <tbody>
                  {data.coupons.length === 0 && <tr><td colSpan={4} className="muted">No coupons yet.</td></tr>}
                  {data.coupons.map((c) => (
                    <tr key={c.code} className={c.active ? "" : "is-off"}>
                      <td><b>{c.code}</b></td><td className="num">{c.percent}%</td><td className="num">{money(c.minTotal)}</td>
                      <td><label className="switch"><input type="checkbox" checked={c.active} aria-label={`Coupon ${c.code} active`}
                        onChange={() => call(() => api(`/admin/coupons/${c.code}/active`, { method: "POST", auth: true, body: { active: !c.active } }), `${c.code} ${c.active ? "switched off" : "switched on"}.`)} />{c.active ? "On" : "Off"}</label></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form className="card-body" onSubmit={addCoupon} style={{ borderTop: "1px solid var(--line)", display: "grid", gap: 12 }}>
              <b>Add a coupon</b>
              <div className="form-grid">
                <Field label="Code"><input value={coupon.code} onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} placeholder="DIWALI20" /></Field>
                <Field label="Discount (%)"><input value={coupon.percent} onChange={(e) => setCoupon({ ...coupon, percent: e.target.value })} inputMode="numeric" /></Field>
                <Field label="Minimum order (₹)"><input value={coupon.minTotal} onChange={(e) => setCoupon({ ...coupon, minTotal: e.target.value })} inputMode="numeric" /></Field>
              </div>
              <div><button className="btn btn-sm" type="submit">Add coupon</button></div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
