import path from "path";
import {
    describe,
    expect,
    it,
    beforeAll
} from "vitest";
import fs from "node:fs";
// Test functions
import { prepareTempEntries, cleanTempEntries } from "../src/template";
import { MergedPluginOption } from "../src/types.js";
import Entries from "../src/core";

const pluginOption: MergedPluginOption = {
    entryName: "main.jsx",
    enableDevDirectory: true
};

describe("Test plugin's lifecycle - buildStart", () => {
    let entries: Entries;
    beforeAll(() => {
        entries = new Entries({
            root: "tests/example/src"
        }, pluginOption)
        prepareTempEntries(entries.entries);
    })

    it("common project struct, should use user defined template", () => {
        // Do a generation
        const filePath = path.join(__dirname, "example", "src", "subdir", "index.html");
        expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
        const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
        expect(fileContent).toMatch("</html>"); // correctly end html doc.
        expect(fileContent).toMatch(
            `<title>Minimal React Vite Project</title>`
        ); // correctly render ejs template with given data
        expect(fileContent).toMatch(
            `<script type="module" src="./${pluginOption.entryName}"></script>`
        ); // contain needed entry module
    });

    it("when template is not defined, should fallback to package preset `index.html`", () => {
        // Do a generation
        const filePath = path.join(__dirname, "example", "src", "no-template", "index.html");
        const configPath = path.join(__dirname, "example", "src", "no-template", "config.json");
        const configData = fs.readFileSync(configPath, { encoding: "utf-8" });
        expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
        const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
        expect(fileContent).toMatch("</html>"); // correctly end html doc.
        expect(fileContent).toMatch(
            `<title>${JSON.parse(configData).data.title}</title>`
        ); // correctly render ejs template with given data
        expect(fileContent).toMatch(
            `<script type="module" src="./${pluginOption.entryName}"></script>`
        ); // contain needed entry module
    });

    // Skip EJS Option tests
});

describe("Test plugin's lifecycle - buildEnd", () => {
    let entries: Entries;
    beforeAll(() => {
        entries = new Entries({
            root: "tests/example/src"
        }, pluginOption)
        cleanTempEntries(entries.entries);
    })

    it("temporary entries should be cleaned after calling `cleanTempEntries`", () => {
        entries.entries.forEach((key) => {
            expect(fs.existsSync(path.resolve(key.abs + "/" + key.__options.templateName))).toBe(false);
        });
    });
});