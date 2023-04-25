/* eslint-disable @typescript-eslint/ban-ts-comment */
// This test is designed for Vite native features, related to HTML replacement.
import { describe, it, expect, expectTypeOf } from "vitest";
import react from '@vitejs/plugin-react'
import autoMpaHTMLPlugin from '../index.js'
import { build } from "vite";
import path from "path";

// v4.2.0 HTML Env Replacement
describe("Vite native features", () => {
    // v4.2.0+
    it("HTML Env Replacement (v4.2.0+)", async () => {
        const data = await build({
            root: path.resolve(__dirname, 'example', 'src'),
            publicDir: path.resolve(__dirname, 'example', 'public'),
            plugins: [react(), autoMpaHTMLPlugin({
                entryName: "main.jsx",
            })],
            envDir: path.resolve(__dirname, 'example'),
            build: {
                outDir: path.resolve(__dirname, 'example', "dist")
            }
        })
        // eslint-disable-next-line no-prototype-builtins
        expect(data.hasOwnProperty("output")).toBe(true)
        expect(Array.isArray(data)).toBe(false)
        expectTypeOf(data).toBeObject()
        // @ts-ignore
        expectTypeOf(data.output).toBeArray()
        // @ts-ignore
        const featuredHtml = data.output.find(file => file.fileName === "vite-feature/index.html")
        expect(featuredHtml.source).toMatch(
            `<title>AppTitle</title>`
        ); // correctly render Vite mark with given data
    })
})