import { createMockReply, getThinkingDelay } from "./mock-ai";

const defaultProductionChatApiUrl = "https://max-ai-api.onrender.com/chat";
const rawChatApiUrl =
  import.meta.env.VITE_CHAT_API_URL ?? defaultProductionChatApiUrl;
const chatApiUrl = rawChatApiUrl.trim();
const chatApiBaseUrl = chatApiUrl.replace(/\/chat\/?$/u, "");

const mockEngine = {
  provider: "mock",
  model: "smart-mock",
  status: "ready",
  label: "Smart mock engine",
  detail: "Frontend demo mode active",
};

function buildEngineSnapshot(provider = "backend", model = "", status = "ready") {
  if (provider === "gemini") {
    return {
      provider,
      model,
      status,
      label: model || "Gemini",
      detail: "Secure Gemini via backend",
    };
  }

  if (provider === "ollama") {
    return {
      provider,
      model,
      status,
      label: model || "Ollama",
      detail: "Local Ollama backend active",
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
  return mockEngine;
}

export function isLiveChatConfigured() {
  return Boolean(chatApiUrl);
}

export async function fetchChatEngineStatus(signal) {
  if (!chatApiUrl) {
    return mockEngine;
  }

  try {
    const response = await fetch(`${chatApiBaseUrl}/health`, {
      method: "GET",
      signal,
    });

    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }

    const data = await response.json();
    return buildEngineSnapshot(data.provider, data.model, "ready");
  } catch {
    return buildEngineSnapshot("backend", "", "offline");
  }
}

export async function generateAssistantReply({
  message,
  personaId = "other",
  history = [],
  signal,
}) {
  if (!chatApiUrl) {
    return {
      reply: createMockReply({
        message,
        personaId,
        history: [...history, { role: "user", content: message }],
      }),
      engine: mockEngine,
      delayMs: getThinkingDelay(message),
    };
  }

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
    signal,
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
    engine: buildEngineSnapshot(data?.provider, data?.model, "ready"),
    delayMs: 0,
  };
}
