import { describe, it, expect } from "vitest";
import getEntryKV from "../src/entry";
import path from "node:path";
import type { PluginOption } from "../src/types";

const pluginOption: PluginOption = {
  sourceDir: "tests/fixtures/src",
  configName: "config.json",
  entryName: "main.jsx",
  sharedData: {},
  ejsOption: {},
};

describe("Test base function - getEntryKV", () => {
  it("should count entries correctly", () => {
    const data = getEntryKV(pluginOption);
    expect(path.relative(__dirname, data["page1"])).toBe("../page1.html"); // generated to root dir
    expect(path.relative(__dirname, data["page2"])).toBe("../page2.html");
    expect(Object.keys(data).length).toBe(3);
  });
});
