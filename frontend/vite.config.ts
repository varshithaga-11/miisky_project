import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  // Keep root at this frontend directory.
  root: ".",
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
      "@": "/src",
      "@website": "/src/website",
    },
  },
  define: {
    // Global API URL variable
    // __API_URL__: '"http://127.0.0.1:8000/"',
    // __API_URL__: '"https://backend.testingmiisky.com/"',
    // __API_URL__: '"http://18.190.152.118/"',
    // __API_URL__: '"http://18.190.152.118:8000/"',
    __API_URL__: '"https://api.miisky.com/"',
    // __API_URL__: '"http://localhost:8000/"',
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
