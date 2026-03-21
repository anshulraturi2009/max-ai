import { createMockReply } from "./mock-ai";

const defaultProductionChatApiUrl = "https://max-ai-api.onrender.com/chat";
const rawChatApiUrl =
  import.meta.env.VITE_CHAT_API_URL ?? defaultProductionChatApiUrl;
const chatApiUrl = rawChatApiUrl.trim();
const chatApiBaseUrl = chatApiUrl.replace(/\/chat\/?$/u, "");
const BACKEND_TIMEOUT_MS = 4000;
const HEALTH_TIMEOUT_MS = 3000;

const mockEngine = {
  provider: "mock",
  model: "smart-mock",
  status: "ready",
  label: "MAX AI instant",
  detail: "Fast fallback reply active",
};

const searchHintPatterns = [
  /\b(latest|news|today|current|recent|update)\b/iu,
  /\b(search|look up|find|check online|web)\b/iu,
  /\b(who is|what is|when is|where is)\b/iu,
];

export function predictSearchIntent(message = "") {
  return searchHintPatterns.some((pattern) => pattern.test(message));
}

function buildEngineSnapshot(
  provider = "backend",
  model = "",
  status = "ready",
  activityType = "thinking",
) {
  if (provider === "gemini") {
    return {
      provider,
      model,
      status,
      label: activityType === "search" ? "Gemini Search" : model || "Gemini",
      detail:
        activityType === "search"
          ? "Gemini + live web search active"
          : "Secure Gemini via backend",
    };
  }

  if (provider === "ollama") {
    return {
      provider,
      model,
      status,
      label: model || "Ollama",
      detail:
        activityType === "search"
          ? "Ollama + web search context active"
          : "Local Ollama backend active",
    };
  }

  if (provider === "max-ai") {
    return {
      provider,
      model,
      status,
      label: "MAX AI identity",
      detail: "Custom brand identity response active",
    };
  }

  if (provider === "mock") {
    return mockEngine;
  }

  return {
    provider,
    model,
    status,
    label: status === "offline" ? "Backend offline" : "Live AI backend",
    detail:
      status === "offline"
        ? "Start the MAX AI backend to enable live responses"
        : "Custom AI backend connected",
  };
}

function sanitizeHistory(history = []) {
  return history
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
    .filter(
      (message) =>
        typeof message.content === "string" &&
        message.content.trim() &&
        (message.role === "user" || message.role === "assistant" || message.role === "model"),
    )
    .slice(-12);
}

export function getDefaultChatEngine() {
  if (chatApiUrl) {
    return {
      provider: "backend",
      model: "",
      status: "connecting",
      label: "Connecting AI",
      detail: "Live backend warm-up in progress",
    };
  }

  return mockEngine;
}

export function isLiveChatConfigured() {
  return Boolean(chatApiUrl);
}

export async function fetchChatEngineStatus(signal) {
  if (!chatApiUrl) {
    return mockEngine;
  }

  const controller = new AbortController();
  const abortTimeout = window.setTimeout(() => {
    controller.abort();
  }, HEALTH_TIMEOUT_MS);
  const handleAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    const response = await fetch(`${chatApiBaseUrl}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    const data = await response.json();
    return buildEngineSnapshot(
      data.provider,
      data.model,
      "ready",
      data.activityType,
    );
  } catch {
    return buildEngineSnapshot("backend", "", "offline");
  } finally {
    window.clearTimeout(abortTimeout);
    signal?.removeEventListener?.("abort", handleAbort);
  }
}

function createFallbackReply({ message, personaId, history }) {
  return {
    reply: createMockReply({
      message,
      personaId,
      history: [...history, { role: "user", content: message }],
    }),
    engine: mockEngine,
    delayMs: 0,
    activityType: predictSearchIntent(message) ? "search" : "thinking",
  };
}

export async function generateAssistantReply({
  message,
  personaId = "other",
  history = [],
  signal,
}) {
  if (!chatApiUrl) {
    return createFallbackReply({ message, personaId, history });
  }

  const controller = new AbortController();
  const abortTimeout = window.setTimeout(() => {
    controller.abort();
  }, BACKEND_TIMEOUT_MS);
  const handleAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    const response = await fetch(chatApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        personaId,
        history: sanitizeHistory(history),
      }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.error ||
          `AI backend request failed with status ${response.status}.`,
      );
    }

    const reply = String(data?.reply ?? "").trim();
    if (!reply) {
      throw new Error("AI backend ne empty reply diya.");
    }

    return {
      reply,
      engine: buildEngineSnapshot(
        data?.provider,
        data?.model,
        "ready",
        data?.activityType,
      ),
      delayMs: 0,
      activityType: data?.activityType || "thinking",
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    return createFallbackReply({ message, personaId, history });
  } finally {
    window.clearTimeout(abortTimeout);
    signal?.removeEventListener?.("abort", handleAbort);
  }
}
