import { useEffect, useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import {
  consumeInstallPrompt,
  getInstallState,
  subscribeInstallPrompt,
} from "../../lib/installPrompt";

export default function InstallButton({ ghostOnMobile = false }) {
  const [installState, setInstallState] = useState(getInstallState);
  const [isPrompting, setIsPrompting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const { installed, deferredPrompt } = installState;

  useEffect(() => {
    return subscribeInstallPrompt((nextState) => {
      setInstallState(nextState);

      if (nextState.installed) {
        setIsPrompting(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFeedback(""), 2600);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  async function handleInstall() {
    if (installed || isPrompting) {
      return;
    }

    if (!deferredPrompt) {
      setFeedback("Install abhi is browser me ready nahi hai.");
      return;
    }

    setIsPrompting(true);

    try {
      const promptEvent = consumeInstallPrompt();

      if (!promptEvent) {
        setIsPrompting(false);
        setFeedback("Install abhi is browser me ready nahi hai.");
        return;
      }

      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;

      if (choice.outcome !== "accepted") {
        setIsPrompting(false);
        setFeedback("Install cancel ho gaya.");
      }
    } catch {
      setIsPrompting(false);
      setFeedback("Install abhi start nahi ho paya.");
    }
  }

  if (installed) {
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm shadow-[0_14px_28px_rgba(5,150,105,0.14)] ${
          isLight
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
        } ${
          ghostOnMobile
            ? isLight
              ? "max-sm:border-transparent max-sm:bg-transparent max-sm:px-2.5 max-sm:shadow-none"
              : "max-sm:border-transparent max-sm:bg-transparent max-sm:px-2.5 max-sm:shadow-none"
            : ""
        }`}
      >
        <CheckCircle2 className="h-4 w-4" />
        <span className="hidden sm:inline">Installed</span>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleInstall}
        disabled={isPrompting}
        className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition disabled:cursor-wait disabled:opacity-70 ${
          isLight
            ? "border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
            : "border-white/10 bg-white/[0.05] text-slate-100 hover:bg-white/[0.08]"
        } ${
          ghostOnMobile
            ? isLight
              ? "max-sm:border-transparent max-sm:bg-transparent max-sm:px-2.5 max-sm:text-slate-700 max-sm:hover:bg-slate-200/55"
              : "max-sm:border-transparent max-sm:bg-transparent max-sm:px-2.5 max-sm:text-slate-200 max-sm:hover:bg-white/[0.06]"
            : ""
        }`}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isPrompting ? "Installing..." : "Install"}
        </span>
      </button>

      {feedback ? (
        <div
          className={`absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border px-3 py-2 text-xs shadow-[0_18px_44px_rgba(8,15,35,0.18)] backdrop-blur-xl ${
            isLight
              ? "border-slate-200 bg-white/95 text-slate-600"
              : "border-white/10 bg-slate-950/95 text-slate-300"
          }`}
        >
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
