import { useState, useEffect } from "react";
import { API, apiFetch } from "../../api/config";

function Stars({ rating, count }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <span>
      <span className="stars">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>
      <span className="rating-label">{rating.toFixed(1)} ({count || 0})</span>
    </span>
  );
}

export default function CourseDetail({ course, role, onClose, toast }) {
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState({});
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const secs = await apiFetch(`${API}/courses/${course.id}/sections`);
        const secList = Array.isArray(secs) ? secs : [];
        setSections(secList);

        const lessonMap = {};
        await Promise.all(
          secList.map(async (s) => {
            try {
              const ls = await apiFetch(`${API}/api/sections/${s.id}/lessons`);
              lessonMap[s.id] = Array.isArray(ls) ? ls : [];
            } catch {
              lessonMap[s.id] = [];
            }
          })
        );
        setLessons(lessonMap);
      } catch {
        setSections([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [course.id]);

  async function markComplete(lessonId) {
    if (completed[lessonId]) return;
    try {
      await apiFetch(`${API}/progress/lessons/complete`, {
        method: "POST",
        body: JSON.stringify({ CourseId: course.id, LessonId: lessonId }),
      });
      setCompleted((prev) => ({ ...prev, [lessonId]: true }));
      toast("Lesson marked complete!", "success");
    } catch (err) {
      toast(err.message || "Failed to mark complete", "error");
    }
  }

  const statusBadge = (s) => {
    const map = { Draft: "badge-neutral", Published: "badge-success", Archived: "badge-warning" };
    return <span className={`badge ${map[s] || "badge-neutral"}`}>{s || "Unknown"}</span>;
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title">{course.title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {course.category && <span className="badge badge-info">{course.category}</span>}
          {course.status && statusBadge(course.status)}
          <Stars rating={course.averageRating} count={course.ratingCount} />
        </div>

        {course.description && (
          <div className="detail-section">
            <div className="detail-section-title">Description</div>
            <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7 }}>{course.description}</p>
          </div>
        )}

        {course.price != null && (
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <span className="price-tag">{course.price?.toLocaleString()} ֏</span>
            {course.durationInMonth && (
              <span className="badge badge-neutral">{course.durationInMonth} month{course.durationInMonth !== 1 ? "s" : ""}</span>
            )}
          </div>
        )}

        <div className="detail-section">
          <div className="detail-section-title">Curriculum</div>
          {loading ? (
            <div className="loading-wrap" style={{ padding: "1rem" }}><div className="spinner" /></div>
          ) : sections.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--ink-3)" }}>No sections available yet.</p>
          ) : (
            sections.map((sec) => (
              <div key={sec.id} style={{ marginBottom: "1rem" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "0.4rem", color: "var(--ink)" }}>
                  {sec.title || sec.name || `Section ${sec.id}`}
                </div>
                <div style={{ paddingLeft: "1rem" }}>
                  {(lessons[sec.id] || []).length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No lessons yet.</p>
                  ) : (
                    (lessons[sec.id] || []).map((lesson) => (
                      <div key={lesson.id} className="detail-lesson">
                        <span style={{ fontSize: 14 }}>{lesson.title || lesson.name || `Lesson ${lesson.id}`}</span>
                        {role === "Student" && (
                          <button
                            className={`lesson-complete-btn ${completed[lesson.id] ? "done" : ""}`}
                            onClick={() => markComplete(lesson.id)}
                            disabled={completed[lesson.id]}
                          >
                            {completed[lesson.id] ? "✓ Done" : "Mark done"}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
