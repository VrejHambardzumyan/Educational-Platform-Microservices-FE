import { useState, useEffect, useCallback } from "react";
import { API, apiFetch } from "../../api/config";

export default function ProgressPage({ toast }) {
  const [progress, setProgress] = useState([]);
  const [courses, setCourses] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/progress/courses`);
      const list = Array.isArray(data) ? data : [];
      setProgress(list);

      if (list.length > 0) {
        try {
          const catalogData = await apiFetch(`${API}/CourseCatalog/GetAllCourses?pageSize=100`);
          const items = Array.isArray(catalogData?.items) ? catalogData.items
            : Array.isArray(catalogData?.Items) ? catalogData.Items : [];
          const map = {};
          items.forEach((c) => { map[c.id] = c.title; });
          setCourses(map);
        } catch {
          setCourses({});
        }
      }
    } catch {
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const total = progress.length;
  const done = progress.filter((p) => p.isCompleted).length;
  const avgPct = total > 0 ? Math.round(progress.reduce((s, p) => s + (p.progressPercentage || 0), 0) / total) : 0;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">My Progress</h1>
        <p className="page-subtitle">Track your learning progress across all courses.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Courses tracked</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value accent">{done}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg. progress</div>
          <div className="stat-value">{avgPct}%</div>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : progress.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No progress tracked yet</div>
          <p style={{ fontSize: 14, marginTop: 4 }}>Enroll in courses and mark lessons complete to track progress.</p>
        </div>
      ) : (
        <div className="progress-list">
          {progress.map((p) => (
            <div key={p.courseId} className="progress-item">
              <div className="progress-header">
                <div>
                  <div className="progress-title">
                    {courses[p.courseId] || `Course #${p.courseId}`}
                  </div>
                  <div className="progress-label">
                    {p.completedLessons} / {p.totalLessons} lessons
                    {p.isCompleted && (
                      <span className="badge badge-success" style={{ marginLeft: 8 }}>Completed</span>
                    )}
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.2rem", color: "var(--accent)" }}>
                  {Math.round(p.progressPercentage || 0)}%
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${Math.min(100, p.progressPercentage || 0)}%` }} />
              </div>
              {p.completedAt && (
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  Completed {new Date(p.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
