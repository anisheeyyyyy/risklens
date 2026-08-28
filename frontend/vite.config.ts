import {
  defineConfig,
} from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "0.0.0.0",

    // 5173 is your normal port.
    // If it is already occupied, Vite can move to 5174.
    port: 5173,

    strictPort: false,

    proxy: {
      "/api": {
        target:
          "http://localhost:5000",

        changeOrigin: true,

        secure: false,

        // Browser:
        //   http://localhost:5174/api/...
        //
        // Vite internally forwards:
        //   http://localhost:5000/api/...
        //
        // The backend URL is NOT exposed
        // to browser JavaScript.

        configure: (
          proxy
        ) => {
          proxy.on(
            "error",
            (error) => {
              console.error(
                "[Vite Proxy] API proxy error:",
                error.message
              );
            }
          );
        },
      },
    },
  },

  preview: {
    host: "0.0.0.0",

    port: 4173,

    strictPort: false,
  },
});