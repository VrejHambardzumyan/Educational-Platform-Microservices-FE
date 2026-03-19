export const API = {
  auth: "https://localhost:7107",
  catalog: "https://localhost:7267",
  enrollment: "https://localhost:7152",
};

export const getToken = () => localStorage.getItem("access_token");
export const setToken = (t) => localStorage.setItem("access_token", t);
export const clearToken = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return "User";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      || payload.role
      || "User";
  } catch {
    return "User";
  }
};

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export async function apiFetch(url, opts = {}) {
  if (isTokenExpired() && opts.headers?.Authorization) {
    clearToken();
    window.location.reload();
    throw new Error("Session expired, please log in again.");
  }

  const res = await fetch(url, opts);

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (json?.errors) {
      const messages = Object.values(json.errors).flat().join("\n");
      throw new Error(messages);
    }
    throw new Error(json?.message || json?.title || `Something went wrong (${res.status})`);
  }

  if (res.status === 204) return null;

  const text = await res.text();
  if (!text || text.trim() === "") return [];

  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}