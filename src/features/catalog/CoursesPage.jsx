import { useState, useEffect, useCallback } from "react";
import { API, apiFetch, authHeaders } from "../../api/config";
import AddCourseModal from "./AddCourseModal";

export default function CoursesPage({ userId, role, toast }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API.catalog}/CourseCatalog/GetAllCourses`, {
        headers: authHeaders(),
      });
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function enroll(courseId) {
    setEnrollingId(courseId);
    try {
      await apiFetch(`${API.enrollment}/CourseEnrollment/AddEnrollment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ UserId: userId, CourseId: courseId }),
      });
      toast("Enrolled successfully!", "success");
    } catch (err) {
      toast(err.message || "Enrollment failed", "error");
    } finally {
      setEnrollingId(null);
    }
  }

  const durationLabel = (m) => m === 1 ? "1 month" : `${m} months`;

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Course Catalog</h1>
            <p className="page-subtitle">Browse and enroll in available courses.</p>
          </div>
          {(role === "Admin" || role === "Moderator") && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add course</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : courses.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No courses yet</div>
          <p style={{ fontSize: 14, marginTop: 4 }}>Add the first course to get started.</p>
        </div>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <div key={c.id} className="course-card">
              <div>
                <div className="course-card-title">{c.title}</div>
                <div style={{ marginTop: 8 }}>
                  <span className="badge badge-neutral">{durationLabel(c.durationInMonth)}</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <span className="price-tag">${c.price.toLocaleString()}</span>
                <button className="btn btn-primary btn-sm" onClick={() => enroll(c.id)} disabled={enrollingId === c.id}>
                  {enrollingId === c.id ? "Enrolling…" : "Enroll"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddCourseModal
          onClose={() => setShowAdd(false)}
          onAdded={(c) => setCourses((prev) => [...prev, c])}
          toast={toast}
        />
      )}
    </>
  );
}