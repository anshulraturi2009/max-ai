import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bot,
  Clock3,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import AmbientBackdrop from "../components/common/AmbientBackdrop";
import { ADMIN_EMAIL } from "../constants/app";
import { useAuth } from "../context/AuthContext";
import { personaMap } from "../data/personas";
import { useAdminConsole } from "../hooks/useAdminConsole";

const NEW_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function formatDateTime(timestamp) {
  if (!timestamp) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}

function getUserAgeLabel(timestamp) {
  if (!timestamp) {
    return "Unknown";
  }

  return Date.now() - timestamp <= NEW_USER_WINDOW_MS ? "New" : "Returning";
}

export default function AdminPage() {
  const { user, signOutUser } = useAuth();
  const {
    users,
    conversations,
    selectedConversation,
    selectedConversationId,
    selectedMessages,
    userConversationCounts,
    stats,
    loading,
    error,
    setSelectedConversationId,
  } = useAdminConsole();

  async function handleSignOut() {
    await signOutUser();
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AmbientBackdrop accent="205, 189, 255" />

      <div className="relative z-10 min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-[22px] border border-white/10 bg-gradient-to-br from-violet-300/20 to-cyan-400/20">
                <span className="font-display text-xl font-bold text-white">M</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-slate-500">
                  MAX AI admin
                </p>
                <h1 className="font-display text-3xl font-semibold text-white">
                  User and Chat Monitor
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="status-chip">
                <ShieldCheck className="h-3.5 w-3.5" />
                Restricted to {ADMIN_EMAIL}
              </span>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]"
              >
                Back to app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white transition hover:bg-white/[0.08]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <section className="panel panel-glow relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-400/20 via-cyan-300/10 to-blue-500/20" />
            <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="status-chip mb-5">
                  <Activity className="h-3.5 w-3.5" />
                  Live admin visibility
                </div>
                <h2 className="max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Admin can now track users, fresh signups, and what people are chatting about.
                </h2>
                <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-200/90">
                  This dashboard reads live from Firestore so the admin menu can
                  monitor user activity, see new versus returning users, inspect
                  conversation threads, and understand current usage without touching
                  the normal user interface.
                </p>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Verified admin session
                </p>
                <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-lg font-semibold text-white">
                    {user?.displayName || "MAX AI Admin"}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{user?.email}</p>
                </div>
                <div className="mt-4 rounded-[22px] border border-cyan-300/10 bg-cyan-300/5 p-4 text-sm leading-7 text-cyan-100/90">
                  Admin-only monitoring option sidebar me sirf admin account ko hi
                  dikh raha hai, normal users ko nahi.
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total users", stats.totalUsers, Users],
              ["New users", stats.newUsers, UserPlus],
              ["Returning users", stats.returningUsers, Activity],
              ["Active users", stats.activeUsers, Clock3],
              ["Conversations", stats.totalConversations, MessageSquareText],
            ].map(([label, value, Icon]) => (
              <div key={label} className="panel p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">{label}</p>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-6 font-display text-4xl font-semibold text-white">
                  {value}
                </p>
              </div>
            ))}
          </section>

          {error ? (
            <div className="rounded-[24px] border border-amber-300/15 bg-amber-300/10 px-5 py-4 text-sm leading-7 text-amber-100">
              {error}
            </div>
          ) : null}

          <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <div className="panel flex min-h-[720px] flex-col p-5">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  User directory
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                  New and returning users
                </h3>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {loading ? (
                  <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
                    Loading users...
                  </div>
                ) : users.length ? (
                  users.map((entry) => {
                    const statusLabel = getUserAgeLabel(entry.createdAt);

                    return (
                      <div
                        key={entry.id}
                        className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {entry.displayName || "MAX AI User"}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {entry.email}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
                              statusLabel === "New"
                                ? "border border-emerald-300/15 bg-emerald-300/10 text-emerald-100"
                                : "border border-white/10 bg-white/[0.06] text-slate-300"
                            }`}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 text-xs text-slate-400 sm:grid-cols-2">
                          <div>
                            <p className="uppercase tracking-[0.18em] text-slate-500">
                              First seen
                            </p>
                            <p className="mt-1 text-slate-300">
                              {formatDateTime(entry.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="uppercase tracking-[0.18em] text-slate-500">
                              Last seen
                            </p>
                            <p className="mt-1 text-slate-300">
                              {formatDateTime(entry.lastSeenAt)}
                            </p>
                          </div>
                        </div>

                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
                          Chats created
                        </p>
                        <p className="mt-1 text-sm text-white">
                          {userConversationCounts[entry.uid] || 0}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                    Abhi tak koi users Firestore me sync nahi hue.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-rows-[320px_minmax(0,1fr)]">
              <div className="panel flex min-h-[320px] flex-col p-5">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Conversation feed
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                    What users are talking about
                  </h3>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {conversations.length ? (
                    conversations.map((conversation) => {
                      const persona = personaMap[conversation.personaId] ?? personaMap.other;
                      const selected = conversation.id === selectedConversationId;

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          onClick={() => setSelectedConversationId(conversation.id)}
                          className={`w-full rounded-[22px] border p-4 text-left transition ${
                            selected
                              ? "border-cyan-300/20 bg-cyan-300/10"
                              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">
                                {conversation.userName || "MAX AI User"}
                              </p>
                              <p className="truncate text-xs text-slate-400">
                                {conversation.userEmail}
                              </p>
                            </div>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {formatDateTime(conversation.updatedAt)}
                            </span>
                          </div>

                          <p className="mt-3 truncate text-sm text-slate-200">
                            {conversation.title}
                          </p>
                          <p className="mt-2 text-xs text-slate-400">
                            {persona.name} | {conversation.messageCount || 0} messages
                          </p>
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">
                            {conversation.lastMessagePreview || "No messages yet."}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                      Abhi tak koi conversation sync nahi hui.
                    </div>
                  )}
                </div>
              </div>

              <div className="panel flex min-h-[380px] flex-col p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Selected transcript
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-white">
                      Admin chat inspector
                    </h3>
                  </div>
                  {selectedConversation ? (
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
                      {selectedConversation.userName} |{" "}
                      {personaMap[selectedConversation.personaId]?.name || "Other"}
                    </div>
                  ) : null}
                </div>

                {selectedConversation ? (
                  <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        User
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {selectedConversation.userName}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {selectedConversation.userEmail}
                      </p>

                      <div className="mt-5 space-y-4 text-sm text-slate-300">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Started
                          </p>
                          <p className="mt-1">
                            {formatDateTime(selectedConversation.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Last activity
                          </p>
                          <p className="mt-1">
                            {formatDateTime(selectedConversation.updatedAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            Messages
                          </p>
                          <p className="mt-1">
                            {selectedConversation.messageCount || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="min-h-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
                      <div className="h-full overflow-y-auto p-4">
                        <div className="space-y-4">
                          {selectedMessages.length ? (
                            selectedMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`rounded-[22px] border px-4 py-4 ${
                                  message.role === "user"
                                    ? "border-cyan-300/15 bg-cyan-300/10"
                                    : "border-white/10 bg-white/[0.05]"
                                }`}
                              >
                                <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.22em] text-slate-400">
                                  <span>
                                    {message.role === "user"
                                      ? selectedConversation.userName
                                      : "MAX AI"}
                                  </span>
                                  <span>{formatDateTime(message.timestamp)}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">
                                  {message.content}
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                              Is conversation me abhi messages nahi hain.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
                    Koi conversation select karo, fir admin yahin se full chat dekh
                    payega.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
