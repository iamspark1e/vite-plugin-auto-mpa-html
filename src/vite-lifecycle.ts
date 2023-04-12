import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import renderEjs from "./template.js";
import { ViteDevServer } from 'vite'
import type { Connect } from "vite";
import type { PluginOption, PagePluginConfig } from "./types.js";
import { IncomingMessage, ServerResponse } from "node:http";
import { genDirectory, isErrorOfNotFound } from './helpers.js'

const __defaultHTMLTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= (typeof title != 'undefined' ? title : '') %></title>
    <meta name="description" content="<%= (typeof description != 'undefined' ? description : '') %>" />
    <meta name="keywords" content="<%= (typeof keywords != 'undefined' ? keywords : '') %>" />
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`

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
    } else {
      throw new Error(`Page entry: ${pluginOption.sourceDir}/${k}, its config (${pluginOption.configName}) cannot be found, please check!`)
    }
    let htmlContent: string;
    try {
      htmlContent = readFileSync(pageData.template || '',
        {
          encoding: "utf-8",
        }
      );
    } catch (e) {
      if (isErrorOfNotFound(e)) {
        console.error(`Page entry: ${pluginOption.sourceDir}/${k}, its template (${pageData.template}) cannot be found, using default template as fallback! (${e.message})`)
        htmlContent = __defaultHTMLTemplate
      } else {
        throw e
      }
    }
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
  // `buildEnd` will be called even build failed, so a throttle is needed.
  if (!keys || keys.length === 0) return;
  keys.forEach((k) => {
    // generate temp entries for build
    // FIXME: nested folders?
    if (existsSync(path.resolve(`${k}.html`)))
      unlinkSync(path.resolve(`${k}.html`));
  });
}

export function devServerMiddleware(pluginOption: PluginOption, server: ViteDevServer) {
  return async (
    req: Connect.IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: Connect.NextFunction
  ) => {
    const fileUrl = req.url || "";
    if (!fileUrl.endsWith(".html") && fileUrl !== "/") return next();
    if (pluginOption.enableDirectoryPage && fileUrl.endsWith("/")) {
      res.end(genDirectory(pluginOption));
      return;
    }
    const filename = path.basename(fileUrl).replace(".html", "");
    const configUrl =
      pluginOption.sourceDir + "/" + filename + "/" + pluginOption.configName;
    // render as normal when no config file detected.
    if (!existsSync(configUrl)) return next();
    const temp = readFileSync(configUrl, { encoding: "utf-8" });
    const pageConfig: PagePluginConfig = JSON.parse(temp);
    let htmlContent;
    try {
      htmlContent = readFileSync(
        pageConfig.template || "",
        {
          encoding: "utf-8",
        }
      );
    } catch (e) {
      if (isErrorOfNotFound(e)) {
        console.error(`Page entry: ${pluginOption.sourceDir}/${filename}, its template cannot be found, using default template as fallback! (${e.message})`)
        htmlContent = __defaultHTMLTemplate
      } else {
        throw e
      }
    }
    htmlContent = renderEjs(
      htmlContent,
      {
        ...pluginOption.sharedData,
        ...pageConfig.data,
      },
      pluginOption.ejsOption
    );
    const folderName = path.basename(fileUrl).replace(".html", "");
    let generatedHtml = htmlContent.replace(
      "</html>",
      `<script type="module" src="./${pluginOption.sourceDir}/${folderName}/${pluginOption.entryName}"></script></html>`
    );
    generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml)
    res.end(generatedHtml);
  };
}
