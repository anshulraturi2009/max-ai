import { Link } from "react-router-dom";
import { Laptop, LogOut, Moon, Plus, Search, ShieldCheck, Sun, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

function formatChatTime(timestamp) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function UserAvatar({ user }) {
  const initials = (user?.displayName || "MAX AI User")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-white shadow-[0_12px_28px_rgba(8,15,35,0.32)]">
      {initials || "M"}
    </div>
  );
}

function SidebarPanel({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  searchValue,
  setSearchValue,
  user,
  isAdmin,
  onSignOut,
  closeMobile,
}) {
  const { themeMode, setThemeMode, resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <div
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden backdrop-blur-2xl ${
        isLight ? "bg-white/70" : "bg-slate-950/60"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_26%)]"
            : "bg-[radial-gradient(circle_at_top,rgba(255,107,53,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(34,211,238,0.12),transparent_26%)]"
        }`}
      />
      <div
        className={`relative flex items-center justify-between px-4 py-4 ${
          isLight ? "border-b border-slate-200/80" : "border-b border-white/10"
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src="/max-ai-icon-192-v3.png"
            alt="MAX AI"
            className={`h-11 w-11 rounded-2xl shadow-[0_16px_36px_rgba(8,15,35,0.22)] ${
              isLight ? "border border-slate-200 bg-white" : "border border-white/10"
            }`}
          />
          <div>
            <p className="bg-gradient-to-r from-orange-300 via-white to-cyan-300 bg-clip-text text-lg font-semibold text-transparent">
              MAX AI
            </p>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              AI agent workspace
            </p>
          </div>
        </div>

        {closeMobile ? (
          <button
            type="button"
            onClick={closeMobile}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl transition lg:hidden ${
              isLight
                ? "border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div
        className={`relative space-y-3 px-4 py-4 ${
          isLight ? "border-b border-slate-200/80" : "border-b border-white/10"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onNewChat();
            closeMobile?.();
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(249,115,22,0.28)] transition hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search chats"
            className={`w-full rounded-2xl py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-400/30 ${
              isLight
                ? "border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                : "border border-white/10 bg-white/[0.05] text-slate-100 placeholder:text-slate-500"
            }`}
          />
        </label>

        <div
          className={`rounded-[22px] p-3 ${
            isLight ? "border border-slate-200 bg-slate-50/80" : "border border-white/10 bg-white/[0.04]"
          }`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-slate-400"}`}>
            App Theme
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { key: "light", label: "Light", icon: Sun },
              { key: "dark", label: "Dark", icon: Moon },
              { key: "system", label: "System", icon: Laptop },
            ].map((option) => {
              const Icon = option.icon;
              const active = themeMode === option.key;

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setThemeMode(option.key)}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-medium transition ${
                    active
                      ? "bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]"
                      : isLight
                        ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                        : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-2">
          {chats.length ? (
            chats.map((chat) => {
              const active = chat.id === activeChatId;

              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => {
                    onSelectChat(chat.id);
                    closeMobile?.();
                  }}
                  className={`w-full rounded-[22px] border px-3 py-3 text-left transition ${
                    active
                      ? isLight
                        ? "border-orange-300/50 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                        : "border-orange-400/25 bg-white/[0.08] shadow-[0_16px_36px_rgba(8,15,35,0.22)]"
                      : isLight
                        ? "border-transparent bg-transparent hover:border-slate-200 hover:bg-white/70"
                        : "border-transparent bg-transparent hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={`truncate text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                      {chat.title}
                    </p>
                    <span className={`text-[11px] ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                      {formatChatTime(chat.updatedAt)}
                    </span>
                  </div>
                  <p className={`mt-1 truncate text-xs ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                    {chat.messageCount || 0} messages
                  </p>
                </button>
              );
            })
          ) : (
            <div
              className={`rounded-[22px] border border-dashed px-4 py-5 text-sm ${
                isLight ? "border-slate-200 text-slate-500" : "border-white/10 text-slate-500"
              }`}
            >
              No chats found.
            </div>
          )}
        </div>
      </div>

      <div
        className={`relative px-4 py-4 ${isLight ? "border-t border-slate-200/80" : "border-t border-white/10"}`}
      >
        <div
          className={`rounded-[26px] p-4 shadow-[0_18px_42px_rgba(8,15,35,0.14)] ${
            isLight ? "border border-slate-200 bg-white/90" : "border border-white/10 bg-white/[0.05]"
          }`}
        >
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="min-w-0">
              <p className={`truncate text-sm font-medium ${isLight ? "text-slate-900" : "text-white"}`}>
                {user?.displayName || "MAX AI User"}
              </p>
              <p className={`truncate text-xs ${isLight ? "text-slate-500" : "text-slate-500"}`}>
                {user?.email}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {isAdmin ? (
              <Link
                to="/admin"
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition ${
                  isLight
                    ? "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    : "border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
                }`}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onSignOut}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-sm transition ${
                isLight
                  ? "border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                  : "border border-white/10 bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]"
              }`}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar(props) {
  const { mobileOpen, setMobileOpen } = props;
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <>
      <aside
        className={`hidden h-full w-[300px] shrink-0 lg:flex ${
          isLight
            ? "border-r border-slate-200/80 bg-white/45"
            : "border-r border-white/10 bg-slate-950/35"
        }`}
      >
        <SidebarPanel {...props} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside
            className={`relative h-full w-[300px] backdrop-blur-2xl ${
              isLight
                ? "border-r border-slate-200 bg-white/90"
                : "border-r border-white/10 bg-slate-950/85"
            }`}
          >
            <SidebarPanel
              {...props}
              closeMobile={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
