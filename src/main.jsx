import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PerformanceProvider } from "./context/PerformanceContext";
import { bootstrapInstallPrompt } from "./lib/installPrompt";
import { registerServiceWorker } from "./lib/registerServiceWorker";
import "./index.css";

bootstrapInstallPrompt();
registerServiceWorker();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PerformanceProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </PerformanceProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
