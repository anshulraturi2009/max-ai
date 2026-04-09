import { createMockReply } from "./mock-ai";

const defaultProductionChatApiUrl = "https://max-ai-api.onrender.com/chat";
const rawChatApiUrl =
  import.meta.env.VITE_CHAT_API_URL ?? defaultProductionChatApiUrl;
const chatApiUrl = rawChatApiUrl.trim();
const chatApiBaseUrl = chatApiUrl.replace(/\/chat\/?$/u, "");
const voiceApiUrl = chatApiUrl ? `${chatApiBaseUrl}/voice/tts` : "";
const videoStartApiUrl = chatApiUrl ? `${chatApiBaseUrl}/video/generate` : "";
const videoStatusApiUrl = chatApiUrl ? `${chatApiBaseUrl}/video/status` : "";
const BACKEND_TIMEOUT_MS = 70000;
const HEALTH_TIMEOUT_MS = 5000;
const VOICE_TIMEOUT_MS = 45000;
const VIDEO_START_TIMEOUT_MS = 45000;
const VIDEO_POLL_TIMEOUT_MS = 8 * 60 * 1000;
const VIDEO_FALLBACK_POLL_DELAY_MS = 10000;
const DEFAULT_VIDEO_MODEL = "veo-3.1-lite-generate-preview";

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

const videoCreateVerbPattern =
  /\b(create|generate|make|banao|banado|bana do|taiyar karo)\b/iu;
const videoNounPattern = /\b(video|clip|reel|animation|cinematic)\b/iu;
const explicitTextToVideoPattern = /\btext\s*to\s*video\b/iu;
const leadingVideoPromptPatterns = [
  /^(please\s+)?(text\s*to\s*video)\s*[:,-]?\s*/iu,
  /^(please\s+)?(create|generate|make)\s+(me\s+)?(an?\s+)?(short\s+)?(cinematic\s+)?(video|clip|reel)\s*(of|where|with)?\s*/iu,
  /^(please\s+)?(ek\s+)?(short\s+)?(cinematic\s+)?(video|clip|reel)\s+(banao|banado|bana do)\s*(jisme|jahan|where|with|of)?\s*/iu,
];

const selfIdentityPatterns = [
  /\btum\s+kaun\s+ho\b/iu,
  /\btum\s+kon\s+ho\b/iu,
  /\baap\s+kaun\s+ho\b/iu,
  /\baap\s+kon\s+ho\b/iu,
  /\bap\s+kaun\s+ho\b/iu,
  /\bap\s+kon\s+ho\b/iu,
  /\bwho\s+are\s+you\b/iu,
  /\bwhat\s+are\s+you\b/iu,
];

const creatorPatterns = [
  /\bkisne\s+banaya\b/iu,
  /\bbanaya\s+kisne\b/iu,
  /\bwho\s+made\s+you\b/iu,
  /\bwho\s+built\s+you\b/iu,
  /\bwho\s+created\s+you\b/iu,
  /\bkisne\s+create\s+kiya\b/iu,
];

const anshulPatterns = [
  /\banshul\b.*\b(?:raturi|ratrui)\b/iu,
  /\bwho\s+is\s+anshul\b/iu,
  /\banshul\s+kaun\s+hai\b/iu,
  /\banshul\s+kon\s+hai\b/iu,
];

const videoCapabilityPatterns = [
  /\b(video|clip|reel)\b.*\b(bana\s+sakte|bana\s+skte|generate\s+kar\s+sakte|create\s+kar\s+sakte|make)\b/iu,
  /\b(can\s+you|are\s+you\s+able\s+to)\b.*\b(video|clip|reel)\b/iu,
  /\b(kya|tum|aap)\b.*\b(video|clip|reel)\b.*\b(bana\s+sakte|bana\s+skte)\b/iu,
];

export function predictSearchIntent(message = "") {
  return searchHintPatterns.some((pattern) => pattern.test(message));
}

export function isVideoGenerationPrompt(message = "") {
  const normalizedMessage = message.trim();
  if (!normalizedMessage) {
    return false;
  }

  return (
    explicitTextToVideoPattern.test(normalizedMessage) ||
    (videoNounPattern.test(normalizedMessage) &&
      videoCreateVerbPattern.test(normalizedMessage))
  );
}

