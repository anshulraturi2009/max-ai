import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  appendConversationMessage,
  clearConversation,
  createConversation,
  subscribeToConversationMessages,
  subscribeToUserConversations,
  updateConversationPersona,
  updateConversationWorkspaceContext,
  upsertUserProfile,
} from "../lib/firestore";
import {
  extractVideoPrompt,
  fetchChatEngineStatus,
  generateAssistantReply,
  getDefaultChatEngine,
  getUnavailableChatEngine,
  getVideoChatEngine,
  isLiveChatConfigured,
  isVideoGenerationPrompt,
  pollVideoGeneration,
  predictSearchIntent,
  startVideoGeneration,
} from "../lib/chat-api";

const DEFAULT_PERSONA_ID = "other";
const TYPING_CLEAR_DELAY_MS = 120;
const MIN_ASSISTANT_REVEAL_MS = 900;
const MAX_ASSISTANT_REVEAL_MS = 3200;
const ASSISTANT_REVEAL_CHAR_MS = 18;

function createClientTag(prefix = "message") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getAssistantRevealDuration(reply = "") {
  const normalizedLength = String(reply ?? "").trim().length;
  if (!normalizedLength) {
    return 0;
  }

  return Math.min(
    MAX_ASSISTANT_REVEAL_MS,
    Math.max(MIN_ASSISTANT_REVEAL_MS, normalizedLength * ASSISTANT_REVEAL_CHAR_MS),
  );
}

