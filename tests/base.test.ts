
import { describe, it, expect } from "vitest";
import { getEntries } from "../src/core";
import type { MergedPluginOption } from "../src/types";

const pluginOption: MergedPluginOption = {
  entryName: "main.jsx",
  enableDevDirectory: false
};

describe("Test base function - getEntryKV", () => {
  it("should count entries correctly", () => {
    const data = getEntries("tests/example/src", pluginOption.entryName);
    expect(data).toContain("tests/example/src");
    
  });

  it("nested folder should be captured", () => {
    const data = getEntries("tests/example/src", pluginOption.entryName);
    expect(data).toContain("tests/example/src/subdir");
  });
});