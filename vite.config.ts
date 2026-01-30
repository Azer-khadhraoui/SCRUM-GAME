import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from "kimi-plugin-inspect-react"

// https://vite.dev/config/
// GitHub Pages sert l'app sous /<repo>/, donc il faut un base correct en prod.
export default defineConfig(({ mode }) => ({
  root: "src",
  base: mode === "production" ? "/SCRUM-GAME/" : "/",
  plugins: [inspectAttr(), react()],
  build: {
    // Sortie dans la racine du repo pour GitHub Pages (Deploy from branch: main / root)
    outDir: "..",
    // IMPORTANT: ne pas supprimer les fichiers du repo (package.json, src/, etc.)
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.html"),
        notFound: path.resolve(__dirname, "src/404.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
