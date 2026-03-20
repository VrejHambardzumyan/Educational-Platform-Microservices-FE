import { useState, useEffect, useCallback } from "react";
import { API, apiFetch } from "../../api/config";

export default function EnrollmentsPage({ userId, toast }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API.enrollment}/CourseEnrollment/GetUser/${userId}`);
      setEnrollments(Array.isArray(data) ? data : []);
    } catch {
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function initiatePayment() {
    const draftEnrollments = enrollments.filter(e => e.status === "Draft");
    if (draftEnrollments.length === 0) {
      toast("No draft enrollments to pay for.", "error");
      return;
    }
    try {
      const data = await apiFetch(`${API.enrollment}/CourseEnrollment/InitiatePayment/${userId}`, {
        method: "POST",
      });
      toast(`Payment initiated! ID: ${data.paymentId}`, "success");
      await load();
    } catch (err) {
      toast(err.message || "Payment initiation failed", "error");
    }
  }

  async function activate(id) {
    try {
      await apiFetch(`${API.enrollment}/CourseEnrollment/Activate/${id}`, { method: "PUT" });
      toast("Enrollment activated!", "success");
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: "Completed", activatedAt: new Date().toISOString() } : e));
    } catch (err) {
      toast(err.message || "Failed to activate", "error");
    }
  }

  async function cancel(id) {
    try {
      await apiFetch(`${API.enrollment}/CourseEnrollment/Cancel/${id}`, { method: "PUT" });
      toast("Enrollment cancelled.", "info");
      setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: "Deleted" } : e));
    } catch (err) {
      toast(err.message || "Failed to cancel", "error");
    }
  }

  const statusBadge = (s) => {
    const map = { Draft: "badge-neutral", Processing: "badge-info", Completed: "badge-success", Failed: "badge-danger", Deleted: "badge-danger" };
    return <span className={`badge ${map[s] || "badge-neutral"}`}>{s || "Unknown"}</span>;
  };

  const active = enrollments.filter(e => e.status !== "Deleted");
  const total = active.reduce((s, e) => s + (e.amount || 0), 0);
  const completed = enrollments.filter(e => e.status === "Completed").length;
  const drafts = enrollments.filter(e => e.status === "Draft");

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Enrollments</h1>
            <p className="page-subtitle">Track your enrolled courses and payment status.</p>
          </div>
          {drafts.length > 0 && (
            <div style={{
              background: "var(--accent-light)", border: "1px solid var(--accent)",
              borderRadius: "var(--radius-lg)", padding: "1rem 1.25rem",
              display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap"
            }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--accent-dark)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Cart</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--accent-dark)", marginTop: 2 }}>
                  {drafts.length} course(s) · ${drafts.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString()} ֏
                </div>
              </div>
              <button className="btn btn-primary" onClick={initiatePayment}>Checkout</button>
            </div>
          )}
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total enrolled</div>
          <div className="stat-value">{active.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value accent">{completed}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total spent</div>
          <div className="stat-value">${total.toLocaleString()} ֏</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : enrollments.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎓</div>
          <div className="empty-title">No enrollments yet</div>
          <p style={{ fontSize: 14, marginTop: 4 }}>Browse the catalog and enroll in a course.</p>
        </div>
      ) : (
        <div className="enroll-list">
          {enrollments.map((e) => (
            <div key={e.id} className="enroll-item">
              <div className="enroll-info">
                <span className="enroll-label">
                  {e.status === "Draft" && (
                    <span style={{ fontSize: 11, background: "var(--warning-bg)", color: "var(--warning)", padding: "2px 8px", borderRadius: 20, fontWeight: 600, marginRight: 8 }}>
                      IN CART
                    </span>
                  )}
                  Course #{e.courseId}
                </span>
                <span className="enroll-meta">
                  Enrolled {new Date(e.createdAt).toLocaleDateString()} · ${e.amount?.toLocaleString()} ֏
                  {e.activatedAt && ` · Activated ${new Date(e.activatedAt).toLocaleDateString()}`}
                </span>
              </div>
              <div className="enroll-actions">
                {statusBadge(e.status)}
                {e.status === "Draft" && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => activate(e.id)}>Activate</button>
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(e.id)}>Cancel</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}