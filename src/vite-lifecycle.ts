import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import renderEjs from "./template.js";
import type { Connect } from "vite";
import type { PluginOption, PagePluginConfig } from "./types.js";
import { IncomingMessage, ServerResponse } from "node:http";
import getEntryKV from "./entry.js";

export function prepareTempEntries(
  pluginOption: PluginOption,
  dest: string,
  entriesKV: { [key: string]: string }
) {
  if (!existsSync(dest)) mkdirSync(dest);
  const generatedKeys: string[] = [];
  Object.keys(entriesKV).forEach((k) => {
    let pageData: PagePluginConfig = {};
    const configPath = `${pluginOption.sourceDir}/${k}/${pluginOption.configName}`;
    if (existsSync(configPath)) {
      const tmp = readFileSync(configPath, { encoding: "utf-8" });
      pageData = JSON.parse(tmp);
    }
    let htmlContent = readFileSync(
      pageData.template ||
        "node_modules/vite-plugin-auto-mpa-html/assets/index.html",
      {
        encoding: "utf-8",
      }
    );
    htmlContent = renderEjs(
      htmlContent,
      {
        ...pluginOption.sharedData,
        ...pageData.data,
      },
      pluginOption.ejsOption
    );
    const generatedHtml = htmlContent.replace(
      "</html>",
      `<script type="module" src="./${pluginOption.sourceDir}/${k}/${pluginOption.entryName}"></script></html>`
    );
    // put templates in root folder temporary, cleaned in `buildEnd` lifecycle.
    generatedKeys.push(k);
    writeFileSync(path.resolve(`${k}.html`), generatedHtml, {
      encoding: "utf-8",
    });
  });
  return generatedKeys;
}

export function cleanTempEntries(pluginOption: PluginOption, keys: string[]) {
  keys.forEach((k) => {
    // generate temp entries for build
    // FIXME: nested folders?
    if (existsSync(path.resolve(`${k}.html`)))
      unlinkSync(path.resolve(`${k}.html`));
  });
}

function generatePreviewEntryPage(pluginOption: PluginOption) {
  let kvs = getEntryKV(pluginOption)
  return `<div>
    <ul>
      ${Object.keys(kvs).map(kv => {
        return `<li><a target="_blank" href="/${kv}.html">${kv}</a><li/>`
      })}
    </ul>
  </div>`
}

export function devServerMiddleware(pluginOption: PluginOption) {
  return async (
    req: Connect.IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: Connect.NextFunction
  ) => {
    const fileUrl = req.url || "";
    if (!fileUrl.endsWith(".html") && fileUrl !== "/") return next();
    if(fileUrl.endsWith("index.html")) {
      res.end(generatePreviewEntryPage(pluginOption));
      return;
    }
    const filename = path.basename(fileUrl).replace(".html", "");
    const configUrl =
      pluginOption.sourceDir + "/" + filename + "/" + pluginOption.configName;
    // render as normal when no config file detected.
    if (!existsSync(configUrl)) return next();
    const temp = readFileSync(configUrl, { encoding: "utf-8" });
    const pageConfig: PagePluginConfig = JSON.parse(temp);
    let htmlContent = readFileSync(
      pageConfig.template ||
        "node_modules/vite-plugin-auto-mpa-html/assets/index.html",
      {
        encoding: "utf-8",
      }
    );
    htmlContent = renderEjs(
      htmlContent,
      {
        ...pluginOption.sharedData,
        ...pageConfig.data,
      },
      pluginOption.ejsOption
    );
    const folderName = path.basename(fileUrl).replace(".html", "");
    const generatedHtml = htmlContent.replace(
      "</html>",
      `<script type="module" src="./${pluginOption.sourceDir}/${folderName}/${pluginOption.entryName}"></script></html>`
    );
    res.end(generatedHtml);
  };
}
