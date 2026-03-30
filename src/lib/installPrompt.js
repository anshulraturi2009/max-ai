const listeners = new Set();

let bootstrapped = false;
let mediaQuery = null;
let installState = {
  deferredPrompt: null,
  installed: false,
};

function notifyListeners() {
  const snapshot = { ...installState };
  listeners.forEach((listener) => listener(snapshot));
}

function updateInstalledState() {
  if (typeof window === "undefined") {
    return;
  }

  installState = {
    ...installState,
    installed: mediaQuery?.matches || window.navigator.standalone === true,
  };

  notifyListeners();
}

export function bootstrapInstallPrompt() {
  if (bootstrapped || typeof window === "undefined") {
    return;
  }

  bootstrapped = true;
  mediaQuery = window.matchMedia("(display-mode: standalone)");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installState = {
      ...installState,
      deferredPrompt: event,
    };
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    installState = {
      deferredPrompt: null,
      installed: true,
    };
    notifyListeners();
  });

  mediaQuery.addEventListener?.("change", updateInstalledState);
  updateInstalledState();
}

export function getInstallState() {
  return { ...installState };
}

export function subscribeInstallPrompt(listener) {
  bootstrapInstallPrompt();
  listeners.add(listener);
  listener(getInstallState());

  return () => {
    listeners.delete(listener);
  };
}

export function consumeInstallPrompt() {
  const promptEvent = installState.deferredPrompt;

  installState = {
    ...installState,
    deferredPrompt: null,
  };

  notifyListeners();
  return promptEvent;
}
