import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Clock3,
  LogOut,
  MessageSquareText,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { ADMIN_EMAIL } from "../constants/app";
import { useAuth } from "../context/AuthContext";
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
  const { signOutUser } = useAuth();
  const {
    users,
    selectedUser,
    selectedUserId,
    userConversations,
    selectedConversation,
    selectedConversationId,
    selectedMessages,
    userConversationCounts,
    stats,
    loading,
    error,
    setSelectedUserId,
    setSelectedConversationId,
  } = useAdminConsole();

  const statCards = [
    ["Total users", stats.totalUsers, Users],
    ["New users", stats.newUsers, UserPlus],
    ["Returning users", stats.returningUsers, Activity],
    ["Active users", stats.activeUsers, Clock3],
    ["Conversations", stats.totalConversations, MessageSquareText],
  ];

  async function handleSignOut() {
    await signOutUser();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-3 py-3 text-slate-100 sm:px-4 sm:py-4 lg:px-6">
      <div className="mx-auto flex h-[calc(100dvh-1.5rem)] max-w-[1600px] flex-col gap-4 overflow-hidden sm:h-[calc(100dvh-2rem)]">
        <header className="panel shrink-0 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl border border-slate-800 bg-slate-900">
                <span className="text-lg font-bold text-white">M</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  MAX AI admin
                </p>
                <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                  Admin panel
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Users, conversations aur messages ek jagah.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="status-chip">
                <ShieldCheck className="h-3.5 w-3.5" />
                {ADMIN_EMAIL}
              </span>
              <Link
                to="/app"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white transition hover:border-slate-700"
              >
                Back to app
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-white transition hover:border-slate-700"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <section className="grid shrink-0 gap-3 md:grid-cols-2 xl:grid-cols-5">
          {statCards.map(([label, value, Icon]) => (
            <div key={label} className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{label}</p>
                <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        {error ? (
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {error}
          </div>
        ) : null}

        <section className="min-h-0 flex-1 overflow-hidden">
          <div className="grid h-full gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="panel flex min-h-[320px] flex-col overflow-hidden p-4">
              <div className="mb-4 shrink-0">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Users
                </p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  Select a user
                </h2>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
                {loading ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
                    Loading users...
                  </div>
                ) : users.length ? (
                  users.map((entry) => {
                    const isSelected =
                      entry.id === selectedUserId || entry.uid === selectedUserId;
                    const statusLabel = getUserAgeLabel(entry.createdAt);

                    return (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedUserId(entry.id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-slate-700 bg-slate-900"
                            : "border-slate-800 bg-slate-950 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {entry.displayName || "MAX AI User"}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {entry.email}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {entry.phoneNumber || "Phone not available"}
                            </p>
                          </div>
                          <span className="rounded-full border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                            {statusLabel}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-1.5 text-xs text-slate-400">
                          <p>First seen: {formatDateTime(entry.createdAt)}</p>
                          <p>Last seen: {formatDateTime(entry.lastSeenAt)}</p>
                          <p>DOB: {entry.dob || "Not available"}</p>
                          <p>Threads: {userConversationCounts[entry.uid] || 0}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-800 p-5 text-sm text-slate-500">
                    No users available yet.
                  </div>
                )}
              </div>
            </div>

            <div className="grid min-h-0 gap-4 xl:grid-rows-[320px_minmax(0,1fr)]">
              <div className="panel flex min-h-[300px] flex-col overflow-hidden p-4">
                <div className="mb-4 shrink-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Conversations
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {selectedUser ? selectedUser.displayName || "Selected user" : "Select a user"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    {selectedUser
                      ? "Is user ke saare threads."
                      : "Left side se koi user select karo."}
                  </p>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto">
                  {selectedUser ? (
                    userConversations.length ? (
                      userConversations.map((conversation) => {
                        const isSelected =
                          conversation.id === selectedConversationId;

                        return (
                          <button
                            key={conversation.id}
                            type="button"
                            onClick={() => setSelectedConversationId(conversation.id)}
                            className={`w-full rounded-xl border p-4 text-left transition ${
                              isSelected
                                ? "border-slate-700 bg-slate-900"
                                : "border-slate-800 bg-slate-950 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="min-w-0 truncate text-sm font-semibold text-white">
                                {conversation.title}
                              </p>
                              <span className="text-[11px] text-slate-500">
                                {formatDateTime(conversation.updatedAt)}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">
                              {conversation.messageCount || 0} messages
                            </p>
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
                              {conversation.lastMessagePreview || "No messages yet."}
                            </p>
                          </button>
                        );
                      })
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-800 p-5 text-sm text-slate-500">
                        Is user ke abhi threads nahi hain.
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-800 p-5 text-sm text-slate-500">
                      User select karne ke baad yahan threads dikhenge.
                    </div>
                  )}
                </div>
              </div>

              <div className="panel flex min-h-[360px] flex-col overflow-hidden p-4">
                <div className="mb-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Transcript
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-white">
                      {selectedConversation
                        ? selectedConversation.title
                        : "Conversation preview"}
                    </h2>
                  </div>
                  {selectedConversation ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-300">
                      {selectedConversation.messageCount || 0} messages
                    </div>
                  ) : null}
                </div>

                {selectedConversation ? (
                  <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <div className="space-y-4">
                      {selectedMessages.length ? (
                        selectedMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`rounded-xl border px-4 py-4 ${
                              message.role === "user"
                                ? "border-slate-700 bg-slate-900"
                                : "border-slate-800 bg-slate-950"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-slate-500">
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
                        <div className="rounded-xl border border-dashed border-slate-800 p-5 text-sm text-slate-500">
                          Is conversation me abhi messages nahi hain.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-800 p-5 text-sm text-slate-500">
                    User aur thread select karo, fir yahan full transcript dikhega.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
