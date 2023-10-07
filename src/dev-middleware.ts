import path from 'path'
import { MergedPluginOption, PagePluginConfig } from "./types.js"
import type { Connect, ViteDevServer } from "vite";
import { IncomingMessage, ServerResponse } from "http";
import Entries, { EntryPath } from './core.js'
import { fetchTemplateHTML } from "./template.js"
import { existsSync, readFileSync } from 'fs';

export function genDirectory(entries: Entries) {
  const input: { [key: string]: string } = {}
  entries.entries.forEach(entry => {
    input[entry.value] = entry.abs + entry.__options.templateName
  })
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maxium-scale=1.0">
      <title>Project Directory</title>
      <style>:root{font-size:16px;}</style>
    </head>
    <body>
      <div>
        <h1 style="font-size:20px;">Directory:</h1>
        <ul>
          ${entries.entries.map(entry => {
    return `<li><a target="_blank" href="${entry.value + entry.__options.templateName}">${entry.value}</a></li>`
  }).join("")}
        </ul>
      </div>
    </body>
    </html>`
}

export function devServerMiddleware(entries: Entries, opt: MergedPluginOption, server: ViteDevServer) {
  return async (
    req: Connect.IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: Connect.NextFunction
  ) => {
    const fileUrl = req.url || "";
    if (!fileUrl.endsWith(".html") && fileUrl !== "/") return next();
    if (opt.enableDevDirectory && fileUrl.endsWith("/")) {
      res.end(genDirectory(entries));
      return;
    }
    let dirname: string;
    let foundedEntry: EntryPath | undefined;
    if (opt.experimental?.customTemplateName === '.html') {
      let matchedFolder = fileUrl.match(/\/(.*).html/)
      if(!matchedFolder || !matchedFolder[1]) {
        throw new Error(`Could not match the entry module (${fileUrl}) in experimental.customTemplateName mode, please check.`)
      }
      let dirname = matchedFolder[1];
      foundedEntry = entries.entries.find(entry => {
        if (dirname === "/") {
          if (entry.value === ".") return true;
        } else {
          if (entry.value === dirname) return true;
        }
        return false;
      })
    } else {
      if(opt.experimental?.customTemplateName && !fileUrl.endsWith(opt.experimental.customTemplateName)) return next();
      dirname = path.dirname(fileUrl);
      foundedEntry = entries.entries.find(entry => {
        if (dirname === "/") {
          if (entry.value === ".") return true;
        } else {
          if ("/" + entry.value === dirname) return true;
        }
        return false;
      })
    }
    if (!foundedEntry) return next();
    const configUrl = foundedEntry.abs + "/" + foundedEntry.__options.configName
    // render as normal when no config file detected.
    if (!existsSync(configUrl)) return next();
    const temp = readFileSync(configUrl, { encoding: "utf-8" });
    const pageConfig: PagePluginConfig = JSON.parse(temp);
    let generatedHtml = fetchTemplateHTML(foundedEntry, pageConfig)
    generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml)
    res.end(generatedHtml);
  };
}