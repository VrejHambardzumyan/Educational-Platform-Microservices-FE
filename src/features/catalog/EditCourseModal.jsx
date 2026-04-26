import { useState } from "react";
import { API, apiFetch } from "../../api/config";

export default function EditCourseModal({ course, onClose, onUpdated, toast }) {
  const [form, setForm] = useState({
    Title: course.title || "",
    Description: course.description || "",
    Category: course.category || "",
    DurationInMonth: course.durationInMonth || 1,
    Price: course.price || 0,
    ThumbnailUrl: course.thumbnailUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const updated = await apiFetch(`${API}/CourseCatalog/${course.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast("Course updated!", "success");
      onUpdated(updated || { ...course, ...form, title: form.Title, description: form.Description, category: form.Category, durationInMonth: form.DurationInMonth, price: form.Price, thumbnailUrl: form.ThumbnailUrl });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Edit course</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.Title} onChange={set("Title")} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.Description} onChange={set("Description")} required style={{ resize: "vertical" }} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="form-input" value={form.Category} onChange={set("Category")} />
          </div>
          <div className="form-group">
            <label className="form-label">Thumbnail URL <span style={{ fontWeight: 400, color: "var(--ink-3)" }}>(optional)</span></label>
            <input className="form-input" placeholder="https://…" value={form.ThumbnailUrl} onChange={set("ThumbnailUrl")} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Duration (months)</label>
              <input className="form-input" type="number" min={1} max={12} value={form.DurationInMonth} onChange={set("DurationInMonth")} required />
            </div>
            <div className="form-group">
              <label className="form-label">Price (֏)</label>
              <input className="form-input" type="number" min={0} max={100000} value={form.Price} onChange={set("Price")} required />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving…" : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
