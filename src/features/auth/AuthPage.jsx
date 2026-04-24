import { useState } from "react";
import { API, apiFetch, setToken } from "../../api/config";

export default function AuthPage({ onLogin, toast }) {
  const [mode, setMode] = useState("login");
  // modes: login | register | otp | forgot | forgot-otp
  const [form, setForm] = useState({
    UserName: "", Password: "", Email: "", Role: "Student",
    Otp: "", NewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function switchMode(m) {
    setMode(m);
    setError("");
  }

  function storeAndLogin(authData, username) {
    const token = authData.accessToken || authData.AccessToken;
    if (!token) throw new Error("No token received from server");
    setToken(token);
    localStorage.setItem("refresh_token", authData.refreshToken || authData.RefreshToken || "");
    localStorage.setItem("user_id", authData.userId || "");
    onLogin(username, authData.userId || "");
    toast(`Welcome, ${username}!`, "success");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const data = await apiFetch(`${API}/auth/login`, {
          method: "POST",
          body: JSON.stringify({ UserName: form.UserName, Password: form.Password }),
        });
        storeAndLogin(data, form.UserName);

      } else if (mode === "register") {
        const data = await apiFetch(`${API}/auth/signUp`, {
          method: "POST",
          body: JSON.stringify({
            UserName: form.UserName,
            Password: form.Password,
            Email: form.Email,
            Role: form.Role,
          }),
        });
        if (data?.requiresOtp) {
          switchMode("otp");
          toast("Check your email for a verification code.", "info");
        } else if (data?.auth?.accessToken || data?.auth?.AccessToken) {
          storeAndLogin(data.auth, form.UserName);
        } else {
          toast("Account created! Please sign in.", "success");
          switchMode("login");
        }

      } else if (mode === "otp") {
        const data = await apiFetch(`${API}/auth/otp/verify`, {
          method: "POST",
          body: JSON.stringify({ Email: form.Email, Otp: form.Otp, Purpose: "SignUp" }),
        });
        if (data?.accessToken || data?.AccessToken) {
          storeAndLogin(data, form.UserName);
        } else {
          toast("Email verified! Please sign in.", "success");
          switchMode("login");
        }

      } else if (mode === "forgot") {
        await apiFetch(`${API}/auth/reset-password/request`, {
          method: "POST",
          body: JSON.stringify({ Email: form.Email }),
        });
        switchMode("forgot-otp");
        toast("Reset code sent to your email.", "info");

      } else if (mode === "forgot-otp") {
        await apiFetch(`${API}/auth/reset-password/confirm`, {
          method: "POST",
          body: JSON.stringify({
            Email: form.Email,
            Otp: form.Otp,
            NewPassword: form.NewPassword,
          }),
        });
        toast("Password reset! Please sign in.", "success");
        switchMode("login");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (mode === "otp") {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">Educat<span>X</span></div>
          <div className="auth-title">Verify your email</div>
          <div style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: "1rem" }}>
            Enter the code sent to <strong>{form.Email}</strong>.
          </div>
          {error && <div className="alert alert-error" style={{ marginBottom: "0.5rem" }}>{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input className="form-input" placeholder="123456" value={form.Otp} onChange={set("Otp")} required autoFocus />
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Verifying…" : "Verify"}
            </button>
          </form>
          <div className="auth-toggle">
            <button onClick={() => switchMode("login")}>Back to sign in</button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "forgot" || mode === "forgot-otp") {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">Educat<span>X</span></div>
          <div className="auth-title">{mode === "forgot" ? "Reset password" : "Enter reset code"}</div>
          <div style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: "1rem" }}>
            {mode === "forgot"
              ? "We'll send a reset code to your email."
              : `Enter the code sent to ${form.Email} and your new password.`}
          </div>
          {error && <div className="alert alert-error" style={{ marginBottom: "0.5rem" }}>{error}</div>}
          <form className="auth-form" onSubmit={submit}>
            {mode === "forgot" && (
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.Email} onChange={set("Email")} required autoFocus />
              </div>
            )}
            {mode === "forgot-otp" && (
              <>
                <div className="form-group">
                  <label className="form-label">Reset Code</label>
                  <input className="form-input" placeholder="123456" value={form.Otp} onChange={set("Otp")} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" placeholder="New password" value={form.NewPassword} onChange={set("NewPassword")} required />
                </div>
              </>
            )}
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
              {loading ? "Please wait…" : mode === "forgot" ? "Send reset code" : "Reset password"}
            </button>
          </form>
          <div className="auth-toggle">
            <button onClick={() => switchMode("login")}>Back to sign in</button>
          </div>
        </div>
      </div>
    );
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
            <>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.Email} onChange={set("Email")} required />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.Role} onChange={set("Role")}>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                </select>
              </div>
            </>
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
            <>Don't have an account? <button onClick={() => switchMode("register")}>Register</button></>
          ) : (
            <>Already have an account? <button onClick={() => switchMode("login")}>Sign in</button></>
          )}
        </div>
        {mode === "login" && (
          <div className="auth-toggle" style={{ marginTop: "0.5rem" }}>
            <button onClick={() => switchMode("forgot")}>Forgot password?</button>
          </div>
        )}
      </div>
    </div>
  );
}
