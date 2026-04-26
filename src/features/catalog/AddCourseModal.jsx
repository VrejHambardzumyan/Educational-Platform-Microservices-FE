import { useState } from "react";
import { API, apiFetch, getUserId } from "../../api/config";

export default function AddCourseModal({ onClose, onAdded, toast, setTab }) {
  const [form, setForm] = useState({
    Title: "", Description: "", DurationInMonth: 1, Price: 0, Category: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const instructorId = getUserId();
      const body = { ...form, ...(instructorId ? { InstructorId: instructorId } : {}) };
      const result = await apiFetch(`${API}/CourseCatalog/AddCourse`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      toast("Course created!", "success");
      onAdded(result);
      setCreated(result);
    } catch (err) {
      setError(err.message || "Failed to add course");
    } finally {
      setLoading(false);
    }
  }

  if (created) {
    return (
      <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-title">Course created!</div>
          <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "0.5rem 0 1.25rem" }}>
            <strong>{created.title || form.Title}</strong> was added. Now add sections, lessons, and content (video, text, files) in My Courses.
          </p>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={onClose}>Stay in Catalog</button>
            <button className="btn btn-primary" onClick={() => { onClose(); setTab("myCourses"); }}>
              Manage content →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Add new course</div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="e.g. React Fundamentals" value={form.Title} onChange={set("Title")} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} placeholder="Brief course description…" value={form.Description} onChange={set("Description")} required style={{ resize: "vertical" }} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="form-input" placeholder="e.g. Programming, Design…" value={form.Category} onChange={set("Category")} />
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
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Creating…" : "Create course"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
