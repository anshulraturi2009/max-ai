import { useEffect, useMemo, useRef, useState } from "react";
import { generateAssistantSpeech } from "../lib/chat-api";

const START_LISTEN_DELAY_MS = 300;
const RESUME_LISTEN_DELAY_MS = 650;
const SEND_SETTLE_DELAY_MS = 1400;
const MAX_SPEECH_CHUNK_CHARS = 160;

function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function chooseVoice(voices) {
  if (!voices.length) {
    return null;
  }

  return (
    voices.find((voice) => /hi-in/i.test(voice.lang)) ||
    voices.find((voice) => /en-in/i.test(voice.lang)) ||
    voices.find((voice) => /en-gb/i.test(voice.lang)) ||
    voices.find((voice) => /en-us/i.test(voice.lang)) ||
    voices[0]
  );
}

function splitLongSegment(segment, maxChars) {
  const words = segment.trim().split(/\s+/u).filter(Boolean);
  const chunks = [];
  let currentChunk = "";

  words.forEach((word) => {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;

    if (candidate.length <= maxChars) {
      currentChunk = candidate;
      return;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    if (word.length <= maxChars) {
      currentChunk = word;
      return;
    }

    for (let index = 0; index < word.length; index += maxChars) {
      chunks.push(word.slice(index, index + maxChars));
    }

    currentChunk = "";
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function splitSpeechText(text) {
  const normalizedText = text.replace(/\s+/gu, " ").trim();
  if (!normalizedText) {
    return [];
  }

  const sentenceLikeChunks =
    normalizedText.match(/[^.!?]+[.!?]?/gu)?.map((chunk) => chunk.trim()) || [
      normalizedText,
    ];

  const finalChunks = [];
  let currentChunk = "";

  sentenceLikeChunks.forEach((sentence) => {
    const candidate = currentChunk ? `${currentChunk} ${sentence}` : sentence;

    if (candidate.length <= MAX_SPEECH_CHUNK_CHARS) {
      currentChunk = candidate;
      return;
    }

    if (currentChunk) {
      finalChunks.push(currentChunk);
      currentChunk = "";
    }

    if (sentence.length <= MAX_SPEECH_CHUNK_CHARS) {
      currentChunk = sentence;
      return;
    }

    splitLongSegment(sentence, MAX_SPEECH_CHUNK_CHARS).forEach((chunk) => {
      finalChunks.push(chunk);
    });
  });

  if (currentChunk) {
    finalChunks.push(currentChunk);
  }

  return finalChunks;
}

export function useVoiceCall({ messages, isThinking, onSend }) {
  const recognitionConstructor = useMemo(getSpeechRecognitionConstructor, []);
  const browserSpeechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;
  const htmlAudioSupported =
    typeof window !== "undefined" && typeof window.Audio === "function";
  const isSupported = Boolean(
    recognitionConstructor && (htmlAudioSupported || browserSpeechSupported),
  );

  const [callActive, setCallActive] = useState(false);
  const [callStage, setCallStage] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");

  const recognitionRef = useRef(null);
  const recognitionSessionRef = useRef(0);
  const restartTimeoutRef = useRef(null);
  const callActiveRef = useRef(false);
  const isThinkingRef = useRef(isThinking);
  const listeningRef = useRef(false);
  const speakingRef = useRef(false);
  const voicesRef = useRef([]);
  const latestAssistantMessageRef = useRef(null);
  const lastAssistantBeforeSendRef = useRef("");
  const lastSpokenAssistantIdRef = useRef("");
  const awaitingAssistantRef = useRef(false);
  const onSendRef = useRef(onSend);
  const playbackSessionRef = useRef(0);
  const audioElementRef = useRef(null);
  const audioObjectUrlRef = useRef("");
  const audioPlaybackAbortRef = useRef(null);
  const audioContextRef = useRef(null);

  const latestAssistantMessage =
    [...messages].reverse().find((message) => message.role === "assistant") || null;

  useEffect(() => {
    latestAssistantMessageRef.current = latestAssistantMessage;
  }, [latestAssistantMessage]);

  useEffect(() => {
    onSendRef.current = onSend;
  }, [onSend]);

  useEffect(() => {
    callActiveRef.current = callActive;
  }, [callActive]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
    if (callActiveRef.current && isThinking) {
      setCallStage("thinking");
      setFeedback("MAX AI soch raha hai...");
    }
  }, [isThinking]);

  useEffect(() => {
    if (
      !callActive ||
      !latestAssistantMessage?.id ||
      isThinking ||
      speakingRef.current ||
      !awaitingAssistantRef.current
    ) {
      return;
    }

    if (
      latestAssistantMessage.id === lastAssistantBeforeSendRef.current ||
      latestAssistantMessage.id === lastSpokenAssistantIdRef.current
    ) {
      return;
    }

    awaitingAssistantRef.current = false;
    speakReply(latestAssistantMessage.content, latestAssistantMessage.id);
  }, [callActive, isThinking, latestAssistantMessage]);

  useEffect(() => {
    if (!browserSpeechSupported) {
      return undefined;
    }

    function syncVoices() {
      voicesRef.current = window.speechSynthesis.getVoices();
    }

    syncVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", syncVoices);

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", syncVoices);
    };
  }, [browserSpeechSupported]);

  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current) {
        window.clearTimeout(restartTimeoutRef.current);
      }

      recognitionSessionRef.current += 1;
      recognitionRef.current?.stop?.();
      stopAudioPlayback();

      if (browserSpeechSupported) {
        window.speechSynthesis.cancel();
      }

      audioContextRef.current?.close?.().catch?.(() => {});
    };
  }, [browserSpeechSupported]);

  function clearRestartTimeout() {
    if (restartTimeoutRef.current) {
      window.clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }

  function getAudioElement() {
    if (!htmlAudioSupported) {
      return null;
    }

    if (!audioElementRef.current) {
      const audio = new window.Audio();
      audio.preload = "auto";
      audio.playsInline = true;
      audioElementRef.current = audio;
    }

    return audioElementRef.current;
  }

  function revokeAudioUrl() {
    if (audioObjectUrlRef.current) {
      URL.revokeObjectURL(audioObjectUrlRef.current);
      audioObjectUrlRef.current = "";
    }
  }

  function stopAudioPlayback() {
    audioPlaybackAbortRef.current?.abort?.();
    audioPlaybackAbortRef.current = null;

    const audio = audioElementRef.current;
    if (audio) {
      audio.pause();
      audio.onended = null;
      audio.onerror = null;
      audio.removeAttribute("src");
      audio.load?.();
    }

    revokeAudioUrl();
  }

  function unlockAudioOutput() {
    if (typeof window === "undefined") {
      queueListening(START_LISTEN_DELAY_MS);
      return;
    }

    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext || null;

    if (AudioContextConstructor) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContextConstructor();
        }

        audioContextRef.current.resume?.().catch?.(() => {});
      } catch {
        // Ignore audio context unlock failures and continue into listening mode.
      }
    }

    queueListening(START_LISTEN_DELAY_MS);
  }

  function queueListening(delay = RESUME_LISTEN_DELAY_MS) {
    clearRestartTimeout();

    if (!callActiveRef.current || listeningRef.current || speakingRef.current) {
      return;
    }

    restartTimeoutRef.current = window.setTimeout(() => {
      restartTimeoutRef.current = null;
      startListening();
    }, delay);
  }

  function stopCurrentRecognition() {
    recognitionSessionRef.current += 1;
    listeningRef.current = false;

    try {
      recognitionRef.current?.stop?.();
    } catch {
      // Ignore browser stop edge-cases during cleanup.
    }

    recognitionRef.current = null;
  }

  function startSpeakingSession(messageId, text) {
    const playbackSessionId = playbackSessionRef.current + 1;
    playbackSessionRef.current = playbackSessionId;
    speakingRef.current = true;
    setCallStage("speaking");
    setTranscript(text);
    setFeedback("MAX AI bol raha hai...");
    return playbackSessionId;
  }

  function finishSpeakingSession(playbackSessionId, messageId, feedbackMessage = "") {
    if (playbackSessionRef.current !== playbackSessionId) {
      return;
    }

    speakingRef.current = false;
    lastSpokenAssistantIdRef.current = messageId;

    if (feedbackMessage) {
      setFeedback(feedbackMessage);
    }

    if (callActiveRef.current) {
      queueListening();
    }
  }

  function speakReplyWithBrowser(text, messageId, playbackSessionId) {
    if (!browserSpeechSupported) {
      finishSpeakingSession(
        playbackSessionId,
        messageId,
        "Reply bolkar suna nahi paya, but call abhi active hai.",
      );
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume?.();
    voicesRef.current = window.speechSynthesis.getVoices();

    const chunks = splitSpeechText(text);
    if (!chunks.length) {
      finishSpeakingSession(playbackSessionId, messageId);
      return;
    }

    const selectedVoice = chooseVoice(voicesRef.current);
    let chunkIndex = 0;

    const speakNextChunk = () => {
      if (
        playbackSessionRef.current !== playbackSessionId ||
        !callActiveRef.current
      ) {
        return;
      }

      const currentChunk = chunks[chunkIndex];
      if (!currentChunk) {
        finishSpeakingSession(playbackSessionId, messageId);
        return;
      }

      const utterance = new window.SpeechSynthesisUtterance(currentChunk);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = navigator.language || "en-IN";
      }

      utterance.rate = 0.96;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        if (playbackSessionRef.current !== playbackSessionId) {
          return;
        }

        chunkIndex += 1;

        if (chunkIndex >= chunks.length) {
          finishSpeakingSession(playbackSessionId, messageId);
          return;
        }

        window.setTimeout(() => {
          window.speechSynthesis.resume?.();
          speakNextChunk();
        }, 70);
      };

      utterance.onerror = () => {
        finishSpeakingSession(
          playbackSessionId,
          messageId,
          "Reply bolkar suna nahi paya, but call abhi active hai.",
        );
      };

      window.speechSynthesis.resume?.();
      window.speechSynthesis.speak(utterance);
    };

    speakNextChunk();
  }

  async function speakReply(text, messageId) {
    if (!callActiveRef.current) {
      return;
    }

    stopAudioPlayback();

    if (browserSpeechSupported) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume?.();
    }

    const playbackSessionId = startSpeakingSession(messageId, text);
    const fallbackToBrowser = () => {
      if (playbackSessionRef.current !== playbackSessionId) {
        return;
      }

      speakReplyWithBrowser(text, messageId, playbackSessionId);
    };

    if (!htmlAudioSupported) {
      fallbackToBrowser();
      return;
    }

    const audio = getAudioElement();
    if (!audio) {
      fallbackToBrowser();
      return;
    }

    const controller = new AbortController();
    audioPlaybackAbortRef.current = controller;

    try {
      const { audioBlob } = await generateAssistantSpeech({
        text,
        signal: controller.signal,
      });

      if (
        playbackSessionRef.current !== playbackSessionId ||
        !callActiveRef.current ||
        controller.signal.aborted
      ) {
        return;
      }

      const objectUrl = URL.createObjectURL(audioBlob);
      revokeAudioUrl();
      audioObjectUrlRef.current = objectUrl;

      audio.src = objectUrl;
      audio.currentTime = 0;
      audio.onended = () => {
        finishSpeakingSession(playbackSessionId, messageId);
      };
      audio.onerror = () => {
        revokeAudioUrl();
        fallbackToBrowser();
      };

      await audio.play();
    } catch (error) {
      if (
        controller.signal.aborted ||
        playbackSessionRef.current !== playbackSessionId ||
        !callActiveRef.current
      ) {
        return;
      }

      fallbackToBrowser();
    }
  }

  async function handleCapturedSpeech(spokenText) {
    lastAssistantBeforeSendRef.current = latestAssistantMessageRef.current?.id ?? "";
    awaitingAssistantRef.current = true;
    setCallStage("thinking");
    setTranscript(spokenText);
    setFeedback("Sending your voice message...");

    try {
      await Promise.resolve(onSendRef.current?.(spokenText));
    } catch {
      // submitMessage already handles UI errors; call mode should recover quietly.
    }

    if (!callActiveRef.current) {
      return;
    }

    window.setTimeout(() => {
      if (!callActiveRef.current) {
        return;
      }

      if (awaitingAssistantRef.current && !isThinkingRef.current && !speakingRef.current) {
        awaitingAssistantRef.current = false;
        setFeedback("Reply voice me play nahi ho paya. Dobara bolo.");
        queueListening();
      }
    }, SEND_SETTLE_DELAY_MS);
  }

  function startListening() {
    if (!callActiveRef.current || !recognitionConstructor || listeningRef.current) {
      return;
    }

    if (speakingRef.current || isThinkingRef.current) {
      queueListening();
      return;
    }

    clearRestartTimeout();
    stopCurrentRecognition();

    const sessionId = recognitionSessionRef.current + 1;
    recognitionSessionRef.current = sessionId;

    const recognition = new recognitionConstructor();
    recognitionRef.current = recognition;
    recognition.lang = navigator.language || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalTranscript = "";

    recognition.onstart = () => {
      if (recognitionSessionRef.current !== sessionId) {
        return;
      }

      listeningRef.current = true;
      setCallStage("listening");
      setTranscript("");
      setFeedback("Listening... bolo.");
    };

    recognition.onresult = (event) => {
      if (recognitionSessionRef.current !== sessionId) {
        return;
      }

      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const chunk = event.results[index][0]?.transcript ?? "";

        if (event.results[index].isFinal) {
          finalTranscript += `${chunk} `;
        } else {
          interimTranscript += chunk;
        }
      }

      setTranscript(`${finalTranscript}${interimTranscript}`.trim());
    };

    recognition.onerror = (event) => {
      if (recognitionSessionRef.current !== sessionId) {
        return;
      }

      listeningRef.current = false;
      recognitionRef.current = null;

      if (!callActiveRef.current || event.error === "aborted") {
        return;
      }

      setCallStage("error");
      setFeedback(
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Mic permission allow karo, tab call chalegi."
          : "Voice call abhi start nahi ho payi. Dobara try karo.",
      );
    };

    recognition.onend = () => {
      if (recognitionSessionRef.current !== sessionId) {
        return;
      }

      listeningRef.current = false;
      recognitionRef.current = null;

      if (!callActiveRef.current) {
        return;
      }

      const spokenText = finalTranscript.trim();

      if (!spokenText) {
        setFeedback("Kuch suna nahi gaya. Dobara bolo.");
        queueListening();
        return;
      }

      handleCapturedSpeech(spokenText);
    };

    try {
      recognition.start();
    } catch {
      listeningRef.current = false;
      recognitionRef.current = null;
      setCallStage("error");
      setFeedback("Voice call abhi start nahi ho payi. Dobara try karo.");
    }
  }

  function stopCall(showMessage = true) {
    callActiveRef.current = false;
    setCallActive(false);
    setCallStage("idle");
    setTranscript("");
    awaitingAssistantRef.current = false;
    playbackSessionRef.current += 1;
    clearRestartTimeout();
    stopCurrentRecognition();
    stopAudioPlayback();
    speakingRef.current = false;

    if (browserSpeechSupported) {
      window.speechSynthesis.cancel();
    }

    setFeedback(showMessage ? "Voice call ended." : "");
  }

  function startCall() {
    if (!isSupported) {
      setCallStage("error");
      setFeedback("Call mode ko speech input ya AI voice output support nahi mil raha.");
      return;
    }

    callActiveRef.current = true;
    setCallActive(true);
    setCallStage("connecting");
    setTranscript("");
    setFeedback("Voice call live ho rahi hai...");
    unlockAudioOutput();
  }

  function toggleCall() {
    if (callActiveRef.current) {
      stopCall();
      return;
    }

    startCall();
  }

  return {
    callActive,
    callStage,
    feedback,
    transcript,
    isSupported,
    toggleCall,
    stopCall,
  };
}
