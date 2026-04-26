export const API = "http://localhost:5091";

export const getToken = () => localStorage.getItem("access_token");
export const setToken = (t) => localStorage.setItem("access_token", t);

export const clearToken = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};

export const getUserRole = () => {
  const token = getToken();
  if (!token) return "Student";
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload.role ||
      "Student"
    );
  } catch {
    return "Student";
  }
};

export const getUserId = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId || null;
  } catch {
    return null;
  }
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

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

let _refreshPromise = null;

async function _tryRefresh() {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const rt = localStorage.getItem("refresh_token");
      if (!rt) return false;
      const res = await fetch(`${API}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ RefreshToken: rt }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const newToken = data.accessToken || data.AccessToken;
      if (!newToken) return false;
      setToken(newToken);
      localStorage.setItem("refresh_token", data.refreshToken || data.RefreshToken || "");
      return true;
    } catch {
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

async function _parseResponse(res) {
  if (!res.ok) {
    const json = await res.json().catch(() => null);
    if (json?.errors) {
      throw new Error(Object.values(json.errors).flat().join("\n"));
    }
    throw new Error(json?.message || json?.title || `Something went wrong (${res.status})`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text || !text.trim()) return null;
  try { return JSON.parse(text); } catch { return null; }
}

export async function apiFetch(url, opts = {}) {
  const token = getToken();
  const isFormData = opts.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };
  const reqOpts = { ...opts, headers };
  let res = await fetch(url, reqOpts);

  if (res.status === 401 && token) {
    const ok = await _tryRefresh();
    if (ok) {
      reqOpts.headers = { ...reqOpts.headers, Authorization: `Bearer ${getToken()}` };
      res = await fetch(url, reqOpts);
    } else {
      clearToken();
      window.location.reload();
      throw new Error("Session expired, please log in again.");
    }
  }

  return _parseResponse(res);
}
