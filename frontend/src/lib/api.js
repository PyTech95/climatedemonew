// One small wrapper around fetch for every call to the Python backend.
// Set VITE_API_URL only when the frontend and backend are hosted on different addresses.
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "prisha_admin_token";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
}
export function setToken(token) {
  try { token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); } catch { /* storage blocked */ }
}

/**
 * api("/products")                                   GET
 * api("/orders", { method: "POST", body: {...} })     JSON body
 * api("/admin/orders", { auth: true })                sends the admin login token
 * Throws an Error whose message is ready to show to the person using the site.
 */
export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) headers.Authorization = `Bearer ${getToken()}`;

  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && auth) window.dispatchEvent(new Event("prisha:signed-out"));
    const detail = data && typeof data.detail === "string" ? data.detail : `Something went wrong (error ${res.status}). Try again.`;
    const err = new Error(detail);
    err.status = res.status;
    throw err;
  }
  return data;
}
