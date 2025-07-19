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
      plugins: [
        {
          name: "ignore-native-modules",
          resolveId(source) {
            if (source === "better-sqlite3") {
              return { id: source, external: true };
            }
            return null;
          },
        },
      ],
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
