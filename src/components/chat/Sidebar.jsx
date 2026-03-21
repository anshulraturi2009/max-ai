import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LogOut,
  Plus,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { personas, personaMap } from "../../data/personas";
import { cx } from "../../lib/cx";

function formatChatTime(timestamp) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

function UserAvatar({ user, className }) {
  const initials = (user?.displayName || "MAX AI User")
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (user?.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || "User"}
        className={className}
      />
    );
  }

  return (
    <div
      className={cx(
        "grid place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-semibold uppercase tracking-[0.18em] text-white",
        className,
      )}
    >
      {initials}
    </div>
  );
}

function SidebarPanel({
  collapsed,
  setCollapsed,
  mobile,
  closeMobile,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  searchValue,
  setSearchValue,
  activePersonaId,
  onSelectPersona,
  user,
  isAdmin,
  onSignOut,
}) {
  return (
    <div
      className={cx(
        "flex h-full min-h-0 flex-col border-r border-white/10 bg-slate-950/85 backdrop-blur-2xl",
        collapsed ? "w-[98px]" : "w-[320px]",
      )}
    >
      <div className="flex items-center justify-between px-4 pb-4 pt-5">
        <div className={cx("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300/20 to-blue-500/20">
            <span className="font-display text-lg font-bold text-white">M</span>
          </div>
          {!collapsed ? (
            <div>
              <p className="font-display text-lg font-semibold text-white">
                MAX AI
              </p>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                AI workspace
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {!mobile ? (
            <button
              type="button"
              onClick={() => setCollapsed((current) => !current)}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08]"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={closeMobile}
              className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={() => {
            onNewChat(activePersonaId);
            closeMobile?.();
          }}
          className={cx(
            "flex w-full items-center justify-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.09]",
            collapsed && "px-0",
          )}
        >
          <Plus className="h-4 w-4" />
          {!collapsed ? "New chat" : null}
        </button>
      </div>

      {!collapsed ? (
        <div className="px-4 pt-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search chats"
              className="w-full rounded-[20px] border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-white/20"
            />
          </label>
        </div>
      ) : null}

      <div className="mt-5 flex-1 overflow-hidden px-3">
        <div className="h-full overflow-y-auto overscroll-y-contain pb-5">
          {!collapsed ? (
            <div className="mb-5">
              <p className="px-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                Persona quick switch
              </p>
              <div className="mt-3 space-y-2">
                {personas.map((persona) => {
                  const active = persona.id === activePersonaId;

                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => onSelectPersona(persona.id)}
                      className={cx(
                        "w-full rounded-[20px] border px-3 py-3 text-left transition",
                        active
                          ? "border-white/20 bg-white/[0.08]"
                          : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: persona.accent }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {persona.name}
                          </p>
                          <p className="text-xs text-slate-400">{persona.short}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-5 space-y-3 px-1">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => onSelectPersona(persona.id)}
                  className={cx(
                    "grid h-12 w-12 place-items-center rounded-2xl border transition",
                    persona.id === activePersonaId
                      ? "border-white/20 bg-white/[0.08]"
                      : "border-white/10 bg-white/[0.04]",
                  )}
                  title={persona.name}
                >
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: persona.accent }}
                  />
                </button>
              ))}
            </div>
          )}

          <div>
            {!collapsed ? (
              <p className="px-2 text-xs uppercase tracking-[0.24em] text-slate-500">
                Recent chats
              </p>
            ) : null}

            <div className="mt-3 space-y-2">
              {chats.length ? (
                chats.map((chat) => {
                  const chatPersona = personaMap[chat.personaId] ?? personaMap.other;
                  const active = chat.id === activeChatId;

                  return (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => {
                        onSelectChat(chat.id);
                        closeMobile?.();
                      }}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-left transition",
                        active
                          ? "border-white/20 bg-white/[0.08]"
                          : "border-white/5 bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      <div
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                        style={{
                          background: `linear-gradient(135deg, ${chatPersona.accent}44, rgba(255,255,255,0.04))`,
                        }}
                      >
                        {collapsed ? chat.title.slice(0, 1) : chatPersona.name.slice(0, 2)}
                      </div>
                      {!collapsed ? (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-medium text-white">
                              {chat.title}
                            </p>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {formatChatTime(chat.updatedAt)}
                            </span>
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {chatPersona.name} | {chat.messageCount || 0} messages
                          </p>
                        </div>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[20px] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-slate-400">
                  No chats match this search.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        {!collapsed ? (
          <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} className="h-12 w-12 object-cover" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.displayName || "MAX AI User"}
                </p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 px-3 py-3 text-sm text-cyan-100 transition hover:bg-cyan-300/15"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm text-slate-200 transition hover:bg-white/[0.08]"
              >
                <Settings2 className="h-4 w-4" />
                Settings
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-3 text-sm text-slate-200 transition hover:bg-white/[0.08]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <UserAvatar user={user} className="h-12 w-12 object-cover" />
            {isAdmin ? (
              <Link
                to="/admin"
                className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100"
                title="Admin"
              >
                <ShieldCheck className="h-4 w-4" />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onSignOut}
              className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar(props) {
  const { mobileOpen, setMobileOpen } = props;

  return (
    <>
      <div className="hidden lg:block">
        <SidebarPanel {...props} mobile={false} closeMobile={undefined} />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <SidebarPanel
                {...props}
                mobile
                closeMobile={() => setMobileOpen(false)}
                collapsed={false}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
