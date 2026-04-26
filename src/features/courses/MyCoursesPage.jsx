import { useState, useEffect, useCallback } from "react";
import { API, apiFetch } from "../../api/config";

const BLOCK_TYPE = { 0: "Text", 1: "Video", 2: "File" };

function LessonBlocks({ lessonId, toast }) {
  const [open, setOpen] = useState(false);
  const [blocks, setBlocks] = useState(null);
  const [type, setType] = useState("1");
  const [textContent, setTextContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function loadBlocks() {
    if (blocks !== null) return;
    try {
      const data = await apiFetch(`${API}/api/lessons/${lessonId}/blocks`);
      setBlocks(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.message || "Failed to load content blocks", "error");
      setBlocks([]);
    }
  }

  function toggle() {
    if (!open) loadBlocks();
    setOpen((v) => !v);
  }

  async function addBlock(e) {
    e.preventDefault();
    setAdding(true);
    try {
      const t = Number(type);
      const body = { Type: t, Order: (blocks?.length || 0) + 1 };
      if (t === 0) body.TextContent = textContent;
      else if (t === 1) body.VideoUrl = videoUrl;
      else if (t === 2) body.FileUrl = fileUrl;
      const created = await apiFetch(`${API}/api/lessons/${lessonId}/blocks`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setBlocks((prev) => [...(prev || []), created]);
      setTextContent(""); setVideoUrl(""); setFileUrl("");
      toast("Content block added!", "success");
    } catch (err) {
      toast(err.message || "Failed to add block", "error");
    } finally {
      setAdding(false);
    }
  }

  async function deleteBlock(id) {
    setDeletingId(id);
    try {
      await apiFetch(`${API}/api/blocks/${id}`, { method: "DELETE" });
      setBlocks((prev) => prev.filter((b) => b.id !== id));
      toast("Block deleted.", "info");
    } catch (err) {
      toast(err.message || "Failed to delete block", "error");
      setDeletingId(null);
    }
  }

  async function uploadVideo(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await apiFetch(`${API}/upload/video`, { method: "POST", body: fd });
      setVideoUrl(result?.url || result?.Url || "");
      toast("Video uploaded!", "success");
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  async function uploadDocument(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await apiFetch(`${API}/upload/document`, { method: "POST", body: fd });
      setFileUrl(result?.url || result?.Url || "");
      toast("Document uploaded!", "success");
    } catch (err) {
      toast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ marginTop: 6 }}>
      <button type="button" className="btn btn-ghost btn-sm" onClick={toggle} style={{ fontSize: 11 }}>
        {open ? "Hide content ▲" : "Manage content ▼"}
      </button>
      {open && (
        <div style={{ marginTop: 6, paddingLeft: "0.75rem", borderLeft: "2px solid var(--border, #e5e7eb)" }}>
          {blocks === null ? (
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Loading…</div>
          ) : blocks.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>No content blocks yet.</div>
          ) : (
            blocks.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6, padding: "5px 8px", background: "var(--surface-2, #f8f9fa)", borderRadius: 6, fontSize: 12 }}>
                <span style={{ fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>{BLOCK_TYPE[b.type] ?? b.type}</span>
                <span style={{ color: "var(--ink-2)", flex: 1, wordBreak: "break-all" }}>
                  {b.textContent || b.videoUrl || b.fileUrl || "—"}
                </span>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteBlock(b.id)}
                  disabled={deletingId === b.id}
                  style={{ fontSize: 11, padding: "2px 7px", flexShrink: 0 }}
                >
                  {deletingId === b.id ? "…" : "✕"}
                </button>
              </div>
            ))
          )}
          <form onSubmit={addBlock} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <select
              className="form-input"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ fontSize: 12, padding: "4px 8px" }}
            >
              <option value="1">Video</option>
              <option value="0">Text</option>
              <option value="2">File</option>
            </select>
            {type === "0" && (
              <textarea
                className="form-input"
                placeholder="Text content…"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={2}
                style={{ fontSize: 12, resize: "vertical" }}
                required
              />
            )}
            {type === "1" && (
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="form-input"
                  placeholder="Video URL…"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{ fontSize: 12, flex: 1 }}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", fontSize: 11, flexShrink: 0 }}>
                  {uploading ? "Uploading…" : "Upload"}
                  <input
                    type="file"
                    accept="video/*"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={(e) => { if (e.target.files[0]) uploadVideo(e.target.files[0]); }}
                  />
                </label>
              </div>
            )}
            {type === "2" && (
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="form-input"
                  placeholder="PDF URL…"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  style={{ fontSize: 12, flex: 1 }}
                />
                <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer", fontSize: 11, flexShrink: 0 }}>
                  {uploading ? "Uploading…" : "Upload PDF"}
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
                    disabled={uploading}
                    onChange={(e) => { if (e.target.files[0]) uploadDocument(e.target.files[0]); }}
                  />
                </label>
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={adding || uploading || (type === "1" && !videoUrl) || (type === "2" && !fileUrl)}
              style={{ fontSize: 11 }}
            >
              {adding ? "…" : "+ Add block"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function SectionPanel({ section, courseId, toast }) {
  const [open, setOpen] = useState(false);
  const [lessons, setLessons] = useState(null);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [addingLesson, setAddingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  async function loadLessons() {
    if (lessons !== null) return;
    try {
      const data = await apiFetch(`${API}/api/sections/${section.id}/lessons`);
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.message || "Failed to load lessons", "error");
      setLessons([]);
    }
  }

  function toggle() {
    if (!open) loadLessons();
    setOpen((v) => !v);
  }

  async function addLesson(e) {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setAddingLesson(true);
    try {
      const body = {
        Title: lessonTitle.trim(),
        OrderIndex: (lessons?.length || 0) + 1,
      };
      if (lessonDescription.trim()) body.Description = lessonDescription.trim();
      if (lessonDuration) body.DurationInMinutes = Number(lessonDuration);
      const created = await apiFetch(`${API}/api/sections/${section.id}/lessons`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setLessons((prev) => [...(prev || []), created]);
      setLessonTitle(""); setLessonDescription(""); setLessonDuration("");
      toast("Lesson added!", "success");
    } catch (err) {
      toast(err.message || "Failed to add lesson", "error");
    } finally {
      setAddingLesson(false);
    }
  }

  async function deleteLesson(lessonId) {
    if (!window.confirm("Delete this lesson?")) return;
    setDeletingLessonId(lessonId);
    try {
      await apiFetch(`${API}/courses/${courseId}/lessons/${lessonId}`, { method: "DELETE" });
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast("Lesson deleted.", "info");
    } catch (err) {
      toast(err.message || "Failed to delete lesson", "error");
      setDeletingLessonId(null);
    }
  }

  return (
    <div className="section-panel">
      <div className="section-header" onClick={toggle} style={{ cursor: "pointer" }}>
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
              <div key={l.id} className="lesson-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <span style={{ fontWeight: 500 }}>
                    {l.title || l.name || `Lesson ${l.id}`}
                    {l.durationInMinutes > 0 && (
                      <span style={{ fontSize: 12, color: "var(--ink-3)", marginLeft: 8 }}>{l.durationInMinutes} min</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteLesson(l.id)}
                    disabled={deletingLessonId === l.id}
                    style={{ marginLeft: 8, flexShrink: 0 }}
                  >
                    {deletingLessonId === l.id ? "…" : "Delete"}
                  </button>
                </div>
                <LessonBlocks lessonId={l.id} toast={toast} />
              </div>
            ))
          )}
          <form style={{ display: "flex", flexDirection: "column", gap: 6, margin: "0.5rem 0.75rem" }} onSubmit={addLesson}>
            <input
              className="form-input"
              placeholder="Lesson title…"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              style={{ fontSize: 13 }}
            />
            <input
              className="form-input"
              placeholder="Description (optional)"
              value={lessonDescription}
              onChange={(e) => setLessonDescription(e.target.value)}
              style={{ fontSize: 13 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="form-input"
                type="number"
                placeholder="Duration (min)"
                min={1}
                value={lessonDuration}
                onChange={(e) => setLessonDuration(e.target.value)}
                style={{ fontSize: 13, maxWidth: 140 }}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={addingLesson}>
                {addingLesson ? "…" : "+ Lesson"}
              </button>
            </div>
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
      const data = await apiFetch(`${API}/api/courses/${course.id}/sections`);
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      toast(err.message || "Failed to load sections", "error");
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
    } catch (err) {
      toast(err.message || "Failed to load courses", "error");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

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
