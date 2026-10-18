const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
const TOKEN_KEY = "adminToken";

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("admin");
}

// Use after the existing login endpoint returns its successful response.
export function saveAdminSession(data) {
  if (typeof data?.token !== "string" || !data.token.trim() || data?.admin?.role !== "admin") {
    throw new Error("The server did not return a valid administrator login.");
  }
  // Write the token last, so a failed metadata write cannot create a partial session.
  clearAdminSession();
  try {
    localStorage.setItem("admin", JSON.stringify(data.admin));
    localStorage.setItem(TOKEN_KEY, data.token.trim());
  } catch {
    clearAdminSession();
    throw new Error("Unable to save the admin login. Check browser storage settings.");
  }
}

export async function adminFetch(url, options = {}) {
  const target = new URL(url, BASE_URL + "/");
  const base = new URL(BASE_URL);
  if (target.origin !== base.origin) throw new Error("Invalid admin API address.");
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token?.trim()) throw new Error("Please log in to the admin dashboard again.");
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token.trim()}`);
  headers.set("Accept", "application/json");
  headers.set("ngrok-skip-browser-warning", "true");
  const response = await fetch(target.toString(), { ...options, headers, cache: "no-store" });
  if (response.status === 401) {
    clearAdminSession();
    throw new Error("Your admin login has expired or is invalid. Please log in again.");
  }
  if (response.status === 403) {
    throw new Error("An active administrator account is required for this action.");
  }
  return response;
}

// Pass the EXACT existing admin-login URL; its router mount was not supplied.
export async function loginAdmin(loginUrl, email, password) {
  const target = new URL(loginUrl, BASE_URL + "/");
  if (target.origin !== new URL(BASE_URL).origin) throw new Error("Invalid admin login address.");
  clearAdminSession();
  const response = await fetch(target.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "ngrok-skip-browser-warning": "true" },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    cache: "no-store",
  });
  let data;
  try { data = await response.json(); } catch { throw new Error("The admin server returned an invalid response."); }
  if (!response.ok) throw new Error(data?.message || "Admin login failed.");
  saveAdminSession(data);
  return data;
}
