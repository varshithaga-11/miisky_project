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
    __API_URL__: '"http://localhost:8000/"',
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
