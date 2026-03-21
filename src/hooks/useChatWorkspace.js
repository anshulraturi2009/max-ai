import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  appendConversationMessage,
  clearConversation,
  createConversation,
  subscribeToConversationMessages,
  subscribeToUserConversations,
  updateConversationPersona,
  upsertUserProfile,
} from "../lib/firestore";
import {
  fetchChatEngineStatus,
  generateAssistantReply,
  getDefaultChatEngine,
} from "../lib/chat-api";

export function useChatWorkspace() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [activeMessages, setActiveMessages] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [draft, setDraft] = useState("");
  const [thinkingState, setThinkingState] = useState(null);
  const [syncError, setSyncError] = useState("");
  const [engine, setEngine] = useState(getDefaultChatEngine);
  const timeoutRef = useRef(null);
  const requestControllerRef = useRef(null);
  const selectedChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const activeChat = selectedChat
    ? {
        ...selectedChat,
        messages: activeMessages,
      }
    : chats[0]
      ? {
          ...chats[0],
          messages: chats[0].id === activeChatId ? activeMessages : [],
        }
      : null;

  useEffect(() => {
    const controller = new AbortController();

    fetchChatEngineStatus(controller.signal)
      .then((nextEngine) => {
        setEngine(nextEngine);
      })
      .catch(() => {});

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setActiveChatId("");
      setActiveMessages([]);
      setSyncError("");
      return undefined;
    }

    setSyncError("");

    const unsubscribe = subscribeToUserConversations(
      user.uid,
      (nextChats) => {
        setChats(nextChats);
        setActiveChatId((currentId) => {
          if (currentId && nextChats.some((chat) => chat.id === currentId)) {
            return currentId;
          }

          return nextChats[0]?.id ?? "";
        });
      },
      () => {
        setSyncError(
          "Cloud sync connect nahi ho pa raha. Firestore setup ya rules check karo.",
        );
      },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!activeChatId) {
      setActiveMessages([]);
      return undefined;
    }

    const unsubscribe = subscribeToConversationMessages(
      activeChatId,
      (messages) => {
        setActiveMessages(messages);
      },
      () => {
        setSyncError(
          "Messages sync nahi ho pa rahi. Firestore access ya rules check karo.",
        );
      },
    );

    return unsubscribe;
  }, [activeChatId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    };
  }, []);

  function setActiveChat(nextChatId) {
    setActiveChatId(nextChatId);
  }

  function cancelThinking() {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (requestControllerRef.current) {
      requestControllerRef.current.abort();
      requestControllerRef.current = null;
    }

    setThinkingState(null);
  }

  async function createNewChat(personaId = activeChat?.personaId ?? "other") {
    if (!user) {
      return;
    }

    cancelThinking();
    setDraft("");
    setSearchValue("");
    setSyncError("");

    try {
      await upsertUserProfile(user);
      const conversationId = await createConversation({ user, personaId });
      if (conversationId) {
        setActiveChatId(conversationId);
      }
    } catch {
      setSyncError("New chat create nahi hua. Firestore permissions check karo.");
    }
  }

  async function selectPersona(personaId) {
    if (!activeChatId) {
      await createNewChat(personaId);
      return;
    }

    try {
      await updateConversationPersona(activeChatId, personaId);
    } catch {
      setSyncError("Persona switch save nahi hua. Dubara try karo.");
    }
  }

  async function clearCurrentChat() {
    if (!activeChatId) {
      return;
    }

    cancelThinking();

    try {
      await clearConversation(activeChatId);
    } catch {
      setSyncError("Current chat clear nahi hua. Firestore rules check karo.");
    }
  }

  function setDraftFromSuggestion(value) {
    setDraft(value);
  }

  async function submitMessage(rawMessage, personaOverride) {
    const content = rawMessage.trim();
    if (!content || !user) {
      return;
    }

    cancelThinking();
    setSyncError("");

    let targetChat = activeChat;
    let targetChatId = activeChatId;
    let controller = null;

    try {
      await upsertUserProfile(user);

      if (!targetChatId) {
        targetChatId = await createConversation({
          user,
          personaId: personaOverride ?? "other",
        });
        if (!targetChatId) {
          throw new Error("Conversation could not be created.");
        }
        setActiveChatId(targetChatId);
      }

      const personaId = personaOverride ?? targetChat?.personaId ?? "other";
      const currentMessageCount = targetChat?.messageCount ?? 0;
      const nextConversationTitle =
        currentMessageCount === 0
          ? content.trim().replace(/\s+/g, " ").slice(0, 38) || "Fresh thread"
          : targetChat?.title ?? "Fresh thread";
      const baseHistory = targetChatId === activeChatId ? activeMessages : [];
      const historyForApi = [...baseHistory];

      await appendConversationMessage({
        conversationId: targetChatId,
        conversationTitle: nextConversationTitle,
        messageCount: currentMessageCount,
        role: "user",
        content,
        personaId,
        user,
      });

      setDraft("");
      setThinkingState({
        chatId: targetChatId,
        personaId,
        startedAt: Date.now(),
      });

      controller = new AbortController();
      requestControllerRef.current = controller;

      const assistantResponse = await generateAssistantReply({
        message: content,
        personaId,
        history: historyForApi,
        signal: controller.signal,
      });

      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }

      setEngine(assistantResponse.engine);

      const persistAssistantReply = async () => {
        await appendConversationMessage({
          conversationId: targetChatId,
          conversationTitle: nextConversationTitle,
          messageCount: currentMessageCount + 1,
          role: "assistant",
          content: assistantResponse.reply,
          personaId,
          user,
        });
      };

      if (assistantResponse.delayMs > 0) {
        timeoutRef.current = window.setTimeout(async () => {
          try {
            await persistAssistantReply();
          } catch {
            setSyncError("AI reply save nahi hui. Firestore sync check karo.");
          } finally {
            timeoutRef.current = null;
            setThinkingState(null);
          }
        }, assistantResponse.delayMs);
        return;
      }

      await persistAssistantReply();
      setThinkingState(null);
    } catch (error) {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }

      if (error?.name === "AbortError") {
        setThinkingState(null);
        return;
      }

      const errorMessage =
        typeof error?.message === "string" && error.message
          ? error.message
          : "Message send nahi hua. Firestore setup ya AI backend check karo.";

      setSyncError(errorMessage);
      setThinkingState(null);
    }
  }

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return {
    chats,
    filteredChats,
    activeChat,
    activeChatId,
    searchValue,
    setSearchValue,
    draft,
    setDraft,
    thinkingState,
    syncError,
    engine,
    createNewChat,
    setActiveChat,
    selectPersona,
    clearCurrentChat,
    setDraftFromSuggestion,
    submitMessage,
  };
}
