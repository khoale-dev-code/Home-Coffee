import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    target: ["es2020", "safari16.4"],
    cssTarget: "safari16.4",
    chunkSizeWarningLimit: 1200,
  },
});