import { useState, useEffect, useCallback } from "react";
import { API, apiFetch } from "../../api/config";

function SectionPanel({ section, courseId, toast }) {
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState(null);
  const [lessonInput, setLessonInput] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);

  async function loadLessons() {
    if (lessons !== null) return;
    try {
      const data = await apiFetch(`${API}/api/sections/${section.id}/lessons`);
      setLessons(Array.isArray(data) ? data : []);
    } catch {
      setLessons([]);
    }
  }

  function toggle() {
    if (!open) loadLessons();
    setOpen((v) => !v);
  }

  async function addLesson(e) {
    e.preventDefault();
    if (!lessonInput.trim()) return;
    setAddingLesson(true);
    try {
      const created = await apiFetch(`${API}/api/sections/${section.id}/lessons`, {
        method: "POST",
        body: JSON.stringify({ Title: lessonInput.trim() }),
      });
      setLessons((prev) => [...(prev || []), created]);
      setLessonInput("");
      toast("Lesson added!", "success");
    } catch (err) {
      toast(err.message || "Failed to add lesson", "error");
    } finally {
      setAddingLesson(false);
    }
  }

  return (
    <div className="section-panel">
      <div className="section-header" onClick={toggle}>
        <span className="section-title">{section.title || section.name || `Section ${section.id}`}</span>
        <span style={{ fontSize: 12, color: "var(--ink-3)" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div className="lesson-list">
          {lessons === null ? (
            <div style={{ padding: "0.6rem 1rem", fontSize: 13, color: "var(--ink-3)" }}>Loading…</div>
          ) : lessons.length === 0 ? (
            <div style={{ padding: "0.6rem 1rem", fontSize: 13, color: "var(--ink-3)" }}>No lessons yet.</div>
          ) : (
            lessons.map((l) => (
              <div key={l.id} className="lesson-item">
                <span>{l.title || l.name || `Lesson ${l.id}`}</span>
              </div>
            ))
          )}
          <form className="add-inline-form" onSubmit={addLesson}>
            <input
              className="form-input"
              placeholder="New lesson title…"
              value={lessonInput}
              onChange={(e) => setLessonInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={addingLesson}>
              {addingLesson ? "…" : "+ Lesson"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MyCourseItem({ course, onPublished, onDeleted, toast }) {
  const [expanded, setExpanded] = useState(false);
  const [sections, setSections] = useState(null);
  const [sectionInput, setSectionInput] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState(course.status || "Draft");

  async function loadSections() {
    if (sections !== null) return;
    try {
      const data = await apiFetch(`${API}/courses/${course.id}/sections`);
      setSections(Array.isArray(data) ? data : []);
    } catch {
      setSections([]);
    }
  }

  function toggle() {
    if (!expanded) loadSections();
    setExpanded((v) => !v);
  }

  async function publish() {
    setPublishing(true);
    try {
      await apiFetch(`${API}/CourseCatalog/${course.id}/publish`, { method: "PATCH" });
      setStatus("Published");
      onPublished(course.id);
      toast("Course published!", "success");
    } catch (err) {
      toast(err.message || "Failed to publish", "error");
    } finally {
      setPublishing(false);
    }
  }

  async function deleteCourse() {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await apiFetch(`${API}/CourseCatalog/${course.id}`, { method: "DELETE" });
      onDeleted(course.id);
      toast("Course deleted.", "info");
    } catch (err) {
      toast(err.message || "Failed to delete", "error");
      setDeleting(false);
    }
  }

  async function addSection(e) {
    e.preventDefault();
    if (!sectionInput.trim()) return;
    setAddingSection(true);
    try {
      const created = await apiFetch(`${API}/api/courses/${course.id}/sections`, {
        method: "POST",
        body: JSON.stringify({ Title: sectionInput.trim() }),
      });
      setSections((prev) => [...(prev || []), created]);
      setSectionInput("");
      toast("Section added!", "success");
    } catch (err) {
      toast(err.message || "Failed to add section", "error");
    } finally {
      setAddingSection(false);
    }
  }

  const statusBadge = (s) => {
    const map = { Draft: "badge-neutral", Published: "badge-success", Archived: "badge-warning" };
    return <span className={`badge ${map[s] || "badge-neutral"}`}>{s}</span>;
  };

  return (
    <div className="my-course-item">
      <div className="my-course-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className="my-course-title">{course.title}</span>
          {statusBadge(status)}
          {course.category && <span className="badge badge-info">{course.category}</span>}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {status !== "Published" && (
            <button className="btn btn-success btn-sm" onClick={publish} disabled={publishing}>
              {publishing ? "Publishing…" : "Publish"}
            </button>
          )}
          <button className="btn btn-danger btn-sm" onClick={deleteCourse} disabled={deleting}>
            {deleting ? "…" : "Delete"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={toggle}>
            {expanded ? "Hide sections ▲" : "Manage sections ▼"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="my-course-body">
          {sections === null ? (
            <div className="loading-wrap" style={{ padding: "1rem" }}><div className="spinner" /></div>
          ) : (
            <>
              {sections.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--ink-3)", marginBottom: "0.75rem" }}>No sections yet. Add one below.</p>
              ) : (
                sections.map((s) => (
                  <SectionPanel key={s.id} section={s} courseId={course.id} toast={toast} />
                ))
              )}
              <form style={{ display: "flex", gap: 8, marginTop: "0.5rem" }} onSubmit={addSection}>
                <input
                  className="form-input"
                  placeholder="New section title…"
                  value={sectionInput}
                  onChange={(e) => setSectionInput(e.target.value)}
                  style={{ flex: 1, fontSize: 13, padding: "7px 11px" }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={addingSection}>
                  {addingSection ? "…" : "+ Section"}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyCoursesPage({ toast }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/CourseCatalog/my-courses`);
      setCourses(Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Courses</h1>
            <p className="page-subtitle">Manage your courses, sections, and lessons.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : courses.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📝</div>
          <div className="empty-title">No courses yet</div>
          <p style={{ fontSize: 14, marginTop: 4 }}>Go to the Catalog tab and add your first course.</p>
        </div>
      ) : (
        courses.map((c) => (
          <MyCourseItem
            key={c.id}
            course={c}
            onPublished={(id) => setCourses((prev) => prev.map((x) => x.id === id ? { ...x, status: "Published" } : x))}
            onDeleted={(id) => setCourses((prev) => prev.filter((x) => x.id !== id))}
            toast={toast}
          />
        ))
      )}
    </>
  );
}
