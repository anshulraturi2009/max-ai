import { useEffect, useMemo, useState } from "react";
import {
  subscribeToAllConversations,
  subscribeToAllUsers,
  subscribeToConversationMessages,
} from "../lib/firestore";

const NEW_USER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const ACTIVE_USER_WINDOW_MS = 24 * 60 * 60 * 1000;

export function useAdminConsole() {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let pendingStreams = 2;

    function markLoaded() {
      pendingStreams -= 1;
      if (pendingStreams <= 0) {
        setLoading(false);
      }
    }

    const unsubscribeUsers = subscribeToAllUsers(
      (nextUsers) => {
        setUsers(nextUsers);
        markLoaded();
      },
      () => {
        setError("Users load nahi ho pa rahe. Firestore rules ya database setup check karo.");
        setLoading(false);
      },
    );

    const unsubscribeConversations = subscribeToAllConversations(
      (nextConversations) => {
        setConversations(nextConversations);
        setSelectedConversationId((currentId) => {
          if (
            currentId &&
            nextConversations.some((conversation) => conversation.id === currentId)
          ) {
            return currentId;
          }

          return nextConversations[0]?.id ?? "";
        });
        markLoaded();
      },
      () => {
        setError(
          "Conversation monitor load nahi ho raha. Firestore permissions check karo.",
        );
        setLoading(false);
      },
    );

    return () => {
      unsubscribeUsers();
      unsubscribeConversations();
    };
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedMessages([]);
      return undefined;
    }

    const unsubscribe = subscribeToConversationMessages(
      selectedConversationId,
      setSelectedMessages,
      () => {
        setError(
          "Selected conversation ke messages load nahi ho pa rahe. Firestore access check karo.",
        );
      },
    );

    return unsubscribe;
  }, [selectedConversationId]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ??
    null;

  const userConversationCounts = useMemo(
    () =>
      conversations.reduce((accumulator, conversation) => {
        accumulator[conversation.userId] = (accumulator[conversation.userId] || 0) + 1;
        return accumulator;
      }, {}),
    [conversations],
  );

  const stats = useMemo(() => {
    const timestamp = Date.now();
    const newUsers = users.filter(
      (user) => timestamp - user.createdAt <= NEW_USER_WINDOW_MS,
    ).length;
    const activeUsers = users.filter(
      (user) => timestamp - user.lastSeenAt <= ACTIVE_USER_WINDOW_MS,
    ).length;

    return {
      totalUsers: users.length,
      newUsers,
      returningUsers: Math.max(users.length - newUsers, 0),
      activeUsers,
      totalConversations: conversations.length,
    };
  }, [conversations.length, users]);

  return {
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
  };
}
