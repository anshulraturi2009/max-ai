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
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let usersLoaded = false;
    let conversationsLoaded = false;

    function markLoaded() {
      if (usersLoaded && conversationsLoaded) {
        setLoading(false);
      }
    }

    const unsubscribeUsers = subscribeToAllUsers(
      (nextUsers) => {
        usersLoaded = true;
        setUsers(nextUsers);
        setSelectedUserId((currentId) => {
          if (currentId && nextUsers.some((entry) => entry.id === currentId)) {
            return currentId;
          }

          return nextUsers[0]?.id ?? "";
        });
        markLoaded();
      },
      () => {
        setError("Users load nahi ho pa rahe. Firestore rules ya database setup check karo.");
        setLoading(false);
      },
    );

    const unsubscribeConversations = subscribeToAllConversations(
      (nextConversations) => {
        conversationsLoaded = true;
        setConversations(nextConversations);
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

  const selectedUser =
    users.find((entry) => entry.id === selectedUserId || entry.uid === selectedUserId) ??
    null;

  const userConversations = useMemo(() => {
    if (!selectedUserId) {
      return [];
    }

    return conversations
      .filter((conversation) => conversation.userId === selectedUserId)
      .sort((left, right) => right.updatedAt - left.updatedAt);
  }, [conversations, selectedUserId]);

  useEffect(() => {
    setSelectedConversationId((currentId) => {
      if (
        currentId &&
        userConversations.some((conversation) => conversation.id === currentId)
      ) {
        return currentId;
      }

      return userConversations[0]?.id ?? "";
    });
  }, [userConversations]);

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
    userConversations.find((conversation) => conversation.id === selectedConversationId) ??
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
      (entry) => timestamp - entry.createdAt <= NEW_USER_WINDOW_MS,
    ).length;
    const activeUsers = users.filter(
      (entry) => timestamp - entry.lastSeenAt <= ACTIVE_USER_WINDOW_MS,
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
  };
}
