import { useEffect, useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import {
  consumeInstallPrompt,
  getInstallState,
  subscribeInstallPrompt,
} from "../../lib/installPrompt";

export default function InstallButton() {
  const [installState, setInstallState] = useState(getInstallState);
  const [isPrompting, setIsPrompting] = useState(false);
  const [feedback, setFeedback] = useState("");
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
      <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
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
        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-slate-700 disabled:cursor-wait disabled:opacity-70"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isPrompting ? "Installing..." : "Install"}
        </span>
      </button>

      {feedback ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300 shadow-lg">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