export function extractVideoPrompt(message = "") {
  const normalizedMessage = message.trim().replace(/\s+/gu, " ");
  if (!normalizedMessage) {
    return "";
  }

  for (const pattern of leadingVideoPromptPatterns) {
    const strippedMessage = normalizedMessage.replace(pattern, "").trim();
    if (strippedMessage && strippedMessage !== normalizedMessage) {
      return strippedMessage;
    }
  }

  return normalizedMessage;
}

function matchesPattern(message, patterns) {
  return patterns.some((pattern) => pattern.test(message));
}

function createIdentityReply(message) {
  if (matchesPattern(message, anshulPatterns)) {
    return "Anshul Raturi is a young Indian founder. He belongs to Uttarakhand and he developed MAX AI.";
  }

  if (matchesPattern(message, selfIdentityPatterns)) {
    return "Mai MAX AI hu. Mujhe Anshul Raturi ne banaya hai. Anshul Raturi is a young Indian founder and he belongs to Uttarakhand.";
  }

  if (matchesPattern(message, creatorPatterns)) {
    return "Mujhe Anshul Raturi ne banaya hai. Anshul Raturi is a young Indian founder and he belongs to Uttarakhand.";
  }

  return "";
}

function createCapabilityReply(message) {
  if (matchesPattern(message, videoCapabilityPatterns)) {
    return (
      "Haan, is app me main text se video generate kar sakta hu. " +
      "Bas likho: ek video banao jisme ek aadmi gadi chala raha ho. " +
      "Uske baad video generation start ho jayegi aur ready hote hi niche video box me dikhegi."
    );
  }

  return "";
}

function buildEngineSnapshot(
  provider = "backend",
  model = "",
  status = "ready",
  activityType = "thinking",
) {
  if (status === "waking") {
    return {
      provider,
      model,
      status,
      label: "Waking backend",
      detail: "Render backend warm ho raha hai",
    };
  }

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

  if (provider === "groq") {
    return {
      provider,
      model,
      status,
      label: model || "Groq",
      detail: "Fast Groq chat backend active",
    };
  }

  if (provider === "google-veo") {
    return {
      provider,
      model,
      status,
      label: model || "Veo video",
      detail:
        status === "rendering"
          ? "Google Veo text-to-video generation in progress"
          : "Google Veo video generation active",
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

function buildLiveBackendError(error) {
  if (error?.name === "AbortError") {
    return new Error(
      "MAX AI backend warm hone me zyada time le raha hai. Thoda wait karke phir try karo.",
    );
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return new Error(error.message.trim());
  }

  return new Error(
    "MAX AI backend abhi reachable nahi hai. Thodi der baad phir try karo.",
  );
}

function buildVideoBackendError(error) {
  if (error?.name === "AbortError") {
    return new Error(
      "Video generation cancel ho gayi ya timeout ho gaya. Thoda wait karke phir try karo.",
    );
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return new Error(error.message.trim());
  }

  return new Error(
    "Video generation abhi complete nahi ho payi. Thodi der baad phir try karo.",
  );
}

function delayWithAbort(durationMs, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal?.removeEventListener?.("abort", handleAbort);
      resolve();
    }, durationMs);

    function handleAbort() {
      window.clearTimeout(timeoutId);
      reject(new DOMException("Aborted", "AbortError"));
    }

    signal?.addEventListener?.("abort", handleAbort, { once: true });
  });
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

export function getUnavailableChatEngine() {
  return buildEngineSnapshot("backend", "", "offline");
}

export function getVideoChatEngine(
  model = DEFAULT_VIDEO_MODEL,
  status = "rendering",
) {
  return buildEngineSnapshot("google-veo", model, status, "video");
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
  } catch (error) {
    if (error?.name === "AbortError") {
      return buildEngineSnapshot("backend", "", "waking");
    }

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
  const identityReply = createIdentityReply(message);
  if (identityReply) {
    return {
      reply: identityReply,
      engine: buildEngineSnapshot("max-ai", "creator-identity", "ready", "identity"),
      delayMs: 0,
      activityType: "identity",
    };
  }

  const capabilityReply = createCapabilityReply(message);
  if (capabilityReply) {
    return {
      reply: capabilityReply,
      engine: buildEngineSnapshot("max-ai", "feature-capability", "ready", "capability"),
      delayMs: 0,
      activityType: "capability",
    };
  }

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

    throw buildLiveBackendError(error);
  } finally {
    window.clearTimeout(abortTimeout);
    signal?.removeEventListener?.("abort", handleAbort);
  }
}

