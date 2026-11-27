import { useEffect, useState } from "react";
import { ErrorNote, Field, Img, Loading, Modal } from "../components.jsx";
import { api } from "../lib/api.js";
import { money, useAsync } from "../lib/format.js";
import { PageHead } from "./shared.jsx";

const BLANK = { name: "", category: "", price: "", mrp: "", fabric: "", desc: "", sizes: "", image: "", stock: "0", active: true };

// Shrink a chosen photo in the browser (longest side 900px, JPEG) so it is small enough to store with the product.
function shrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file is not a photo this browser can read. Use a JPG or PNG.")); };
    img.src = url;
  });
}

function ProductForm({ product, categories, sizes, onClose, onSaved }) {
  const editing = Boolean(product);
  const [form, setForm] = useState(() => (product
    ? { ...product, price: String(product.price), mrp: String(product.mrp), sizes: product.sizes.join(", "), stock: String(product.stock) }
    : { ...BLANK, category: categories[0] || "" }));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  // New product: suggest the usual sizes for the chosen category.
  useEffect(() => {
    if (!editing) setForm((f) => ({ ...f, sizes: (sizes[f.category] || ["Free size"]).join(", ") }));
  }, [form.category, editing, sizes]);

  async function pickPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try { const image = await shrinkPhoto(file); setForm((f) => ({ ...f, image })); setError(""); }
    catch (err) { setError(err.message); }
  }

  async function submit(e) {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Enter the product name.");
    if (!(Number(form.price) > 0)) return setError("Enter the selling price.");
    setBusy(true);
    setError("");
    const body = {
      name: form.name, category: form.category, price: Math.round(Number(form.price)), mrp: Math.round(Number(form.mrp) || 0),
      fabric: form.fabric, desc: form.desc, image: form.image, active: form.active, stock: Math.max(0, Math.round(Number(form.stock) || 0)),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
    };
    try {
      await api(editing ? `/admin/products/${product.id}` : "/admin/products", { method: editing ? "PUT" : "POST", body, auth: true });
      onSaved();
    } catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <Modal title={editing ? `Edit ${product.name}` : "Add a product"} onClose={onClose} wide>
      <form onSubmit={submit} noValidate style={{ display: "grid", gap: 14 }}>
        <div className="form-grid">
          <Field label="Product name" className="span-2"><input value={form.name} onChange={set("name")} /></Field>
          <Field label="Category">
            <select value={form.category} onChange={set("category")}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Fabric"><input value={form.fabric} onChange={set("fabric")} placeholder="Silk, cotton, georgette" /></Field>
          <Field label="Selling price (₹)"><input value={form.price} onChange={set("price")} inputMode="numeric" /></Field>
          <Field label="MRP (₹)" hint="Shown struck through when higher than the price."><input value={form.mrp} onChange={set("mrp")} inputMode="numeric" /></Field>
          <Field label="Sizes" hint="Separate with commas."><input value={form.sizes} onChange={set("sizes")} /></Field>
          {editing
            ? <Field label="In stock" hint="Stock changes through purchases and orders."><input value={form.stock} disabled /></Field>
            : <Field label="Opening stock" hint="Pieces on the shelf today."><input value={form.stock} onChange={set("stock")} inputMode="numeric" /></Field>}
          <Field label="Description" className="span-2"><textarea value={form.desc} onChange={set("desc")} /></Field>
          <Field label="Photo link" hint="Paste a link, or choose a photo from this device."><input value={form.image.startsWith("data:") ? "Photo chosen from this device" : form.image} onChange={set("image")} disabled={form.image.startsWith("data:")} /></Field>
          <Field label="Upload a photo"><input type="file" accept="image/*" onChange={pickPhoto} /></Field>
        </div>
        {form.image && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="ph" style={{ width: 66, aspectRatio: "3 / 4" }}><Img src={form.image} w={200} alt="Product photo preview" /></div>
            <button type="button" className="link-btn small" onClick={() => setForm((f) => ({ ...f, image: "" }))}>Remove photo</button>
          </div>
        )}
        <label className="switch"><input type="checkbox" checked={form.active} onChange={set("active")} /> Show this product in the shop</label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-foot">
          <button type="button" className="btn btn-sm btn-quiet" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-sm" disabled={busy}>{busy ? "Saving" : editing ? "Save changes" : "Add product"}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function Products() {
  const { data: products, error, loading, reload } = useAsync(() => api("/admin/products", { auth: true }), []);
  const { data: config } = useAsync(() => api("/config"), []);
  const [editing, setEditing] = useState(null); // null = closed, "new" = add form, object = edit form
  const [filter, setFilter] = useState("");

  async function toggle(p) {
    await api(`/admin/products/${p.id}/active`, { method: "POST", body: { active: !p.active }, auth: true }).catch(() => {});
    reload();
  }

  if (error) return <ErrorNote message={error} onRetry={reload} />;
  if ((loading && !products) || !config) return <Loading label="Loading products" />;

  const shown = products.filter((p) => !filter || p.category === filter);
  return (
    <>
      <PageHead title="Products"><button className="btn btn-sm" onClick={() => setEditing("new")}>Add a product</button></PageHead>
      <div className="adm-content">
        <div className="tabs" role="group" aria-label="Filter by category">
          <button type="button" className={`chip${!filter ? " is-on" : ""}`} onClick={() => setFilter("")}>All ({products.length})</button>
          {config.categories.map((c) => <button key={c} type="button" className={`chip${filter === c ? " is-on" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Product</th><th>Category</th><th className="num">Price</th><th className="num">MRP</th><th className="num">In stock</th><th className="num">Sold</th><th>In shop</th><th></th></tr></thead>
              <tbody>
                {shown.length === 0 && <tr><td colSpan={8} className="muted">No products in this category yet.</td></tr>}
                {shown.map((p) => (
                  <tr key={p.id} className={p.active ? "" : "is-off"}>
                    <td><div className="cell-product"><div className="ph"><Img src={p.image} w={120} alt="" /></div><div>{p.name}<div className="small muted">{p.id} &middot; {p.fabric}</div></div></div></td>
                    <td>{p.category}</td>
                    <td className="num">{money(p.price)}</td>
                    <td className="num">{money(p.mrp)}</td>
                    <td className="num">{p.stock === 0 ? <span className="badge badge-off">Out</span> : p.stock <= 3 ? <span className="badge badge-pending">{p.stock} left</span> : p.stock}</td>
                    <td className="num">{p.sold}</td>
                    <td><label className="switch"><input type="checkbox" checked={p.active} onChange={() => toggle(p)} aria-label={`Show ${p.name} in the shop`} />{p.active ? "Shown" : "Hidden"}</label></td>
                    <td><button className="btn btn-sm btn-quiet" onClick={() => setEditing(p)}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {editing && (
        <ProductForm product={editing === "new" ? null : editing} categories={config.categories} sizes={config.sizes}
          onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      )}
    </>
  );
}
