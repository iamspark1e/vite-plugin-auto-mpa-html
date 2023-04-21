import request from "supertest";
import connect from "connect";
import { createServer } from "vite";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { devServerMiddleware } from "../src/dev-middleware.js";
import type { MergedPluginOption } from "../src/types.js";
import path from "path";
import { Entries, getEntries } from "../src/core.js";

const pluginOption: MergedPluginOption = {
  entryName: "main.jsx",
  enableDevDirectory: true
};

describe("Test plugin's lifecycle - devServer", async () => {
  const tmp = connect();
  let entries: Entries;
  beforeAll(async () => {
    let viteServer = await createServer({
      root: path.resolve(__dirname, "example", "src"),
      server: {
        middlewareMode: true,
      },
      appType: "custom",
    });
    entries = getEntries(path.resolve(__dirname, "example"), pluginOption.entryName)
    tmp.use(viteServer.middlewares);
    tmp.use(devServerMiddleware(path.resolve(__dirname, "example"), entries, pluginOption, viteServer));
  });

  // it("devMiddleware should block HTML requests and replace with rendered", async () => {
  //   // let entryComponents = getBuildRequiredComponents(path.resolve(__dirname, "example"), entries, pluginOption.entryName)
  //   let res = await request(tmp).get("/index.css");
  //   expect(res.text).toMatch(":root{background-color:#fff}");
  //   res = await request(tmp).get("/subdir/index.html");
  //   expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  //   expect(res.text).toMatch(
  //     `<script type="module" src="./${pluginOption.entryName}"></script>`
  //   );
  // });

  it("devMiddleware should block HTML requests and replace with rendered", async () => {
    let res = await request(tmp).get("/subdir/index.html");
    console.log(res.text)
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  // it("devMiddleware should not block html if exist in public folder", async () => {
  //   let res = await request(tmp).get("/should-keep.html");
  //   expect(res.text).toMatch("<body><h1>Should be kept</h1></body>");
  // });

  afterAll(() => {
    vi.restoreAllMocks();
  });
});