import { useState } from "react";
import { clearToken, getUserRole } from "./api/config";
import { useToasts } from "./shared/useToasts";
import ToastContainer from "./shared/ToastContainer";
import Navbar from "./shared/Navbar";
import AuthPage from "./features/auth/AuthPage";
import CoursesPage from "./features/catalog/CoursesPage";
import EnrollmentsPage from "./features/enrollment/EnrollmentsPage";
import styles from "./shared/styles";

export default function App() {
  const [user, setUser] = useState(() => {
  const stored = localStorage.getItem("user");
  return stored ? JSON.parse(stored) : null;
  });
  const [tab, setTab] = useState("courses");
  const { toasts, toast } = useToasts();

  function logout() {
    clearToken();
    localStorage.removeItem("user");
    setUser(null);
    toast("Signed out.", "info");
  }

  if (!user) {
    return (
      <>
        <style>{styles}</style>
        <AuthPage onLogin={(name, id) => {
                    const userData = { name, id, role: getUserRole() };
                    localStorage.setItem("user", JSON.stringify(userData));
                    setUser(userData);
                  }} toast={toast} />
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app-shell">
        <Navbar user={user} tab={tab} setTab={setTab} logout={logout} />
        <main className="main-content">
          {tab === "courses" && <CoursesPage userId={user.id} role={user.role} toast={toast} />}
          {tab === "enrollments" && <EnrollmentsPage userId={user.id} toast={toast} />}
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </>
  );
}