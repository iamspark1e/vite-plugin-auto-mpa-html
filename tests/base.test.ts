
import { describe, it, expect, beforeAll } from "vitest";
import Entries from "../src/core";
import type { MergedPluginOption } from "../src/types";
import { HandlebarsEngine } from "../src/template-engine";

const pluginOption: MergedPluginOption = {
  entryName: "main.jsx",
  enableDevDirectory: false,
  historyApiFallback: false,
  engine: new HandlebarsEngine(),
};

describe("Test base function - generate entries", () => {
  let entries: Entries;
  beforeAll(() => {
    entries = new Entries({
      root: "tests/example/src"
    }, pluginOption)
  })

  it("should count entries correctly", () => {
    expect(entries).toSatisfy((entries: Entries) => {
      return Boolean(entries.entries.find(path => path.value === "."))
    });
  });

  it("nested folder should be captured", () => {
    expect(entries).toSatisfy((entries: Entries) => {
      return Boolean(entries.entries.find(path => path.value === "subdir"))
    });
  });
});