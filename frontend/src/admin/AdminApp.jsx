// Admin panel shell: login, sidebar, and the routes each role may open.
import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { Field, Loading, Logo } from "../components.jsx";
import { api, getToken, setToken } from "../lib/api.js";
import Dashboard from "./Dashboard.jsx";
import { OrderDetail, OrdersList } from "./Orders.jsx";
import Products from "./Products.jsx";
import Stock from "./Stock.jsx";
import Payments from "./Payments.jsx";
import Offers from "./Offers.jsx";
import Admins from "./Admins.jsx";
import { AuthCtx } from "./shared.jsx";

function Login({ onDone }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [demoLogins, setDemoLogins] = useState([]);
  useEffect(() => { api("/config").then((c) => setDemoLogins(c.demoLogins || [])).catch(() => {}); }, []);

  async function submit(e) {
    e.preventDefault();
    if (!username.trim() || !password) { setError("Enter your username and password."); return; }
    setBusy(true);
    setError("");
    try { onDone(await api("/admin/login", { method: "POST", body: { username, password } })); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit} noValidate>
        <Logo to="/" />
        <h1>Staff sign in</h1>
        <Field label="Username"><input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" /></Field>
        <Field label="Password"><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" /></Field>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-block" type="submit" disabled={busy}>{busy ? "Signing in" : "Sign in"}</button>
        {demoLogins.length > 0 && (
          <div className="demo-logins">
            <b>Demo logins</b>
            <span className="muted">Choose one to fill the form. The super admin sees everything; an admin sees only their own orders.</span>
            {demoLogins.map((d) => (
              <button key={d.username} type="button" className="btn btn-sm btn-quiet" onClick={() => { setUsername(d.username); setPassword(d.password); setError(""); }}>{d.label}</button>
            ))}
          </div>
        )}
        <Link className="small" to="/">Back to the shop</Link>
      </form>
    </div>
  );
}

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  useEffect(() => {
    if (getToken()) api("/admin/me", { auth: true }).then(setAdmin).catch(() => setToken("")).finally(() => setChecking(false));
    const signedOut = () => { setToken(""); setAdmin(null); }; // fired by api() when a token is rejected
    window.addEventListener("prisha:signed-out", signedOut);
    return () => window.removeEventListener("prisha:signed-out", signedOut);
  }, []);

  if (checking) return <Loading label="Checking your sign-in" />;
  if (!admin) return <Login onDone={(res) => { setToken(res.token); setAdmin(res.admin); }} />;

  const isSuper = admin.role === "super";
  const signOut = () => { setToken(""); setAdmin(null); };

  return (
    <AuthCtx.Provider value={{ admin, isSuper }}>
      <div className="adm">
        <aside className="adm-side">
          <Logo to="/admin" />
          <nav className="adm-nav" aria-label="Admin">
            <NavLink to="/admin" end>Dashboard</NavLink>
            <NavLink to="/admin/orders">Orders</NavLink>
            <NavLink to="/admin/products">Products</NavLink>
            <NavLink to="/admin/stock">Stock and purchases</NavLink>
            {isSuper && <div className="nav-label">Super admin</div>}
            {isSuper && <NavLink to="/admin/payments">Payments</NavLink>}
            {isSuper && <NavLink to="/admin/offers">Offers</NavLink>}
            {isSuper && <NavLink to="/admin/admins">Admins</NavLink>}
          </nav>
          <div className="adm-side-foot">
            <div><b>{admin.name}</b> <span className="small">{isSuper ? "Super admin" : "Admin"}</span></div>
            <div style={{ display: "flex", gap: 14, marginTop: 6 }}>
              <a href="/" target="_blank" rel="noreferrer">Open shop</a>
              <button type="button" className="link-btn" onClick={signOut}>Sign out</button>
            </div>
          </div>
        </aside>
        <div className="adm-main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="stock" element={<Stock />} />
            {isSuper && <Route path="payments" element={<Payments />} />}
            {isSuper && <Route path="offers" element={<Offers />} />}
            {isSuper && <Route path="admins" element={<Admins />} />}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </AuthCtx.Provider>
  );
}
