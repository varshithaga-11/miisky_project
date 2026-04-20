import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const apiBase = env.VITE_API_URL ?? "https://api.miisky.com";
  const apiUrl = apiBase.endsWith("/") ? apiBase : `${apiBase}/`;

  return {
    // Pin root to this folder so aliases work when the dev server is started from a parent directory.
    root: __dirname,
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          // This will transform your SVG to a React component
          exportType: "named",
          namedExport: "ReactComponent",
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
        "@website": path.join(__dirname, "src", "website"),
      },
    },
    define: {
      // Global API URL variable from env.
      __API_URL__: JSON.stringify(apiUrl),
    },
    build: {
      rollupOptions: {
        input: {
          main: "./index.html",
          website: "./website.html",
        },
      },
    },
  };
});
