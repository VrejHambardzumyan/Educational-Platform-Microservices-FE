import { useState, useEffect } from "react";
import { API, apiFetch } from "../../api/config";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: 2, cursor: "pointer", fontSize: 22 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ color: n <= (hover || value) ? "#f59e0b" : "var(--ink-4, #ccc)", transition: "color 0.1s" }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
        >★</span>
      ))}
    </span>
  );
}

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

function LessonContent({ lessonId }) {
  const [blocks, setBlocks] = useState(null);

  useEffect(() => {
    apiFetch(`${API}/api/lessons/${lessonId}/blocks`)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => (a.Order ?? a.order ?? 0) - (b.Order ?? b.order ?? 0));
        setBlocks(list);
      })
      .catch(() => setBlocks([]));
  }, [lessonId]);

  if (!blocks || blocks.length === 0) return null;

  return (
    <div style={{ marginTop: 10 }}>
      {blocks.map((b) => {
        const type = b.Type ?? b.type;
        const videoUrl = b.VideoUrl ?? b.videoUrl;
        const textContent = b.TextContent ?? b.textContent;
        const fileUrl = b.FileUrl ?? b.fileUrl;
        const key = b.Id ?? b.id;
        return (
          <div key={key} style={{ marginBottom: 10 }}>
            {type === 1 && videoUrl && (
              <video controls style={{ width: "100%", borderRadius: 6, maxHeight: 340, background: "#000", display: "block" }}>
                <source src={videoUrl} />
              </video>
            )}
            {type === 0 && textContent && (
              <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                {textContent}
              </p>
            )}
            {type === 2 && fileUrl && (
              <a
                href={fileUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                ↓ {decodeURIComponent(fileUrl.split("/").pop()).split("?")[0] || "Download PDF"}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CourseDetail({ course, role, onClose, toast }) {
  const [sections, setSections] = useState([]);
  const [lessons, setLessons] = useState({});
  const [completed, setCompleted] = useState({});
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [ratingFeedback, setRatingFeedback] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const secs = await apiFetch(`${API}/api/courses/${course.id}/sections`);
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

    async function loadMyRating() {
      if (role !== "Student") return;
      try {
        const data = await apiFetch(`${API}/courses/${course.id}/ratings/my`);
        if (data?.rating ?? data?.Rating) {
          setUserRating(data.rating ?? data.Rating);
          setRatingFeedback(data.feedback ?? data.Feedback ?? "");
          setRatingSubmitted(true);
        }
      } catch {
        // no prior rating
      }
    }

    load();
    loadMyRating();
  }, [course.id, role]);

  async function submitRating() {
    if (!userRating) return;
    setSubmittingRating(true);
    try {
      await apiFetch(`${API}/courses/${course.id}/ratings`, {
        method: "POST",
        body: JSON.stringify({ Rating: userRating, Feedback: ratingFeedback }),
      });
      setRatingSubmitted(true);
      toast("Rating submitted!", "success");
    } catch (err) {
      toast(err.message || "Failed to submit rating", "error");
    } finally {
      setSubmittingRating(false);
    }
  }

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
          {course.status && role !== "Student" && statusBadge(course.status)}
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
              <div key={sec.id} style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: "0.5rem", color: "var(--ink)" }}>
                  {sec.title || sec.name || `Section ${sec.id}`}
                </div>
                <div style={{ paddingLeft: "1rem" }}>
                  {(lessons[sec.id] || []).length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--ink-3)" }}>No lessons yet.</p>
                  ) : (
                    (lessons[sec.id] || []).map((lesson) => (
                      <div key={lesson.id} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border, #f0f0f0)" }}>
                        <div className="detail-lesson">
                          <span style={{ fontSize: 14, fontWeight: 500 }}>
                            {lesson.title || lesson.name || `Lesson ${lesson.id}`}
                            {lesson.durationInMinutes > 0 && (
                              <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: 8, fontWeight: 400 }}>
                                {lesson.durationInMinutes} min
                              </span>
                            )}
                          </span>
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
                        <LessonContent lessonId={lesson.id} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {role === "Student" && (
          <div className="detail-section">
            <div className="detail-section-title">{ratingSubmitted ? "Your rating" : "Rate this course"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <StarPicker value={userRating} onChange={(n) => { setUserRating(n); setRatingSubmitted(false); }} />
              </div>
              {!ratingSubmitted && (
                <>
                  <input
                    className="form-input"
                    placeholder="Feedback (optional)"
                    value={ratingFeedback}
                    onChange={(e) => setRatingFeedback(e.target.value)}
                    style={{ fontSize: 13 }}
                  />
                  <div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={submitRating}
                      disabled={!userRating || submittingRating}
                    >
                      {submittingRating ? "Submitting…" : "Submit rating"}
                    </button>
                  </div>
                </>
              )}
              {ratingSubmitted && (
                <button className="btn btn-ghost btn-sm" onClick={() => setRatingSubmitted(false)} style={{ alignSelf: "flex-start" }}>
                  Edit rating
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
