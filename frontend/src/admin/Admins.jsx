import { useState } from "react";
import { ErrorNote, Field, Loading, Modal } from "../components.jsx";
import { api } from "../lib/api.js";
import { fmtDate, useAsync } from "../lib/format.js";
import { PageHead } from "./shared.jsx";

function NewAdmin({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Enter the person's name.");
    if (!/^[A-Za-z0-9._-]{3,}$/.test(form.username.trim())) return setError("Username needs at least 3 letters or numbers, with no spaces.");
    if (form.password.length < 6) return setError("Password needs at least 6 characters.");
    setBusy(true);
    setError("");
    try { await api("/admin/admins", { method: "POST", auth: true, body: { ...form, username: form.username.trim() } }); onSaved(); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title="Create an admin login" onClose={onClose}>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <p className="muted small">An admin signs in with this username and password and sees only the orders assigned to them.</p>
        <Field label="Name"><input value={form.name} onChange={set("name")} /></Field>
        <Field label="Username"><input value={form.username} onChange={set("username")} autoCapitalize="none" autoComplete="off" /></Field>
        <Field label="Password" hint="At least 6 characters. Share it with the person privately."><input value={form.password} onChange={set("password")} type="password" autoComplete="new-password" /></Field>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-foot">
          <button type="button" className="btn btn-sm btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-sm" disabled={busy}>{busy ? "Creating" : "Create login"}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Admins() {
  const { data: admins, error, loading, reload } = useAsync(() => api("/admin/admins", { auth: true }), []);
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState("");

  async function toggle(a) {
    try {
      await api(`/admin/admins/${a.id}/active`, { method: "POST", auth: true, body: { active: !a.active } });
      setNote(a.active ? `${a.name}'s login is switched off. Their open orders stay assigned until you move them.` : `${a.name} can sign in again.`);
    } catch (e) { setNote(e.message); }
    reload();
  }

  if (error) return <ErrorNote message={error} onRetry={reload} />;
  if (loading && !admins) return <Loading label="Loading admins" />;

  return (
    <>
      <PageHead title="Admins"><button className="btn btn-sm" onClick={() => setAdding(true)}>Create an admin</button></PageHead>
      <div className="adm-content">
        {note && <p className="form-ok" role="status">{note}</p>}
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Username</th><th>Role</th><th className="num">Open orders</th><th className="num">All orders</th><th>Created</th><th>Login</th></tr></thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id} className={a.active ? "" : "is-off"}>
                    <td><b>{a.name}</b></td>
                    <td>{a.username}</td>
                    <td>{a.role === "super" ? "Super admin" : "Admin"}</td>
                    <td className="num">{a.role === "super" ? "—" : a.openOrders}</td>
                    <td className="num">{a.role === "super" ? "—" : a.totalOrders}</td>
                    <td className="nowrap">{fmtDate(a.createdAt)}</td>
                    <td>{a.role === "super" ? <span className="badge badge-on">Always on</span>
                      : <label className="switch"><input type="checkbox" checked={a.active} onChange={() => toggle(a)} aria-label={`Login for ${a.name}`} />{a.active ? "On" : "Off"}</label>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {adding && <NewAdmin onClose={() => setAdding(false)} onSaved={() => { setAdding(false); setNote("Admin login created."); reload(); }} />}
    </>
  );
}
