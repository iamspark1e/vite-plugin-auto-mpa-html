import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoMpaHTMLPlugin from '../../dist/index.js'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), autoMpaHTMLPlugin({
        sourceDir: "src",
        configName: "config.json",
        entryName: "main.jsx",
        sharedData: {},
        ejsOption: {},
    })],
})