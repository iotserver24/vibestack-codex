import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ["better-sqlite3"],
    },
  },
  plugins: [
    {
      name: "restart",
      closeBundle() {
        process.stdin.emit("data", "rs");
      },
    },
  ],
});
