import { useState, useEffect, useCallback } from "react";
import { API, apiFetch, getUserId } from "../../api/config";
import AddCourseModal from "./AddCourseModal";
import EditCourseModal from "./EditCourseModal";
import CourseDetail from "./CourseDetail";

function Stars({ rating, count }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span className="stars">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>
      <span className="rating-label">({count || 0})</span>
    </span>
  );
}

export default function CoursesPage({ role, toast, setTab }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [enrollingId, setEnrollingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [filters, setFilters] = useState({ search: "", category: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const myId = getUserId();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: 12 });
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      const data = await apiFetch(`${API}/CourseCatalog/GetAllCourses?${params}`);
      if (Array.isArray(data)) {
        setCourses(data);
        setTotalPages(1);
      } else {
        const items = data?.items ?? data?.Items ?? [];
        setCourses(Array.isArray(items) ? items : []);
        setTotalPages(data?.totalPages ?? data?.TotalPages ?? data?.totalCount ?? data?.TotalCount ?? 1);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast(err.message || "Failed to load courses", "error");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters, toast]);

  useEffect(() => { load(); }, [load]);

  function applySearch(e) {
    e.preventDefault();
    setPage(1);
    setFilters({ search: searchInput, category: categoryInput });
  }

  async function enroll(courseId) {
    setEnrollingId(courseId);
    try {
      await apiFetch(`${API}/CourseEnrollment/AddEnrollment`, {
        method: "POST",
        body: JSON.stringify({ CourseId: courseId }),
      });
      toast("Added to enrollments!", "success");
    } catch (err) {
      toast(err.message || "Enrollment failed", "error");
    } finally {
      setEnrollingId(null);
    }
  }

  async function deleteCourse(courseId) {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    setDeletingId(courseId);
    try {
      await apiFetch(`${API}/CourseCatalog/${courseId}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast("Course deleted.", "info");
    } catch (err) {
      toast(err.message || "Failed to delete course", "error");
    } finally {
      setDeletingId(null);
    }
  }

  const isOwnCourse = (c) => myId && String(c.instructorId) === String(myId);

  const statusBadge = (s) => {
    const map = { Draft: "badge-neutral", Published: "badge-success", Archived: "badge-warning" };
    return <span className={`badge ${map[s] || "badge-neutral"}`}>{s}</span>;
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Course Catalog</h1>
            <p className="page-subtitle">Browse and enroll in available courses.</p>
          </div>
          {(role === "Admin" || role === "Instructor") && (
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add course</button>
          )}
        </div>
      </div>

      <form className="search-bar" onSubmit={applySearch}>
        <input
          className="form-input"
          placeholder="Search courses…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <input
          className="form-input"
          placeholder="Category"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          style={{ maxWidth: 180 }}
        />
        <button type="submit" className="btn btn-secondary">Search</button>
        {(filters.search || filters.category) && (
          <button type="button" className="btn btn-ghost" onClick={() => {
            setSearchInput(""); setCategoryInput(""); setPage(1);
            setFilters({ search: "", category: "" });
          }}>Clear</button>
        )}
      </form>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : courses.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No courses found</div>
          <p style={{ fontSize: 14, marginTop: 4 }}>Try adjusting your search or browse all courses.</p>
        </div>
      ) : (
        <div className="card-grid">
          {courses.map((c) => (
            <div key={c.id} className="course-card">
              {c.thumbnailUrl && (
                <img src={c.thumbnailUrl} alt={c.title} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: "var(--radius)", marginBottom: 4 }} />
              )}
              <div>
                <div className="course-card-title" onClick={() => setSelectedCourse(c)} title="View details">
                  {c.title}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6, alignItems: "center" }}>
                  {c.category && <span className="badge badge-info">{c.category}</span>}
                  {c.status && role !== "Student" && statusBadge(c.status)}
                  {c.durationInMonth && (
                    <span className="badge badge-neutral">{c.durationInMonth}mo</span>
                  )}
                </div>
                {c.description && (
                  <p className="course-card-desc" style={{ marginTop: 8 }}>
                    {c.description.length > 100 ? c.description.slice(0, 100) + "…" : c.description}
                  </p>
                )}
                {(c.averageRating > 0) && (
                  <div style={{ marginTop: 6 }}>
                    <Stars rating={c.averageRating} count={c.ratingCount} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", gap: 8, flexWrap: "wrap" }}>
                <span className="price-tag">{c.price?.toLocaleString()} ֏</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {role === "Student" && (
                    <button className="btn btn-primary btn-sm" onClick={() => enroll(c.id)} disabled={enrollingId === c.id}>
                      {enrollingId === c.id ? "Adding…" : "Enroll"}
                    </button>
                  )}
                  {role === "Instructor" && isOwnCourse(c) && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditingCourse(c)}>
                      Edit
                    </button>
                  )}
                  {role === "Admin" && (
                    <>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingCourse(c)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c.id)} disabled={deletingId === c.id}>
                        {deletingId === c.id ? "…" : "Delete"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}

      {showAdd && (
        <AddCourseModal
          onClose={() => setShowAdd(false)}
          onAdded={(c) => { setCourses((prev) => [c, ...prev]); load(); }}
          toast={toast}
          setTab={setTab}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onUpdated={(updated) => {
            setCourses((prev) => prev.map((c) => c.id === updated.id ? updated : c));
            setEditingCourse(null);
          }}
          toast={toast}
        />
      )}

      {selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          role={role}
          onClose={() => setSelectedCourse(null)}
          toast={toast}
        />
      )}
    </>
  );
}
