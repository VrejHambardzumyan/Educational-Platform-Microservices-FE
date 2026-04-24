import { useState, useEffect, useCallback } from "react";
import { API, apiFetch } from "../../api/config";

const ROLES = ["Student", "Instructor", "Admin"];

export default function UsersPage({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`${API}/users?page=${page}&pageSize=20`);
      setUsers(Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []);
      setTotalPages(data?.totalPages || 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function updateRole(id, role) {
    setUpdatingId(id);
    try {
      await apiFetch(`${API}/users/${id}/role`, {
        method: "PUT",
        body: JSON.stringify({ Role: role }),
      });
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
      toast("Role updated.", "success");
    } catch (err) {
      toast(err.message || "Failed to update role", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await apiFetch(`${API}/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast("User deleted.", "info");
    } catch (err) {
      toast(err.message || "Failed to delete user", "error");
      setDeletingId(null);
    }
  }

  const roleBadge = (r) => {
    const map = { Admin: "badge-accent", Instructor: "badge-info", Student: "badge-neutral" };
    return <span className={`badge ${map[r] || "badge-neutral"}`}>{r || "—"}</span>;
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Users</h1>
        <p className="page-subtitle">Manage registered users and their roles.</p>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">👥</div>
          <div className="empty-title">No users found</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.userName}</td>
                  <td style={{ color: "var(--ink-2)", fontSize: 13 }}>{u.email}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td style={{ color: "var(--ink-2)", fontSize: 13 }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select
                        className="form-input"
                        value={u.role || "Student"}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        disabled={updatingId === u.id}
                        style={{ padding: "5px 8px", fontSize: 13, width: "auto" }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteUser(u.id)}
                        disabled={deletingId === u.id}
                      >
                        {deletingId === u.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </>
  );
}
