import { describe, it, beforeEach, expect } from "vitest";
import getEntryKV from "../src/entry";
import mock from "mock-fs";
import path from "node:path";
import type { PluginOption } from "../src/types";

const pluginOption: PluginOption = {
  sourceDir: "src",
  configName: "config.json",
  entryName: "main.js",
  sharedData: {},
  ejsOption: {},
};
const commonProjectConstruct = {
  "node_modules/vite-plugin-auto-mpa-html/assets/index.html": mock.load(
    path.resolve(__dirname, "..", "assets/index.html")
  ),
  src: {
    page1: {
      assets: {
        "index.css": ":root{background-color:#fff}",
      },
      "config.json":
        '{"data":{"title":"Page 1"},"template":"templates/mobile.html"}',
      "main.js": "",
    },
    page2: {
      "config.json":
        '{"data":{"title":"Page 2"},"template":"templates/index.html"}',
      "main.js": "",
    },
  },
  templates: {
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
        </html>`,
  },
  "vite.config.js": `export default {{
      root: __dirname,
    }}`,
};

describe("Test base function - getEntryKV", () => {
  beforeEach(() => {
    mock(commonProjectConstruct);
  });

  it("should count entries correctly", () => {
    const data = getEntryKV(pluginOption);
    expect(path.relative(__dirname, data["page1"])).toBe("../page1.html"); // generated to root dir
    expect(path.relative(__dirname, data["page2"])).toBe("../page2.html");
    expect(Object.keys(data).length).toBe(2);
  });
});
