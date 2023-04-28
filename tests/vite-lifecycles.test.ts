import path from "path";
import {
    describe,
    expect,
    it,
    beforeAll,
    afterAll
} from "vitest";
import fs from "node:fs";
// Test functions
import { prepareTempEntries, cleanTempEntries } from "../src/template";
import { MergedPluginOption, PluginCustomizedError } from "../src/types.js";
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

    it("when template is exist in target path, should not be overwritten", () => {
        // Do a generation
        const filePath = path.join(__dirname, "example", "src", "exist-template", "index.html");
        expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
        const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
        expect(fileContent).toMatch("</html>"); // correctly end html doc.
        expect(fileContent).toMatch(
            `<title>This is an exist HTML</title>`
        ); // correctly render ejs template with given data
    });

    // Skip EJS Option tests
    // but keep EJS render data tests
    it("when template is not given any data, template should not be processed by EJS", () => {
        // Do a generation
        const filePath = path.join(__dirname, "example", "src", "no-ejs-data", "index.html");
        expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
        const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
        expect(fileContent).toMatch("</html>"); // correctly end html doc.
        expect(fileContent).toMatch(
            `<title><%= title %></title>`
        ); // correctly render ejs template with given data
    });
});

describe("Test plugin's lifecycle - buildStart (with incorrect configuration)", () => {
    let entries = new Entries({
        root: "tests/failure/src"
    }, pluginOption)

    it("no config.json detect, will break build progress", () => {
        try {
            prepareTempEntries(entries.entries);
        } catch (e) {
            expect(e).toBeInstanceOf(PluginCustomizedError)
            expect(e.message).toBe("[vite-plugin-auto-mpa-html]: Page entry: no-config, its config (config.json) cannot be found, please check!")
        }
    })

    afterAll(() => {
        cleanTempEntries(entries.entries)
    })
})

describe("Test plugin's lifecycle - buildStart (with experimental feature)", () => {
    let entries: Entries;
    beforeAll(() => {
        entries = new Entries({
            root: "tests/example/src"
        }, {
            enableDevDirectory: false,
            entryName: "main.jsx",
            experimental: {
                customTemplateName: ".html"
            }
        })
        prepareTempEntries(entries.entries);
    })

    it("temporary entries should be generated with experimental features", () => {
        const example = entries.entries.find(key => key.value === 'subdir')
        expect(example).not.toBeUndefined()
        if (example === undefined) return;
        expect(fs.existsSync(path.resolve(example.abs + example.__options.templateName))).toBe(true);
    });
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
        const example = entries.entries.find(key => key.value === 'subdir')
        expect(example).not.toBeUndefined()
        if (example === undefined) return;
        expect(fs.existsSync(path.resolve(example.abs + example.__options.templateName))).toBe(false);
    });

    it("template is not generated by plugin, should not be cleaned", () => {
        // Do a generation
        const filePath = path.join(__dirname, "example", "src", "exist-template", "index.html");
        expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
    });
});