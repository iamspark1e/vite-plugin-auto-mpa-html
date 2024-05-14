import path from 'path'
import { MergedPluginOption, ColoringConsole } from "./types.js"
import type { Connect, ViteDevServer } from "vite";
import { IncomingMessage, ServerResponse } from "http";
import Entries, { EntryPath } from './core.js'
import { prepareSingleVirtualEntry } from "./template.js"
import { existsSync } from 'fs';

export function genDirectory(entries: Entries) {
  // const input: { [key: string]: string } = {}
  // entries.entries.forEach(entry => {
  //   input[entry.value] = entry.abs + entry.__options.templateName
  // })
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
    const _console = new ColoringConsole(1);
    let fileUrl = req.url || "";
    if (fileUrl.includes("?")) fileUrl = fileUrl.split("?")[0];
    if (!fileUrl.endsWith(".html") && fileUrl !== "/") return next();
    if (opt.enableDevDirectory && fileUrl.endsWith("/")) {
      res.setHeader("Content-Type", "text/html");
      res.end(genDirectory(entries));
      return;
    }
    let dirname: string;
    let foundedEntry: EntryPath | undefined;
    if (opt.experimental?.customTemplateName === '.html') {
      let matchedFolder = fileUrl.match(/\/(.*).html/)
      if (!matchedFolder || !matchedFolder[1]) {
        throw new Error(`Could not match the entry module (${fileUrl}) in experimental.customTemplateName mode, please check.`)
      }
      let dirname = matchedFolder[1];
      foundedEntry = entries.entries.find(entry => {
        if (entry.value === dirname) return true;
        return false;
      })
    } else {
      if (opt.experimental?.customTemplateName && !fileUrl.endsWith(opt.experimental.customTemplateName)) return next();
      dirname = path.dirname(fileUrl);
      foundedEntry = entries.entries.find(entry => {
        if ((dirname === "/" && entry.value === ".") || ("/" + entry.value === dirname)) {
          return true;
        }
        return false;
      })
    }
    if (!foundedEntry) return next();
    const configUrl = foundedEntry.abs + "/" + foundedEntry.__options.configName
    // render as normal when no config file detected.
    if (!existsSync(configUrl)) {
      // the founded entry exist but the config file cannot be found, add an alert in console
      _console.error(`[devServer] The configuration file: ${configUrl} cannot be found, please check!`);
      return next();
    }
    let generatedHtml = await prepareSingleVirtualEntry(foundedEntry, opt).catch(e => {
      console.log(e.message);
      return next();
    })
    if (!generatedHtml) return next();
    generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml);
    res.setHeader("Content-Type", "text/html");
    res.end(generatedHtml);
  };
}