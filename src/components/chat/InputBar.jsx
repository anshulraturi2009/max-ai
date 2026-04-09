import { useEffect, useRef, useState } from "react";
import {
  Eraser,
  FolderOpen,
  LoaderCircle,
  Mic,
  Paperclip,
  Phone,
  PhoneOff,
  SendHorizonal,
  Sparkles,
  X,
} from "lucide-react";

const MAX_ATTACHMENTS = 8;
const MAX_TEXT_FILE_SIZE_BYTES = 256 * 1024;
const MAX_TEXT_PREVIEW_CHARS = 1800;
const MAX_TOTAL_ATTACHMENT_CHARS = 12000;
const TEXT_FILE_EXTENSIONS = new Set([
  "c",
  "cpp",
  "css",
  "csv",
  "env",
  "html",
  "java",
  "js",
  "json",
  "jsx",
  "md",
  "mjs",
  "py",
  "rb",
  "sql",
  "svg",
  "ts",
  "tsx",
  "txt",
  "xml",
  "yaml",
  "yml",
]);

function formatFileSize(size = 0) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(name = "") {
  const segments = name.toLowerCase().split(".");
  return segments.length > 1 ? segments[segments.length - 1] : "";
}

function isTextPreviewSupported(file) {
  if (file.type?.startsWith("text/")) {
    return true;
  }

  return TEXT_FILE_EXTENSIONS.has(getFileExtension(file.name));
}

async function buildAttachment(file) {
  const path = file.webkitRelativePath || file.name;
  const baseAttachment = {
    id: `${path}-${file.size}-${file.lastModified}`,
    name: file.name,
    path,
    size: file.size,
    sizeLabel: formatFileSize(file.size),
    textPreview: "",
    note: "",
    kind: file.webkitRelativePath ? "folder" : "file",
  };

  if (!isTextPreviewSupported(file)) {
    return {
      ...baseAttachment,
      note: file.type
        ? `Preview unavailable for ${file.type}. Metadata only attached.`
        : "Preview unavailable for this file type. Metadata only attached.",
    };
  }

  if (file.size > MAX_TEXT_FILE_SIZE_BYTES) {
    return {
      ...baseAttachment,
      note: `Preview skipped because the file is larger than ${formatFileSize(
        MAX_TEXT_FILE_SIZE_BYTES,
      )}.`,
    };
  }

  try {
    const rawText = await file.text();
    const textPreview = rawText.slice(0, MAX_TEXT_PREVIEW_CHARS);

    return {
      ...baseAttachment,
      textPreview,
      note:
        rawText.length > MAX_TEXT_PREVIEW_CHARS
          ? "Preview truncated to keep the chat lightweight."
          : "Text preview ready.",
    };
  } catch {
    return {
      ...baseAttachment,
      note: "Could not read this file in the browser. Metadata only attached.",
    };
  }
}

function buildAttachmentMessage(draft, attachments) {
  const prompt =
    draft.trim() || "Please review these selected files and help me with them.";
  let remainingChars = MAX_TOTAL_ATTACHMENT_CHARS;

  const attachmentSections = attachments.map((attachment, index) => {
    const lines = [
      `Attachment ${index + 1}: ${attachment.path}`,
      `Size: ${attachment.sizeLabel}`,
      `Source: ${attachment.kind === "folder" ? "Folder selection" : "File selection"}`,
    ];

    if (attachment.note) {
      lines.push(`Note: ${attachment.note}`);
    }

    if (attachment.textPreview && remainingChars > 0) {
      const preview = attachment.textPreview.slice(0, remainingChars);
      remainingChars -= preview.length;
      lines.push("Preview:");
      lines.push(preview);

      if (preview.length < attachment.textPreview.length) {
        lines.push("[Preview shortened because the attachment set is large.]");
      }
    }

    return lines.join("\n");
  });

  return `${prompt}\n\nSelected attachments:\n\n${attachmentSections.join("\n\n")}`;
}

