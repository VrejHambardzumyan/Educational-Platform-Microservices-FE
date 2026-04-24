import { useState } from "react";
import { API, apiFetch } from "../../api/config";

export default function CardPaymentModal({ userId, role, onClose, onDone, toast }) {
  const [form, setForm] = useState({
    CardNumber: "", CardholderName: "", ExpiryMonth: "", ExpiryYear: "", Cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function pollEnrollments(attempts = 0) {
    if (attempts >= 10) {
      setProcessing(false);
      toast("Payment status unclear. Check My Enrollments.", "info");
      onDone();
      return;
    }

    await new Promise((r) => setTimeout(r, 3000));

    try {
      const endpoint = role === "Admin"
        ? `${API}/CourseEnrollment/GetUser/${userId}`
        : `${API}/CourseEnrollment/my-enrollments`;
      const data = await apiFetch(endpoint);
      const enrollments = Array.isArray(data) ? data : [];
      const stillProcessing = enrollments.some((e) => e.status === "Processing");
      if (stillProcessing) {
        pollEnrollments(attempts + 1);
      } else {
        setProcessing(false);
        const hasFailed = enrollments.some((e) => e.status === "Failed");
        toast(hasFailed ? "Some payments failed. Check My Enrollments." : "Payment completed!", hasFailed ? "error" : "success");
        onDone();
      }
    } catch {
      pollEnrollments(attempts + 1);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const month = Number(form.ExpiryMonth);
    const year = Number(form.ExpiryYear);
    if (form.CardNumber.replace(/\s/g, "").length !== 16) {
      setError("Card number must be 16 digits.");
      return;
    }
    if (month < 1 || month > 12) {
      setError("Expiry month must be between 1 and 12.");
      return;
    }
    if (form.Cvv.length < 3 || form.Cvv.length > 4) {
      setError("CVV must be 3 or 4 digits.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`${API}/CourseEnrollment/SubmitCard`, {
        method: "POST",
        body: JSON.stringify({
          CardNumber: form.CardNumber.replace(/\s/g, ""),
          CardholderName: form.CardholderName,
          ExpiryMonth: month,
          ExpiryYear: year,
          Cvv: form.Cvv,
        }),
      });
      setLoading(false);
      setProcessing(true);
      pollEnrollments(0);
    } catch (err) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  }

  function formatCardNumber(val) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }

  if (processing) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <div className="modal-title">Processing Payment</div>
          <div className="processing-banner">
            <div className="spinner" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Payment is being processed…</div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
                This usually takes a few seconds. Please wait.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Card Payment</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Card Number</label>
            <input
              className="form-input"
              placeholder="1234 5678 9012 3456"
              value={form.CardNumber}
              onChange={(e) => setForm((f) => ({ ...f, CardNumber: formatCardNumber(e.target.value) }))}
              maxLength={19}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Cardholder Name</label>
            <input className="form-input" placeholder="John Doe" value={form.CardholderName} onChange={set("CardholderName")} required />
          </div>
          <div className="form-grid-3">
            <div className="form-group" style={{ gridColumn: "span 1" }}>
              <label className="form-label">Exp. Month</label>
              <input className="form-input" type="number" placeholder="MM" min={1} max={12} value={form.ExpiryMonth} onChange={set("ExpiryMonth")} required />
            </div>
            <div className="form-group" style={{ gridColumn: "span 1" }}>
              <label className="form-label">Exp. Year</label>
              <input className="form-input" type="number" placeholder="YYYY" min={new Date().getFullYear()} max={2040} value={form.ExpiryYear} onChange={set("ExpiryYear")} required />
            </div>
            <div className="form-group" style={{ gridColumn: "span 1" }}>
              <label className="form-label">CVV</label>
              <input className="form-input" placeholder="123" maxLength={4} value={form.Cvv} onChange={(e) => setForm((f) => ({ ...f, Cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting…" : "Pay now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
