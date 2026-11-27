// Small building blocks shared by the shop and the admin panel.
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { imgUrl, PAY_STATUS, statusLabel } from "./lib/format.js";

export function Img({ src, w = 600, alt = "", eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (!src || failed) return null; // the tinted .ph frame stays visible instead of a broken-image icon
  return <img src={imgUrl(src, w)} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />;
}

export function Logo({ to = "/" }) {
  return (
    <Link className="logo" to={to} aria-label="Prisha Boutique, home">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 1.500c3.700 3.700 6.300 7 6.300 10.800a6.300 6.300 0 0 1-12.600 0c0-3.800 2.600-7.100 6.300-10.800z" fill="currentColor" />
        <circle cx="12" cy="13.200" r="2.500" fill="#e8a13a" />
      </svg>
      <span>
        <b>Prisha</b>
        <small>Boutique</small>
      </span>
    </Link>
  );
}

export const StatusBadge = ({ status }) => <span className={`badge badge-${status}`}>{statusLabel(status)}</span>;
export const PayBadge = ({ status }) => <span className={`badge badge-${status}`}>{PAY_STATUS[status] || status}</span>;

export const Loading = ({ label = "Loading" }) => <div className="loading" role="status">{`${label}…`}</div>;

export function ErrorNote({ message, onRetry }) {
  return (
    <div className="error-note" role="alert">
      <div>{message}</div>
      {onRetry && <button className="btn btn-sm btn-quiet" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Field({ label, hint, className = "", children }) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

/** Native <dialog>: Esc and a click on the backdrop both close it. */
export function Modal({ title, onClose, wide = false, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog ref={ref} className={`modal${wide ? " wide" : ""}`} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="modal-head">
        <h2>{title}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">&times;</button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}

/** A button that asks "sure?" on the first click and acts on the second. */
export function ConfirmButton({ label, confirmLabel = "Click again to confirm", onConfirm, className = "btn btn-sm btn-danger", disabled }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button type="button" className={className} disabled={disabled} onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}>
      {armed ? confirmLabel : label}
    </button>
  );
}
