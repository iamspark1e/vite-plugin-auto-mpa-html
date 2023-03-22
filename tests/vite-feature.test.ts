// This test is designed for Vite native features, related to HTML replacement.
import { describe, it, expect } from "vitest";
import react from '@vitejs/plugin-react'
import autoMpaHTMLPlugin from '../index.js'
import { build } from "vite";

// v4.2.0 HTML Env Replacement
describe("Vite native features", () => {
    // v4.2.0+
    it("HTML Env Replacement (v4.2.0+)", async () => {
        let data = await build({
            // root: path.resolve(__dirname, 'fixtures'),
            plugins: [react(), autoMpaHTMLPlugin({
                sourceDir: "tests/fixtures/src",
                configName: "config.json",
                entryName: "main.jsx",
                sharedData: {},
                ejsOption: {},
                enableDirectoryPage: true
            })],
            envDir: "tests/fixtures"
        })
        expect(data.hasOwnProperty("output")).toBe(true)
        expect(Array.isArray(data)).toBe(false)
        expectTypeOf(data).toBeObject()
        // @ts-ignore
        expectTypeOf(data.output).toBeArray()
        // @ts-ignore
        const featuredHtml = data.output.find(file => file.fileName === "html-env-replacement.html")
        expect(featuredHtml.source).toMatch(
            `<title>AppTitle</title>`
        ); // correctly render Vite mark with given data
    })
})