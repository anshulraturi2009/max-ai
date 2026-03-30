import { Link } from "react-router-dom";
import { LogOut, Plus, Search, ShieldCheck, X } from "lucide-react";

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
    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-sm font-semibold text-white">
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
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-slate-950">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        <div>
          <p className="text-lg font-semibold text-white">MAX AI</p>
          <p className="text-xs text-slate-500">Simple workspace</p>
        </div>

        {closeMobile ? (
          <button
            type="button"
            onClick={closeMobile}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="space-y-3 border-b border-slate-800 px-4 py-4">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            closeMobile?.();
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
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
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-slate-700"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
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
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-slate-700 bg-slate-900"
                      : "border-transparent bg-transparent hover:border-slate-800 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-white">{chat.title}</p>
                    <span className="text-[11px] text-slate-500">
                      {formatChatTime(chat.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {chat.messageCount || 0} messages
                  </p>
                </button>
              );
            })
          ) : (
            <div className="rounded-xl border border-dashed border-slate-800 px-4 py-5 text-sm text-slate-500">
              No chats found.
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {user?.displayName || "MAX AI User"}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {isAdmin ? (
              <Link
                to="/admin"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800 px-3 py-2.5 text-sm text-slate-100"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-800 px-3 py-2.5 text-sm text-slate-100"
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

  return (
    <>
      <aside className="hidden h-full w-[280px] shrink-0 border-r border-slate-800 lg:flex">
        <SidebarPanel {...props} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <aside className="relative h-full w-[280px] border-r border-slate-800 bg-slate-950">
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
