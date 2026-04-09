import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useTheme } from "./context/ThemeContext";

const ChatPage = lazy(() => import("./pages/ChatPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

function GuardScreen({ label }) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-6 ${
        isLight ? "bg-[#eef4ff] text-slate-900" : "bg-[#050816] text-slate-100"
      }`}
    >
      <div
        className={`absolute inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.12),transparent_34%),radial-gradient(circle_at_bottom,rgba(251,146,60,0.12),transparent_30%)]"
            : "bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(251,146,60,0.18),transparent_30%)]"
        }`}
      />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div
        className={`relative flex w-full max-w-md flex-col items-center rounded-[2rem] px-8 py-10 text-center backdrop-blur-2xl ${
          isLight
            ? "border border-slate-200 bg-white/80 shadow-[0_22px_54px_rgba(15,23,42,0.1)]"
            : "border border-white/10 bg-slate-950/70 shadow-[0_30px_80px_rgba(2,6,23,0.82)]"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-[-24px] rounded-[2.5rem] bg-[radial-gradient(circle,rgba(251,146,60,0.26),transparent_58%)] blur-2xl" />
          <img
            src="/max-ai-icon-512-v3.png"
            alt="MAX AI"
            className="relative h-40 w-40 rounded-[2rem] border border-white/10 shadow-[0_24px_70px_rgba(15,23,42,0.7)]"
          />
        </div>
        <div
          className={`mt-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] ${
            isLight
              ? "border border-slate-200 bg-slate-50 text-slate-500"
              : "border border-white/10 bg-white/5 text-slate-300"
          }`}
        >
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-orange-400 shadow-[0_0_18px_rgba(251,146,60,0.85)]" />
          Premium AI Workspace
        </div>
        <h1 className={`mt-5 text-4xl font-semibold tracking-[0.26em] ${isLight ? "text-slate-900" : "text-white"}`}>MAX AI</h1>
        <p className={`mt-3 max-w-xs text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300"}`}>{label}</p>
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
