import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ErrorNote, Field, Img, Loading, Modal } from "../components.jsx";
import { api } from "../lib/api.js";
import { money, PAY_METHOD } from "../lib/format.js";
import { Summary, useQuote } from "./CartPage.jsx";
import { myOrders, savedCustomer, useStore } from "./StoreContext.jsx";

const EMPTY = { name: "", phone: "", address: "", city: "", state: "Bihar", pincode: "" };
const METHODS = [
  ["upi", "Pay with any UPI app"],
  ["card", "Debit or credit card"],
  ["netbanking", "Pay from your bank account"],
  ["cod", "Pay in cash when the order arrives"],
];

function checkForm(f) {
  if (f.name.trim().length < 2) return "Enter your full name.";
  if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""))) return "Enter a 10-digit mobile number.";
  if (f.address.trim().length < 5) return "Enter your house number and street.";
  if (f.city.trim().length < 2) return "Enter your city.";
  if (f.state.trim().length < 2) return "Enter your state.";
  if (!/^\d{6}$/.test(f.pincode.trim())) return "Enter a 6-digit PIN code.";
  return "";
}

// Loads Razorpay's own checkout script. Only used when the backend has Razorpay keys.
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("The payment screen could not be loaded. Check your connection and try again."));
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, coupon, clearCart } = useStore();
  const { data: quote, error: quoteError, reload } = useQuote();
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(savedCustomer.get() || {}) }));
  const [method, setMethod] = useState("upi");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null); // { order, payment } while the test payment screen is open
  const settling = useRef(false);
  const placed = useRef(false);

  if (!cart.length && !placed.current) return <Navigate to="/cart" replace />;
  if (quoteError) return <ErrorNote message={quoteError} onRetry={reload} />;
  if (!quote) return <Loading label="Preparing checkout" />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function finish(order) {
    placed.current = true;
    clearCart();
    navigate(`/order/${order.id}?placed=1`);
  }

  // Tell the backend how the payment went; it marks the order paid or cancels it and frees the stock.
  async function settle(res, body) {
    if (settling.current) return;
    settling.current = true;
    try {
      const order = await api(`/orders/${res.order.id}/payment`, { method: "POST", body: { phone: res.order.customer.phone, ...body } });
      setPending(null);
      if (order.status === "cancelled") setError("The payment was not completed, so no order was placed. Your cart is unchanged.");
      else finish(order);
    } catch (err) {
      setPending(null);
      setError(err.message);
    } finally {
      settling.current = false;
      setBusy(false);
    }
  }

  async function openRazorpay(res) {
    try {
      await loadRazorpay();
      new window.Razorpay({
        key: res.payment.keyId, order_id: res.payment.gatewayOrderId, amount: res.payment.amount * 100, currency: "INR",
        name: "Prisha Boutique", description: `Order ${res.order.id}`, theme: { color: "#8e1b45" },
        prefill: { name: res.order.customer.name, contact: res.order.customer.phone },
        handler: (r) => settle(res, { result: "success", ...r }),
        modal: { ondismiss: () => settle(res, { result: "failed" }) },
      }).open();
    } catch (err) {
      await settle(res, { result: "failed" });
      setError(err.message);
    }
  }

  async function submit(e) {
    e.preventDefault();
    const problem = checkForm(form);
    if (problem) { setError(problem); return; }
    setError("");
    setBusy(true);
    try {
      const res = await api("/orders", { method: "POST", body: { customer: form, items: cart, couponCode: coupon || null, payMethod: method } });
      savedCustomer.set(res.order.customer);
      myOrders.add(res.order.id, res.order.customer.phone);
      if (!res.payment) finish(res.order);                               // cash on delivery
      else if (res.payment.mode === "razorpay") await openRazorpay(res); // live payment screen
      else setPending(res);                                              // built-in test payment screen
    } catch (err) {
      setError(err.message);
      setBusy(false);
      reload();
    }
  }

  const blocked = quote.problems.length > 0;

  return (
    <div className="wrap">
      <h1 className="page-title">Checkout</h1>
      <form className="two-col" onSubmit={submit} noValidate>
        <div>
          <div className="panel">
            <h2>Delivery address</h2>
            <div className="form-grid">
              <Field label="Full name"><input value={form.name} onChange={set("name")} autoComplete="name" required /></Field>
              <Field label="Mobile number" hint="We use it for delivery updates and to find your order."><input value={form.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" required /></Field>
              <Field label="House number and street" className="span-2"><input value={form.address} onChange={set("address")} autoComplete="street-address" required /></Field>
              <Field label="City"><input value={form.city} onChange={set("city")} autoComplete="address-level2" required /></Field>
              <Field label="State"><input value={form.state} onChange={set("state")} autoComplete="address-level1" required /></Field>
              <Field label="PIN code"><input value={form.pincode} onChange={set("pincode")} inputMode="numeric" autoComplete="postal-code" maxLength={6} required /></Field>
            </div>
          </div>
          <div className="panel">
            <h2>Payment</h2>
            <div className="pay-options" role="radiogroup" aria-label="Payment method">
              {METHODS.map(([key, note]) => (
                <label className="pay-option" key={key}>
                  <input type="radio" name="pay" value={key} checked={method === key} onChange={() => setMethod(key)} />
                  <div><b>{PAY_METHOD[key]}</b><span>{note}</span></div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>Your order</h2>
          {quote.lines.map((line) => (
            <div className="line" key={line.productId + line.size} style={{ gridTemplateColumns: "52px minmax(0, 1fr) auto" }}>
              <div className="ph" style={{ width: 52 }}><Img src={line.image} w={160} alt="" /></div>
              <div><div className="line-name small">{line.name}</div><div className="line-meta">{line.size} &middot; Qty {line.qty}</div></div>
              <b>{money(line.price * line.qty)}</b>
            </div>
          ))}
          <div style={{ marginTop: 14 }}><Summary quote={quote} /></div>
          {(error || blocked) && <p className="form-error" style={{ marginTop: 12 }} role="alert">{error || quote.problems[0]}</p>}
          <button className="btn btn-block" style={{ marginTop: 14 }} type="submit" disabled={busy || blocked}>
            {busy ? "Placing order" : method === "cod" ? `Place order, pay ${money(quote.total)} on delivery` : `Pay ${money(quote.total)}`}
          </button>
          <p className="small muted" style={{ marginTop: 10, textAlign: "center" }}><Link to="/cart">Edit cart</Link></p>
        </div>
      </form>

      {pending && (
        <Modal title="Test payment" onClose={() => settle(pending, { result: "failed" })}>
          <p>This is a demo, so no money is charged. On the live shop this step opens the Razorpay payment screen for UPI, cards and net banking.</p>
          <div className="pay-amount"><b>{money(pending.payment.amount)}</b>Order {pending.order.id} &middot; {PAY_METHOD[pending.order.payment.method]}</div>
          <button type="button" className="btn" onClick={() => settle(pending, { result: "success" })}>Simulate a successful payment</button>
          <button type="button" className="btn btn-quiet" onClick={() => settle(pending, { result: "failed" })}>Simulate a failed payment</button>
        </Modal>
      )}
    </div>
  );
}