export function useChatWorkspace() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [activeMessages, setActiveMessages] = useState([]);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [draft, setDraft] = useState("");
  const [workspacePersonaId, setWorkspacePersonaId] = useState(DEFAULT_PERSONA_ID);
  const [workspaceContext, setWorkspaceContext] = useState("");
  const [thinkingState, setThinkingState] = useState(null);
  const [syncError, setSyncError] = useState("");
  const [engine, setEngine] = useState(getDefaultChatEngine);
  const timeoutRef = useRef(null);
  const requestControllerRef = useRef(null);
  const enginePollTimeoutRef = useRef(null);
  const selectedChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  const activeChat = selectedChat
    ? {
        ...selectedChat,
        messages: [
          ...activeMessages,
          ...optimisticMessages
            .filter((message) => message.chatId === selectedChat.id)
            .sort((left, right) => left.timestamp - right.timestamp),
        ],
      }
    : chats[0]
      ? {
          ...chats[0],
          messages:
            chats[0].id === activeChatId
              ? [
                  ...activeMessages,
                  ...optimisticMessages
                    .filter((message) => message.chatId === activeChatId)
                    .sort((left, right) => left.timestamp - right.timestamp),
                ]
              : [],
        }
      : null;

  useEffect(() => {
    if (!activeChat) {
      return;
    }

    setWorkspacePersonaId(activeChat.personaId || DEFAULT_PERSONA_ID);
    setWorkspaceContext(activeChat.workspaceContext || "");
  }, [activeChat]);

  useEffect(() => {
    let cancelled = false;
    let controller = null;

    const syncEngineStatus = async () => {
      if (cancelled) {
        return;
      }

      controller = new AbortController();

      try {
        const nextEngine = await fetchChatEngineStatus(controller.signal);
        if (cancelled) {
          return;
        }

        setEngine(nextEngine);

        if (nextEngine.status === "waking") {
          enginePollTimeoutRef.current = window.setTimeout(() => {
            syncEngineStatus();
          }, 10000);
        }
      } catch {
        if (!cancelled) {
          setEngine(getUnavailableChatEngine());
        }
      }
    };

    syncEngineStatus();

    return () => {
      cancelled = true;

      if (controller) {
        controller.abort();
      }

      if (enginePollTimeoutRef.current) {
        window.clearTimeout(enginePollTimeoutRef.current);
        enginePollTimeoutRef.current = null;
      }
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
        const persistedClientTags = new Set(
          messages
            .map((message) => message.clientTag)
            .filter((clientTag) => typeof clientTag === "string" && clientTag),
        );

        if (persistedClientTags.size) {
          setOptimisticMessages((currentMessages) =>
            currentMessages.filter(
              (message) =>
                message.chatId !== activeChatId ||
                !persistedClientTags.has(message.clientTag),
            ),
          );
        }
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

      if (enginePollTimeoutRef.current) {
        window.clearTimeout(enginePollTimeoutRef.current);
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

  function addOptimisticMessage(message) {
    setOptimisticMessages((currentMessages) => [...currentMessages, message]);
  }

  function removeOptimisticMessage(clientTag) {
    if (!clientTag) {
      return;
    }

    setOptimisticMessages((currentMessages) =>
      currentMessages.filter((message) => message.clientTag !== clientTag),
    );
  }

  async function createNewChat(overrides = {}) {
    if (!user) {
      return;
    }

    cancelThinking();
    setDraft("");
    setSearchValue("");
    setSyncError("");

    try {
      await upsertUserProfile(user);
      const conversationId = await createConversation({
        user,
        personaId: overrides.personaId || workspacePersonaId || DEFAULT_PERSONA_ID,
      });
      if (conversationId) {
        const nextWorkspaceContext =
          overrides.workspaceContext ?? workspaceContext;

        if (nextWorkspaceContext?.trim()) {
          await updateConversationWorkspaceContext(
            conversationId,
            nextWorkspaceContext,
          );
        }

        setActiveChatId(conversationId);
      }
    } catch {
      setSyncError("New chat create nahi hua. Firestore permissions check karo.");
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

  async function saveWorkspaceSettings(nextSettings) {
    const nextPersonaId = nextSettings?.personaId || DEFAULT_PERSONA_ID;
    const nextWorkspaceContext = nextSettings?.workspaceContext?.trim() || "";

    setWorkspacePersonaId(nextPersonaId);
    setWorkspaceContext(nextWorkspaceContext);
    setSyncError("");

    if (!activeChatId) {
      return;
    }

    try {
      await Promise.all([
        updateConversationPersona(activeChatId, nextPersonaId),
        updateConversationWorkspaceContext(activeChatId, nextWorkspaceContext),
      ]);
    } catch {
      setSyncError("Workspace settings save nahi hui. Firestore access check karo.");
      throw new Error("Workspace settings save nahi hui.");
    }
  }

  async function submitMessage(rawMessage) {
    const content = rawMessage.trim();
    if (!content || !user) {
      return;
    }

    cancelThinking();
    setSyncError("");

    let targetChat = activeChat;
    let targetChatId = activeChatId;
    let controller = null;
    let userClientTag = "";
    let requestedVideo = false;

    try {
      upsertUserProfile(user).catch(() => {});

      if (!targetChatId) {
        targetChatId = await createConversation({
          user,
          personaId: workspacePersonaId || DEFAULT_PERSONA_ID,
        });
        if (!targetChatId) {
          throw new Error("Conversation could not be created.");
        }

        if (workspaceContext.trim()) {
          await updateConversationWorkspaceContext(targetChatId, workspaceContext);
        }

        setActiveChatId(targetChatId);
      }

      const personaId =
        targetChat?.personaId ?? workspacePersonaId ?? DEFAULT_PERSONA_ID;
      const activeWorkspaceContext =
        targetChat?.workspaceContext ?? workspaceContext ?? "";
      const currentMessageCount = targetChat?.messageCount ?? 0;
      const nextConversationTitle =
        currentMessageCount === 0
          ? content.trim().replace(/\s+/g, " ").slice(0, 38) || "Fresh thread"
          : targetChat?.title ?? "Fresh thread";
      const baseHistory = targetChatId === activeChatId ? activeMessages : [];
      const historyForApi = activeWorkspaceContext.trim()
        ? [
            ...baseHistory,
            {
              role: "user",
              content:
                `Workspace context:\n${activeWorkspaceContext.trim()}\n\n` +
                "Keep this context in mind unless the latest user message clearly changes direction.",
            },
          ]
        : [...baseHistory];
      userClientTag = createClientTag("user");
      const userOptimisticMessage = {
        id: userClientTag,
        clientTag: userClientTag,
        chatId: targetChatId,
        role: "user",
        content,
        timestamp: Date.now(),
      };

      addOptimisticMessage(userOptimisticMessage);
      setDraft("");

      const persistUserMessagePromise = appendConversationMessage({
        conversationId: targetChatId,
        conversationTitle: nextConversationTitle,
        messageCount: currentMessageCount,
        role: "user",
        content,
        clientTag: userClientTag,
        personaId,
        user,
      }).catch((persistError) => {
        removeOptimisticMessage(userClientTag);
        throw persistError;
      });

      controller = new AbortController();
      requestControllerRef.current = controller;

      requestedVideo = isVideoGenerationPrompt(content);

      if (requestedVideo) {
        const videoPrompt = extractVideoPrompt(content);
        setThinkingState({
          chatId: targetChatId,
          startedAt: Date.now(),
          stage: "rendering-video",
        });

        await persistUserMessagePromise;

        const videoJob = await startVideoGeneration({
          prompt: videoPrompt,
          signal: controller.signal,
        });

        setEngine(getVideoChatEngine(videoJob.model, "rendering"));

        const videoResult = await pollVideoGeneration({
          operationName: videoJob.operationName,
          signal: controller.signal,
        });

        if (requestControllerRef.current === controller) {
          requestControllerRef.current = null;
        }

        const readyClientTag = createClientTag("assistant-video");
        const videoReadyMessage =
          "Video ready hai. Neeche play karo ya download kar lo.";
        const videoMedia = {
          prompt: videoPrompt,
          downloadUrl: videoResult.downloadUrl,
          mimeType: videoResult.mimeType,
          model: videoResult.model,
          operationName: videoResult.operationName,
        };

        addOptimisticMessage({
          id: readyClientTag,
          clientTag: readyClientTag,
          chatId: targetChatId,
          role: "assistant",
          content: videoReadyMessage,
          messageType: "video",
          media: videoMedia,
          timestamp: Date.now(),
        });
        setThinkingState(null);
        setEngine(getVideoChatEngine(videoResult.model, "ready"));

        try {
          await appendConversationMessage({
            conversationId: targetChatId,
            conversationTitle: nextConversationTitle,
            messageCount: currentMessageCount + 1,
            role: "assistant",
            content: videoReadyMessage,
            clientTag: readyClientTag,
            personaId,
            user,
            messageType: "video",
            media: videoMedia,
          });
        } catch {
          removeOptimisticMessage(readyClientTag);
          setSyncError("Generated video save nahi hui. Firestore sync check karo.");
        }

        return;
      }

      setThinkingState({
        chatId: targetChatId,
        startedAt: Date.now(),
        stage: predictSearchIntent(content) ? "searching" : "thinking",
      });

      const assistantResponse = await generateAssistantReply({
        message: content,
        personaId,
        history: historyForApi,
        signal: controller.signal,
      });
      await persistUserMessagePromise;

      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }

      setEngine(assistantResponse.engine);
      const persistAssistantReply = async (clientTag) => {
        await appendConversationMessage({
          conversationId: targetChatId,
          conversationTitle: nextConversationTitle,
          messageCount: currentMessageCount + 1,
          role: "assistant",
          content: assistantResponse.reply,
          clientTag,
          personaId,
          user,
        });
      };

      const showAssistantReply = async () => {
        const assistantClientTag = createClientTag("assistant");
        const revealDurationMs = getAssistantRevealDuration(assistantResponse.reply);
        addOptimisticMessage({
          id: assistantClientTag,
          clientTag: assistantClientTag,
          chatId: targetChatId,
          role: "assistant",
          content: assistantResponse.reply,
          revealStyle: "typewriter",
          revealDurationMs,
          timestamp: Date.now(),
        });
        setThinkingState(null);

        try {
          if (revealDurationMs > 0) {
            await new Promise((resolve) =>
              window.setTimeout(resolve, revealDurationMs),
            );
          }

          await persistAssistantReply(assistantClientTag);
        } catch {
          removeOptimisticMessage(assistantClientTag);
          setSyncError("AI reply save nahi hui. Firestore sync check karo.");
        }
      };

      if (assistantResponse.delayMs > 0) {
        timeoutRef.current = window.setTimeout(() => {
          showAssistantReply().finally(() => {
            timeoutRef.current = null;
          });
        }, Math.max(TYPING_CLEAR_DELAY_MS, assistantResponse.delayMs));
        return;
      }

      await new Promise((resolve) => window.setTimeout(resolve, TYPING_CLEAR_DELAY_MS));
      await showAssistantReply();
    } catch (error) {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }

      if (error?.name === "AbortError") {
        setThinkingState(null);
        return;
      }

      if (isLiveChatConfigured() && !requestedVideo) {
        setEngine(getUnavailableChatEngine());
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
    workspacePersonaId,
    workspaceContext,
    createNewChat,
    setActiveChat,
    clearCurrentChat,
    setDraftFromSuggestion,
    saveWorkspaceSettings,
    submitMessage,
  };
}
