import request from "supertest";
import connect from "connect";
import { createServer } from "vite";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { devServerMiddleware } from "../src/vite-lifecycle.js";
import type { PluginOption } from "../src/types.js";
import path from "path";

const pluginOption: PluginOption = {
  sourceDir: "tests/fixtures/src",
  configName: "config.json",
  entryName: "main.jsx",
  sharedData: {},
  ejsOption: {},
};

// Q: Why not use `mock-fs` for this unit?
// A: `mock-fs` doesn't support socket file (mock-fs issue #370: https://github.com/tschaub/mock-fs/issues/370#issuecomment-1360398123)
describe("Test plugin's lifecycle - devServer", async () => {
  const tmp = connect();
  beforeAll(async () => {
    let viteServer = await createServer({
      root: path.resolve(__dirname, "fixtures"),
      server: {
        middlewareMode: true,
      },
      appType: "custom",
    });
    tmp.use(viteServer.middlewares);
    tmp.use(devServerMiddleware(pluginOption, viteServer));
  });

  it("devMiddleware should block HTML requests and replace with rendered", async () => {
    let res = await request(tmp).get("/src/normal/assets/index.css");
    expect(res.text).toMatch(":root{background-color:#fff}");
    res = await request(tmp).get("/normal.html");
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
    expect(res.text).toMatch(
      `<script type="module" src="./${pluginOption.sourceDir}/normal/${pluginOption.entryName}"></script>`
    );
  });

  it("devMiddleware should not block html if exist in public folder", async () => {
    let res = await request(tmp).get("/should-keep.html");
    expect(res.text).toMatch("<body><h1>Should be kept</h1></body>");
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
});
