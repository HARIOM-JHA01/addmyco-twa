import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import WebApp from "@twa-dev/sdk";
import { applyCachedThemeFromStorage } from "./utils/theme";

// Restore last-known theme/background before first render only for active sessions.
// Keep welcome screen on default background for logged-out users.
if (localStorage.getItem("token")) {
  applyCachedThemeFromStorage();
}

WebApp.ready();

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch((err) => {
          console.error("ServiceWorker unregister failed:", err);
        });
      });
      console.info("Service workers unregistered (if any).");
    })
    .catch((err) => {
      console.error("Failed to get service worker registrations:", err);
    });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
