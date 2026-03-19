import { useState } from "react";
import { API, apiFetch, setToken } from "../../api/config";

export default function AuthPage({ onLogin, toast }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ UserName: "", Password: "", Email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await apiFetch(`${API.auth}/auth/signUp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UserName: form.UserName, Password: form.Password, Email: form.Email }),
        });
        toast("Account created! Please log in.", "success");
        setMode("login");
      } else {
        const data = await apiFetch(`${API.auth}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ UserName: form.UserName, Password: form.Password }),
        });
        const token = data.accessToken || data.AccessToken;
        if (!token) throw new Error("No token received from server");
        setToken(token);
        localStorage.setItem("refresh_token", data.refreshToken || data.RefreshToken || "");
        localStorage.setItem("user_id", data.userId || data.UserId || 1);
        onLogin(form.UserName, data.userId || data.UserId || 1);
        toast(`Welcome back, ${form.UserName}!`, "success");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">Educat<span>X</span></div>
        <div className="auth-title">{mode === "login" ? "Sign in" : "Create account"}</div>
        <div style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: "1rem" }}>
          {mode === "login" ? "Access your courses and enrollments." : "Start your learning journey today."}
        </div>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: "0.5rem", whiteSpace: "pre-line" }}>
            {error}
          </div>
        )}
        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" placeholder="e.g. john_doe" value={form.UserName} onChange={set("UserName")} required />
          </div>
          {mode === "register" && (
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.Email} onChange={set("Email")} required />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.Password} onChange={set("Password")} required />
          </div>
          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }} disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <div className="auth-toggle">
          {mode === "login" ? (
            <>Don't have an account? <button onClick={() => { setMode("register"); setError(""); }}>Register</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode("login"); setError(""); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}