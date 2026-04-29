import { useState, useEffect } from "react";
import { API, apiFetch } from "../../api/config";

export default function SettingsPage({ toast }) {
  const [profile, setProfile] = useState(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch(`${API}/users/me`)
      .then((data) => {
        setProfile(data);
        setEmail(data.email || "");
      })
      .catch(() => toast("Failed to load profile.", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await apiFetch(`${API}/users/me`, {
        method: "PUT",
        body: JSON.stringify({ Email: email }),
      });
      setProfile(updated);
      toast("Profile updated.", "success");
    } catch (err) {
      toast(err.message || "Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading-wrap"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account information.</p>
      </div>

      <div style={{ maxWidth: 480 }}>
        <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Account Info
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <InfoRow label="Username" value={profile?.userName} />
            <InfoRow label="Role" value={profile?.role} />
            <InfoRow label="Member since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"} />
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ fontSize: 13, color: "var(--ink-2)", marginBottom: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Edit Profile
          </div>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "var(--ink-2)" }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}
