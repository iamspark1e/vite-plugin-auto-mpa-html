import request from "supertest";
import connect from "connect";
import { createServer } from "vite";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { devServerMiddleware } from "../src/vite-lifecycle.js";
import type { PluginOption } from "../src/types.js";
import path from "path";

const pluginOption: PluginOption = {
  sourceDir: "tests/example/src",
  configName: "config.json",
  entryName: "main.jsx",
  sharedData: {},
  ejsOption: {},
};

describe("Test plugin's lifecycle - devServer", async () => {
  const tmp = connect();
  beforeAll(() => {});

  it("devMiddleware should block HTML requests and replace with rendered", async () => {
    let viteServer = await createServer({
      root: path.resolve(__dirname, "example"),
      server: {
        middlewareMode: true,
      },
      appType: "custom",
    });

    // Debug
    // tmp.use((req, res, next) => {
    //     console.log(req.url)
    //     next()
    // })
    tmp.use(viteServer.middlewares);
    tmp.use(devServerMiddleware(pluginOption));

    let res = await request(tmp).get("/src/page1/assets/index.css");
    expect(res.text).toMatch(":root{background-color:#fff}");
    res = await request(tmp).get("/page2.html");
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
    expect(res.text).toMatch(
      `<script type="module" src="./${pluginOption.sourceDir}/page2/${pluginOption.entryName}"></script>`
    );
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });
});
