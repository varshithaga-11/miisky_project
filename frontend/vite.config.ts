import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
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
    // Global API URL variable
    // __API_URL__: '"http://127.0.0.1:8000/"',
    // __API_URL__: '"https://backend.testingmiisky.com/"',
    // __API_URL__: '"http://18.190.152.118/"',
    // __API_URL__: '"http://18.190.152.118:8000/"',
    __API_URL__: '"https://api.miisky.com/"',
  },
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        website: "./website.html",
      },
    },
  },
});
