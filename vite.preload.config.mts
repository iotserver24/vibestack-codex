import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  // Explicitly exclude vibestacks-coder directory to prevent build conflicts
  exclude: ["vibestacks-coder/**"],
});
