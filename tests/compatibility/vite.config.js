import { defineConfig } from "vite"
import autoMpaHtml from "vite-plugin-auto-mpa-html"

export default defineConfig({
  root: "src",
  plugins: [autoMpaHtml()],
  server: {
    host: "127.0.0.1",
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
})
