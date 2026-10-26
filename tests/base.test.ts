
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import Entries from "../src/core";
import type { MergedPluginOption } from "../src/types";
import { HandlebarsEngine } from "../src/template-engine";

const pluginOption: MergedPluginOption = {
  entryName: "main.jsx",
  enableDevDirectory: false,
  historyApiFallback: false,
  watchConfig: false,
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

describe("Test base function - experimental option warning", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should not warn when experimental options are empty", () => {
    const log = vi.spyOn(console, "log")

    new Entries({ root: "tests/example/src" }, {
      ...pluginOption,
      experimental: {},
    })

    expect(log).not.toHaveBeenCalled()
  })

  it("should warn when an experimental option is configured", () => {
    const log = vi.spyOn(console, "log")

    new Entries({ root: "tests/example/src" }, {
      ...pluginOption,
      experimental: {
        rootEntryDistName: "root",
      },
    })

    expect(log).toHaveBeenCalledOnce()
    expect(log).toHaveBeenCalledWith(expect.stringContaining("experimental features"))
  })
})
