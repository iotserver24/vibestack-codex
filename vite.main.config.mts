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
    lib: {
      entry: path.resolve(__dirname, "src/main.ts"),
      formats: ["cjs"],
      fileName: () => "main.js",
    },
    rollupOptions: {
      external: [
        // Common built-ins (no prefix)
        "worker_threads","zlib","stream","events","util","fs","path","os","crypto","assert","http","https","url","querystring","child_process","readline","repl","tls","net","dgram","module","process","constants","domain","tty","v8","vm","inspector","buffer","perf_hooks","timers","console","string_decoder","punycode","sys",
        // Node: prefix built-ins
        "node:worker_threads","node:zlib","node:stream","node:events","node:util","node:fs","node:path","node:os","node:crypto","node:assert","node:http","node:https","node:url","node:querystring","node:child_process","node:readline","node:repl","node:tls","node:net","node:dgram","node:module","node:process","node:constants","node:domain","node:tty","node:v8","node:vm","node:inspector","node:buffer","node:perf_hooks","node:timers","node:console","node:string_decoder","node:punycode","node:sys",
        // fs/promises for named imports
        "fs/promises","node:fs/promises",
        // Project-specific
        "better-sqlite3", "electron", "@vercel/sdk", "dotenv", "electron-squirrel-startup", "update-electron-app", "electron-log"
      ],
    },
    outDir: ".vite/build",
    sourcemap: true,
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
