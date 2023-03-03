import path from 'path';
import { describe, expect, it, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'
import mock from 'mock-fs'
import fs from 'node:fs'
// Test functions
import { prepareTempEntries, cleanTempEntries } from '../src/vite-lifecycle.js'
import { PluginOption } from '../src/types.js';
import request from 'supertest'
import connect from 'connect'
import { createServer } from 'vite';

const pluginOption: PluginOption = {
    sourceDir: "src",
    configName: "config.json",
    entryName: "main.js",
    sharedData: {},
    ejsOption: {},
};

const dest = "dist";
const entriesKV = {
    "page1": "",
    "page2": "",
};
const noTemplateDefinedProjectConstruct = {
    "node_modules/vite-plugin-auto-mpa-html/assets/index.html": mock.load(path.resolve(__dirname, '..', 'assets/index.html')),
    "src": {
        "page1": {
            "config.json": '{"data":{"title":"Page 1"}}',
            "main.js": "",
        },
        "page2": {
            "config.json": '{"data":{"title":"Page 2"}}',
            "main.js": "",
        }
    }
}
const commonProjectConstruct = {
    "node_modules": {
        "vite-plugin-auto-mpa-html/assets/index.html": mock.load(path.resolve(__dirname, '..', 'assets/index.html')),
        "vite": mock.load(path.resolve(__dirname, '..', 'node_modules/vite')),
        "@esbuild": mock.load(path.resolve(__dirname, '..', 'node_modules/@esbuild')),
    },
    "src": {
        "page1": {
            "assets": {
                "index.css": ":root{background-color:#fff}"
            },
            "config.json": '{"data":{"title":"Page 1"},"template":"templates/mobile.html"}',
            "main.js": "",
        },
        "page2": {
            "config.json": '{"data":{"title":"Page 2"},"template":"templates/index.html"}',
            "main.js": "",
        }
    },
    "templates": {
        "mobile.html": `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>templates/mobile.html</title>
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>`,
        "index.html": `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>templates/index.html</title>
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>`
    },
    "vite.config.js": `export default {{
      root: __dirname,
    }}`
}

describe("Test plugin's lifecycle - buildStart", () => {
    afterEach(() => {
        mock.restore()
        vi.restoreAllMocks()
    })

    it("common project struct, should use user defined template", () => {
        mock(commonProjectConstruct)
        // Do a generation
        const generatedKeys = prepareTempEntries(pluginOption, dest, entriesKV);
        expect(Array.isArray(generatedKeys)).toBe(true);
        expect(generatedKeys.length).toBe(Object.keys(entriesKV).length);
        generatedKeys.forEach((key) => {
            const filePath = path.join(`${key}.html`);
            const configPath = path.join(`${pluginOption.sourceDir}/${key}/${pluginOption.configName}`)
            let configData = fs.readFileSync(configPath, { encoding: 'utf-8' })
            expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
            const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
            expect(fileContent).toMatch("</html>"); // correctly end html doc.
            expect(fileContent).toMatch(`<title>${JSON.parse(configData).template}</title>`); // correctly render ejs template with given data
            expect(fileContent).toMatch(`<script type="module" src="./${pluginOption.sourceDir}/${key}/${pluginOption.entryName}"></script>`); // contain needed entry module
        });
    })

    it("when template is not defined, should fallback to package preset `index.html`", () => {
        mock(noTemplateDefinedProjectConstruct)
        // Do a generation
        const generatedKeys = prepareTempEntries(pluginOption, dest, entriesKV);
        expect(Array.isArray(generatedKeys)).toBe(true);
        expect(generatedKeys.length).toBe(Object.keys(entriesKV).length);
        generatedKeys.forEach((key) => {
            const filePath = path.join(`${key}.html`);
            const configPath = path.join(`${pluginOption.sourceDir}/${key}/${pluginOption.configName}`)
            let configData = fs.readFileSync(configPath, { encoding: 'utf-8' })
            expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
            const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
            expect(fileContent).toMatch(`<title>${JSON.parse(configData).data.title}</title>`); // correctly render ejs template with given data
        });
    })

    // Skip EJS Option tests
})

describe("Test plugin's lifecycle - buildEnd", () => {
    let generatedKeys: string[];
    beforeEach(() => {
        mock(commonProjectConstruct)
        // pre generate file struct
        generatedKeys = prepareTempEntries(pluginOption, dest, entriesKV);
    })

    it("temporary entries should be cleaned after calling `cleanTempEntries`", () => {
        cleanTempEntries(pluginOption, generatedKeys)
        generatedKeys.forEach(key => {
            expect(fs.existsSync(path.resolve(`${key}.html`))).toBe(false)
        })
    })
})
