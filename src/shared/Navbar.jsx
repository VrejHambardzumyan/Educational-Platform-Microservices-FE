export default function Navbar({ user, tab, setTab, logout }) {
  const role = user.role;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo">Educat<span>X</span></div>
        <div className="nav-tabs">
          <button className={`nav-tab ${tab === "courses" ? "active" : ""}`} onClick={() => setTab("courses")}>
            Catalog
          </button>
          <button className={`nav-tab ${tab === "enrollments" ? "active" : ""}`} onClick={() => setTab("enrollments")}>
            My Enrollments
          </button>
          {role === "Student" && (
            <button className={`nav-tab ${tab === "progress" ? "active" : ""}`} onClick={() => setTab("progress")}>
              Progress
            </button>
          )}
          {(role === "Instructor" || role === "Admin") && (
            <button className={`nav-tab ${tab === "myCourses" ? "active" : ""}`} onClick={() => setTab("myCourses")}>
              My Courses
            </button>
          )}
          {role === "Admin" && (
            <button className={`nav-tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
              Users
            </button>
          )}
        </div>
        <div className="nav-right">
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px",
            borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em",
            background: role === "Admin" ? "var(--accent-light)" : role === "Instructor" ? "var(--info-bg)" : "var(--surface-2)",
            color: role === "Admin" ? "var(--accent-dark)" : role === "Instructor" ? "var(--info)" : "var(--ink-2)",
          }}>
            {role}
          </span>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--accent-light)", color: "var(--accent-dark)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600,
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
        </div>
      </div>
    </nav>
  );
}