export default function InputBar({
  draft,
  setDraft,
  onSend,
  disabled,
  onClear,
  voiceCallActive = false,
  voiceCallStage = "idle",
  voiceCallSupported = false,
  voiceCallFeedback = "",
  onToggleVoiceCall,
  canClear = false,
}) {
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const speechBaseDraftRef = useRef("");
  const speechFinalTranscriptRef = useRef("");
  const menuRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      180,
    )}px`;
  }, [draft]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setAttachmentMenuOpen(false);
      }
    }

    if (!attachmentMenuOpen) {
      return undefined;
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [attachmentMenuOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  useEffect(() => {
    if (!disabled || !isListening) {
      return;
    }

    recognitionRef.current?.stop?.();
  }, [disabled, isListening]);

  async function handleSend() {
    if (disabled || (!draft.trim() && !attachments.length)) {
      return;
    }

    recognitionRef.current?.stop?.();

    const messageToSend = attachments.length
      ? buildAttachmentMessage(draft, attachments)
      : draft;

    setDraft("");
    setAttachments([]);
    setAttachmentMenuOpen(false);
    setStatusMessage("");
    Promise.resolve(onSend(messageToSend)).catch(() => {});
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  async function handleAttachmentSelection(fileList) {
    const selectedFiles = Array.from(fileList || []);
    if (!selectedFiles.length) {
      return;
    }

    const availableSlots = Math.max(MAX_ATTACHMENTS - attachments.length, 0);
    if (!availableSlots) {
      setStatusMessage(`You can attach up to ${MAX_ATTACHMENTS} items in one message.`);
      return;
    }

    const acceptedFiles = selectedFiles.slice(0, availableSlots);
    setAttachmentsLoading(true);
    setStatusMessage("");

    try {
      const nextAttachments = await Promise.all(
        acceptedFiles.map((file) => buildAttachment(file)),
      );

      setAttachments((currentAttachments) => {
        const nextMap = new Map(
          currentAttachments.map((attachment) => [attachment.id, attachment]),
        );

        nextAttachments.forEach((attachment) => {
          nextMap.set(attachment.id, attachment);
        });

        return Array.from(nextMap.values()).slice(0, MAX_ATTACHMENTS);
      });

      const skippedCount = selectedFiles.length - acceptedFiles.length;
      setStatusMessage(
        skippedCount > 0
          ? `${acceptedFiles.length} item(s) attached. ${skippedCount} skipped because the chat limit is ${MAX_ATTACHMENTS}.`
          : `${acceptedFiles.length} item(s) attached and ready.`,
      );
    } finally {
      setAttachmentsLoading(false);
    }
  }

  function handleFileInputChange(event) {
    handleAttachmentSelection(event.target.files);
    event.target.value = "";
  }

  function removeAttachment(attachmentId) {
    setAttachments((currentAttachments) =>
      currentAttachments.filter((attachment) => attachment.id !== attachmentId),
    );
  }

  function startSpeechToText() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatusMessage("Mic transcription is not supported in this browser yet.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    speechBaseDraftRef.current = draft.trim() ? `${draft.trim()} ` : "";
    speechFinalTranscriptRef.current = "";

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage("Listening... bolte raho, text draft me aata rahega.");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript ?? "";

        if (event.results[index].isFinal) {
          speechFinalTranscriptRef.current += `${transcript} `;
        } else {
          interimTranscript += transcript;
        }
      }

      setDraft(
        `${speechBaseDraftRef.current}${speechFinalTranscriptRef.current}${interimTranscript}`.trim(),
      );
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setStatusMessage(
        event.error === "not-allowed"
          ? "Mic permission allow karo, tab voice typing chalegi."
          : "Mic input abhi start nahi ho paya. Ek baar phir try karo.",
      );
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusMessage((currentMessage) =>
        currentMessage.startsWith("Listening")
          ? "Voice input stopped. Aap draft edit karke send kar sakte ho."
          : currentMessage,
      );
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      setStatusMessage("Mic input abhi start nahi ho paya. Ek baar phir try karo.");
    }
  }

  function toggleSpeechToText() {
    if (voiceCallActive) {
      setStatusMessage("Call mode active hai. Phone button se baat karo.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop?.();
      return;
    }

    setAttachmentMenuOpen(false);
    startSpeechToText();
  }

  function handleVoiceCallToggle() {
    setAttachmentMenuOpen(false);
    setStatusMessage("");
    onToggleVoiceCall?.();
  }

  const helperMessage = voiceCallActive
    ? `Voice call active${voiceCallStage !== "idle" ? ` | ${voiceCallStage}` : ""}`
    : statusMessage || voiceCallFeedback;

  return (
    <div className="safe-bottom z-20 shrink-0 border-t border-white/10 bg-gradient-to-t from-slate-950 via-slate-950/95 to-slate-950/90 px-3 pt-3 sm:px-6 sm:pt-4">
      <div className="input-shell mx-auto max-w-none p-2.5 sm:p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="status-chip">
              <Sparkles className="h-3.5 w-3.5" />
              MAX AI live
            </span>
            <span className="hidden rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-400 sm:inline-flex">
              Shift + Enter for new line
            </span>
            <span className="hidden rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-100 lg:inline-flex">
              Type: ek video banao jisme...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                title="Add files or folder"
                onClick={() => setAttachmentMenuOpen((current) => !current)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08] sm:h-11 sm:w-11"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              {attachmentMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.6rem)] z-30 min-w-[190px] rounded-[22px] border border-white/10 bg-slate-950/95 p-2 shadow-[0_20px_60px_rgba(2,8,23,0.48)] backdrop-blur-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentMenuOpen(false);
                      fileInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]"
                  >
                    <Paperclip className="h-4 w-4" />
                    Add files
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentMenuOpen(false);
                      folderInputRef.current?.click();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-slate-200 transition hover:bg-white/[0.06]"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Add folder
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              title={
                voiceCallActive
                  ? "End call"
                  : voiceCallSupported
                    ? "Start voice call"
                    : "Call mode not supported"
              }
              onClick={handleVoiceCallToggle}
              disabled={disabled && !voiceCallActive}
              className={`grid h-10 w-10 place-items-center rounded-2xl border transition sm:h-11 sm:w-11 ${
                voiceCallActive
                  ? "border-emerald-300/30 bg-emerald-300/15 text-emerald-100"
                  : "border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {voiceCallActive ? (
                <PhoneOff className="h-4 w-4" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              title={
                voiceCallActive
                  ? "Call mode active"
                  : isListening
                    ? "Stop voice typing"
                    : "Start voice typing"
              }
              onClick={toggleSpeechToText}
              disabled={disabled || voiceCallActive}
              className={`grid h-10 w-10 place-items-center rounded-2xl border transition sm:h-11 sm:w-11 ${
                isListening
                  ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100"
                  : "border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Mic className="h-4 w-4" />
            </button>
            {canClear ? (
              <button
                type="button"
                onClick={onClear}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.08] sm:h-11 sm:w-11"
              >
                <Eraser className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          multiple
          webkitdirectory=""
          className="hidden"
          onChange={handleFileInputChange}
        />

        {attachments.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-200"
              >
                {attachment.kind === "folder" ? (
                  <FolderOpen className="h-3.5 w-3.5 shrink-0 text-cyan-200" />
                ) : (
                  <Paperclip className="h-3.5 w-3.5 shrink-0 text-cyan-200" />
                )}
                <span className="truncate">{`${attachment.path} | ${attachment.sizeLabel}`}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-slate-400 transition hover:text-white"
                  title={`Remove ${attachment.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        {attachmentsLoading || helperMessage ? (
          <div className="mb-3 flex items-center gap-2 px-2 text-xs text-slate-400 sm:px-3">
            {attachmentsLoading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin text-cyan-200" />
            ) : (
              <span
                className={`h-2 w-2 rounded-full ${
                  voiceCallActive
                    ? "bg-emerald-300"
                    : isListening
                      ? "bg-cyan-300"
                      : "bg-slate-500"
                }`}
              />
            )}
            <span>{attachmentsLoading ? "Reading selected items..." : helperMessage}</span>
          </div>
        ) : null}

        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask MAX AI anything... ya likho: ek video banao jisme..."
            className="max-h-[180px] min-h-[52px] flex-1 bg-transparent px-2 py-3 text-sm leading-7 text-white outline-none placeholder:text-slate-500 sm:min-h-[64px] sm:px-3 sm:py-4"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || (!draft.trim() && !attachments.length)}
            className="inline-flex h-12 items-center gap-2 rounded-[18px] bg-white px-4 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:rounded-[20px] sm:px-5"
          >
            <span className="hidden sm:inline">Send</span>
            <SendHorizonal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
