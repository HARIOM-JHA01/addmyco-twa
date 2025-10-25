import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "./dist",
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            )
              return "react-vendor";
            if (id.includes("@fortawesome")) return "fontawesome";
            if (id.includes("@twa-dev") || id.includes("qrcode.react"))
              return "twa-qrcode";
            if (id.includes("axios") || id.includes("zustand"))
              return "vendor-helpers";
            return "vendor";
          }
        },
      },
    },
  },
  base: "/",
  server: {
    port: 3000,
  },
});
