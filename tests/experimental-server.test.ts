import request from "supertest";
import connect from "connect";
import { createServer } from "vite";
import { describe, expect, it, vi, beforeAll, afterAll } from "vitest";
import { devServerMiddleware } from "../src/dev-middleware.js";
import type { MergedPluginOption } from "../src/types.js";
import path from "path";
import Entries from "../src/core.js";
import { HandlebarsEngine } from "../src/template-engine.js";

const pluginOption: MergedPluginOption = {
  entryName: "main.jsx",
  configName: "config.json",
  enableDevDirectory: true,
  historyApiFallback: false,
  engine: new HandlebarsEngine(),
  experimental: {
    customTemplateName: ".html"
  }
};

describe("Test plugin's lifecycle - devServer (experimental mode)", async () => {
  let tmp: ReturnType<typeof connect>;
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
    const res = await request(tmp).get("/index.css");
    expect(res.text).toMatch(":root{background-color:#fff}");
  });

  it("devMiddleware should block HTML requests and replace with rendered", async () => {
    const res = await request(tmp).get("/subdir.html");
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should correctly handle HTML requests with search params", async () => {
    const res = await request(tmp).get("/subdir.html?n=100");
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should not block html if exist in public folder", async () => {
    const res = await request(tmp).get("/should-keep.html");
    expect(res.text).toMatch("<body><h1>Should be kept</h1></body>");
  });

  it("devMiddleware should generate directory page", async () => {
    const res = await request(tmp).get("/");
    expect(res.text).toMatch("<title>Project Directory</title>");
  });

  it("devMiddleware should handle non-existent entry in experimental mode", async () => {
    const res = await request(tmp).get("/nonexistent.html");
    expect(res.status).not.toBe(200);
  });

  it("devMiddleware should return rendered HTML for directory URL without .html suffix in experimental mode", async () => {
    const res = await request(tmp).get("/subdir");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should return rendered HTML for nested directory URL without .html suffix in experimental mode", async () => {
    const res = await request(tmp).get("/subdir/nested");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should handle URL with query parameters in experimental mode", async () => {
    const res = await request(tmp).get("/subdir?foo=bar");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should return 404 for non-existent entry when historyApiFallback is disabled in experimental mode", async () => {
    const res = await request(tmp)
      .get("/nonexistent")
      .set("Accept", "text/html");
    expect(res.status).not.toBe(200);
  });

  afterAll(() => {
    tmp = null!;
    vi.restoreAllMocks();
  });
});

describe("Test plugin's lifecycle - devServer (experimental mode with historyApiFallback)", async () => {
  let tmp: ReturnType<typeof connect>;
  let entries: Entries;
  const fallbackOption: MergedPluginOption = {
    entryName: "main.jsx",
    configName: "config.json",
    enableDevDirectory: true,
    historyApiFallback: true,
    engine: new HandlebarsEngine(),
    experimental: {
      customTemplateName: ".html"
    }
  };
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
    }, fallbackOption)
    tmp.use(viteServer.middlewares);
    tmp.use(devServerMiddleware(entries, fallbackOption, viteServer));
  });

  it("devMiddleware should fallback to nearest entry for non-existent paths with HTML accept in experimental mode", async () => {
    const res = await request(tmp)
      .get("/subdir/nonexistent-page")
      .set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should fallback to root entry for top-level non-existent paths in experimental mode", async () => {
    const res = await request(tmp)
      .get("/nonexistent-page")
      .set("Accept", "text/html");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>This is the rootDir of vite config</title>");
  });

  it("devMiddleware should fallback to nested entry for deeply nested non-existent paths in experimental mode", async () => {
    const res = await request(tmp)
      .get("/subdir/nested/deep/path")
      .set("Accept", "text/html,application/xhtml+xml");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should not fallback for non-HTML requests in experimental mode", async () => {
    const res = await request(tmp)
      .get("/subdir/nonexistent.js")
      .set("Accept", "*/*");
    expect(res.status).not.toBe(200);
  });

  it("devMiddleware should not fallback when Accept header does not include text/html in experimental mode", async () => {
    const res = await request(tmp)
      .get("/subdir/api/data")
      .set("Accept", "application/json");
    expect(res.status).not.toBe(200);
  });

  it("devMiddleware should still return direct matches when historyApiFallback is enabled in experimental mode", async () => {
    const res = await request(tmp)
      .get("/subdir")
      .set("Accept", "text/html");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  it("devMiddleware should still return .html matches when historyApiFallback is enabled in experimental mode", async () => {
    const res = await request(tmp)
      .get("/subdir.html")
      .set("Accept", "text/html");
    expect(res.status).toBe(200);
    expect(res.text).toMatch("<title>Minimal React Vite Project</title>");
  });

  afterAll(() => {
    tmp = null!;
    vi.restoreAllMocks();
  });
});

describe("Test plugin's lifecycle - devServer (experimental mode with historyApiFallback disabled)", async () => {
  let tmp: ReturnType<typeof connect>;
  let entries: Entries;
  const noFallbackOption: MergedPluginOption = {
    entryName: "main.jsx",
    configName: "config.json",
    enableDevDirectory: true,
    historyApiFallback: false,
    engine: new HandlebarsEngine(),
    experimental: {
      customTemplateName: ".html"
    }
  };
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
    }, noFallbackOption)
    tmp.use(viteServer.middlewares);
    tmp.use(devServerMiddleware(entries, noFallbackOption, viteServer));
  });

  it("devMiddleware should not fallback when historyApiFallback is disabled in experimental mode", async () => {
    const res = await request(tmp)
      .get("/subdir/nonexistent-page")
      .set("Accept", "text/html");
    expect(res.status).not.toBe(200);
  });

  afterAll(() => {
    tmp = null!;
    vi.restoreAllMocks();
  });
});
