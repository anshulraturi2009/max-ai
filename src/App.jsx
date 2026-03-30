import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const ChatPage = lazy(() => import("./pages/ChatPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function GuardScreen({ label }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="panel flex items-center gap-3 px-5 py-4 text-sm">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
        {label}
      </div>
    </div>
  );
}

function RootRoute() {
  const { user, loading, authConfigured } = useAuth();

  if (loading) {
    return <GuardScreen label="Loading MAX AI..." />;
  }

  if (!authConfigured || !user) {
    return <Navigate to="/auth" replace />;
  }

  return <Navigate to="/app" replace />;
}

function ProtectedRoute({ children }) {
  const { user, loading, authConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GuardScreen label="Securing your workspace..." />;
  }

  if (!authConfigured || !user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading, authConfigured, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <GuardScreen label="Verifying admin clearance..." />;
  }

  if (!authConfigured || !user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Suspense fallback={<GuardScreen label="Loading MAX AI..." />}>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<RootRoute />} />
      </Routes>
    </Suspense>
  );
}
