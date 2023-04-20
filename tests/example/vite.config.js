import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoMpaHTMLPlugin from '../../index.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), autoMpaHTMLPlugin({
    entryName: "main.jsx"
  })],
  build: {
    outDir: "../dist",
    emptyOutDir: true
  },
  root: "src"
})