export async function generateAssistantSpeech({ text, signal }) {
  if (!voiceApiUrl) {
    throw new Error("Voice backend configured nahi hai.");
  }

  const normalizedText = String(text ?? "").replace(/\s+/gu, " ").trim();
  if (!normalizedText) {
    throw new Error("Voice playback text missing hai.");
  }

  const controller = new AbortController();
  const abortTimeout = window.setTimeout(() => {
    controller.abort();
  }, VOICE_TIMEOUT_MS);
  const handleAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    const response = await fetch(voiceApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: normalizedText }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(
        data?.error ||
          `Voice backend request failed with status ${response.status}.`,
      );
    }

    const audioBlob = await response.blob();
    if (!audioBlob.size) {
      throw new Error("Voice backend ne empty audio return ki.");
    }

    return {
      audioBlob,
      keyLabel: response.headers.get("X-MAX-AI-Voice-Key") || "",
    };
  } finally {
    window.clearTimeout(abortTimeout);
    signal?.removeEventListener?.("abort", handleAbort);
  }
}

export async function startVideoGeneration({ prompt, signal }) {
  if (!videoStartApiUrl) {
    throw new Error("Video backend configured nahi hai.");
  }

  const normalizedPrompt = extractVideoPrompt(prompt);
  if (!normalizedPrompt) {
    throw new Error("Video prompt missing hai.");
  }

  const controller = new AbortController();
  const abortTimeout = window.setTimeout(() => {
    controller.abort();
  }, VIDEO_START_TIMEOUT_MS);
  const handleAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    const response = await fetch(videoStartApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: normalizedPrompt }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(
        data?.error ||
          `Video backend request failed with status ${response.status}.`,
      );
    }

    const operationName = String(data?.operationName ?? "").trim();
    if (!operationName) {
      throw new Error("Video backend ne operation id return nahi ki.");
    }

    return {
      operationName,
      model: String(data?.model ?? DEFAULT_VIDEO_MODEL).trim() || DEFAULT_VIDEO_MODEL,
      provider: String(data?.provider ?? "google-veo").trim() || "google-veo",
      pollAfterMs:
        typeof data?.pollAfterMs === "number" && data.pollAfterMs > 0
          ? data.pollAfterMs
          : VIDEO_FALLBACK_POLL_DELAY_MS,
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw buildVideoBackendError(error);
  } finally {
    window.clearTimeout(abortTimeout);
    signal?.removeEventListener?.("abort", handleAbort);
  }
}

export async function pollVideoGeneration({ operationName, signal }) {
  if (!videoStatusApiUrl) {
    throw new Error("Video backend configured nahi hai.");
  }

  const normalizedOperationName = String(operationName ?? "").trim();
  if (!normalizedOperationName) {
    throw new Error("Video operation id missing hai.");
  }

  const controller = new AbortController();
  const abortTimeout = window.setTimeout(() => {
    controller.abort();
  }, VIDEO_POLL_TIMEOUT_MS);
  const handleAbort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  }

  try {
    while (true) {
      const statusUrl = new URL(videoStatusApiUrl, window.location.origin);
      statusUrl.searchParams.set("operation", normalizedOperationName);

      const response = await fetch(statusUrl.toString(), {
        method: "GET",
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Video status request failed with status ${response.status}.`,
        );
      }

      if (data?.status === "failed") {
        throw new Error(
          data?.error || "Video generation fail ho gayi. Prompt ko clearer try karo.",
        );
      }

      if (data?.status === "completed" && data?.downloadUrl) {
        return {
          downloadUrl: String(data.downloadUrl).trim(),
          mimeType: String(data?.mimeType ?? "video/mp4").trim() || "video/mp4",
          model: String(data?.model ?? DEFAULT_VIDEO_MODEL).trim() || DEFAULT_VIDEO_MODEL,
          provider: String(data?.provider ?? "google-veo").trim() || "google-veo",
          operationName: normalizedOperationName,
        };
      }

      await delayWithAbort(
        typeof data?.pollAfterMs === "number" && data.pollAfterMs > 0
          ? data.pollAfterMs
          : VIDEO_FALLBACK_POLL_DELAY_MS,
        controller.signal,
      );
    }
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw buildVideoBackendError(error);
  } finally {
    window.clearTimeout(abortTimeout);
    signal?.removeEventListener?.("abort", handleAbort);
  }
}
