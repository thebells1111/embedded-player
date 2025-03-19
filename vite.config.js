import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
      hot: true,
      emitCss: true,
    }),
  ],
  server: {
    watch: {
      usePolling: true, // Force polling
      interval: 1000, // Check for changes every 1000ms
      ignored: ["!**/node_modules/**"], // Don't ignore anything except node_modules
    },
  },
  build: {
    lib: {
      entry: "src/main.js",
      name: "SvelteComponents",
      fileName: "svelte-components",
    },
  },
});
