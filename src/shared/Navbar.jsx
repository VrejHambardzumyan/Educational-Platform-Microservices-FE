export default function Navbar({ user, tab, setTab, logout }) {
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
        </div>
        <div className="nav-right">
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 10px",
            borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em",
            background: user.role === "Admin" ? "var(--accent-light)" : "var(--surface-2)",
            color: user.role === "Admin" ? "var(--accent-dark)" : "var(--ink-2)"
          }}>
            {user.role}
          </span>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--accent-light)", color: "var(--accent-dark)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
        </div>
      </div>
    </nav>
  );
}