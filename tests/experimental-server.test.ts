import request from "supertest";
import connect from "connect";
import { createServer } from "vite";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { devServerMiddleware } from "../src/dev-middleware.js";
import type { MergedPluginOption } from "../src/types.js";
import path from "path";
import Entries from "../src/core.js";

const pluginOption: MergedPluginOption = {
  entryName: "main.jsx",
  configName: "config.json",
  enableDevDirectory: true,
  experimental: {
    customTemplateName: ".html"
  }
};

describe("Test plugin's lifecycle - devServer (experimental mode)", async () => {
  let tmp
  let entries: Entries;
  beforeAll(async () => {
    tmp = connect();
    const viteServer = await createServer({
      root: path.resolve(__dirname, "example", "src"),
      server: {
        middlewareMode: true,
      },
      appType: "custom",
      publicDir: "./public"
    });
    entries = new Entries({
      root: "tests/example/src"
    }, pluginOption)
    tmp.use(viteServer.middlewares);
    tmp.use(devServerMiddleware(entries, pluginOption, viteServer));
  });

  it("devMiddleware should bypass non-HTML requests", async () => {
    // let entryComponents = getBuildRequiredComponents(path.resolve(__dirname, "example"), entries, pluginOption.entryName)
    const res = await request(tmp).get("/index.css");
    expect(res.text).toMatch(":root{background-color:#fff}");
  });

  it("devMiddleware should block HTML requests and replace with rendered", async () => {
    const res = await request(tmp).get("/subdir.html");
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
    // expect(res.text).toMatch(
    //   `<script type="module" src="./subdir/${pluginOption.entryName}"></script>`
    // );
  });

  it("devMiddleware should not block html if exist in public folder", async () => {
    const res = await request(tmp).get("/should-keep.html");
    expect(res.text).toMatch("<body><h1>Should be kept</h1></body>");
  });

  it("devMiddleware should generate directory page", async () => {
    const res = await request(tmp).get("/");
    expect(res.text).toMatch("<title>Project Directory</title>");
  });

  afterAll(() => {
    tmp = null;
    vi.restoreAllMocks();
  });
});

// describe.todo("Test plugin's lifecycle - devServer (disabled directory page)", async () => {
//   let tmp
//   let entries: Entries;
//   beforeAll(async () => {
//     tmp = connect()
//     const viteServer = await createServer({
//       root: path.resolve(__dirname, "example", "src"),
//       server: {
//         middlewareMode: true,
//       },
//       appType: "custom",
//       publicDir: "./public"
//     });
//     entries = new Entries({
//       root: "tests/example/src"
//     }, {
//       entryName: "main.jsx",
//       enableDevDirectory: false
//     })
//     tmp.use(viteServer.middlewares);
//     tmp.use(devServerMiddleware(entries, pluginOption, viteServer));
//   });

//   it("devMiddleware should not generate directory page if plugin options set `enableDevDirectory` to false", async () => {
//     const res = await request(tmp).get("/");
//     expect(res.text).toMatch("<title>This is the rootDir of vite config</title>");
//   });

//   afterAll(() => {
//     vi.restoreAllMocks();
//   });
// });