import path from "path";
import {
  describe,
  expect,
  it,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import fs from "node:fs";
// Test functions
import { prepareTempEntries, cleanTempEntries } from "../src/vite-lifecycle.js";
import { PluginOption } from "../src/types.js";

const pluginOption: PluginOption = {
  sourceDir: "tests/fixtures/src",
  configName: "config.json",
  entryName: "main.jsx",
  sharedData: {},
  ejsOption: {},
};

const dest = "dist";
const entriesKV = {
  normal: "",
  "no-template": "",
  "html-env-replacement": ""
}

describe("Test plugin's lifecycle - buildStart", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("common project struct, should use user defined template", () => {
    // Do a generation
    const generatedKeys = prepareTempEntries(pluginOption, dest, entriesKV);
    expect(Array.isArray(generatedKeys)).toBe(true);
    expect(generatedKeys.length).toBe(Object.keys(entriesKV).length);
    const filePath = path.join(`normal.html`);
    const configPath = path.join(
      `${pluginOption.sourceDir}/normal/${pluginOption.configName}`
    );
    expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    expect(fileContent).toMatch("</html>"); // correctly end html doc.
    expect(fileContent).toMatch(
      `<title>Minimal React Vite Project</title>`
    ); // correctly render ejs template with given data
    expect(fileContent).toMatch(
      `<script type="module" src="./${pluginOption.sourceDir}/normal/${pluginOption.entryName}"></script>`
    ); // contain needed entry module
  });

  it("when template is not defined, should fallback to package preset `index.html`", () => {
    // Do a generation
    const generatedKeys = prepareTempEntries(pluginOption, dest, entriesKV);
    expect(Array.isArray(generatedKeys)).toBe(true);
    expect(generatedKeys.length).toBe(Object.keys(entriesKV).length);
    const filePath = path.join(`no-template.html`);
    const configPath = path.join(
      `${pluginOption.sourceDir}/no-template/${pluginOption.configName}`
    );
    let configData = fs.readFileSync(configPath, { encoding: "utf-8" });
    expect(fs.existsSync(filePath)).toBe(true); // temporary generated an entry HTML for build
    const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    expect(fileContent).toMatch("</html>"); // correctly end html doc.
    expect(fileContent).toMatch(
      `<title>${JSON.parse(configData).data.title}</title>`
    ); // correctly render ejs template with given data
    expect(fileContent).toMatch(
      `<script type="module" src="./${pluginOption.sourceDir}/no-template/${pluginOption.entryName}"></script>`
    ); // contain needed entry module
  });

  // Skip EJS Option tests
});

describe("Test plugin's lifecycle - buildEnd", () => {
  let generatedKeys: string[];
  beforeEach(() => {
    // pre generate file struct
    generatedKeys = prepareTempEntries(pluginOption, dest, entriesKV);
  });

  it("temporary entries should be cleaned after calling `cleanTempEntries`", () => {
    cleanTempEntries(pluginOption, generatedKeys);
    generatedKeys.forEach((key) => {
      expect(fs.existsSync(path.resolve(`${key}.html`))).toBe(false);
    });
  });
});
