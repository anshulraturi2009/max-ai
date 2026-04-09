import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PerformanceProvider } from "./context/PerformanceContext";
import { ThemeProvider } from "./context/ThemeContext";
import { bootstrapInstallPrompt } from "./lib/installPrompt";
import { registerServiceWorker } from "./lib/registerServiceWorker";
import "./index.css";

bootstrapInstallPrompt();
registerServiceWorker();

const bootSplash = document.getElementById("app-boot-splash");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PerformanceProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </PerformanceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

if (bootSplash) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      bootSplash.classList.add("app-boot-splash--hidden");
      window.setTimeout(() => bootSplash.remove(), 450);
    });
  });
}
