import path from 'path'
import { MergedPluginOption, PagePluginConfig } from "./types.js"
import type { Connect, ViteDevServer } from "vite";
import { IncomingMessage, ServerResponse } from "http";
import { Entries, getBuildRequiredComponents } from './core.js'
import { __defaultHTMLTemplate, fetchTemplateHTML } from "./template.js"
import { existsSync, readFileSync } from 'fs';

function genDirectory(rootDir: string = "", entries: string[], opt: MergedPluginOption) {
    let entryComponents = getBuildRequiredComponents(rootDir, entries, opt.entryName)
    let input: { [key: string]: string } = {}
    entries.forEach(entry => {
        input[entry] = entryComponents[entry].template
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
          ${entries.map(entry => {
        return `<li><a target="_blank" href="${path.relative("src", entry + "/index.html")}">${entryComponents[entry].template}</a></li>`
    }).join("")}
        </ul>
      </div>
    </body>
    </html>`
}

export function devServerMiddleware(rootDir: string = "", entries: Entries, pluginOption: MergedPluginOption, server: ViteDevServer) {
    return async (
        req: Connect.IncomingMessage,
        res: ServerResponse<IncomingMessage>,
        next: Connect.NextFunction
    ) => {
        const fileUrl = req.url || "";
        if (!fileUrl.endsWith("index.html") && fileUrl !== "/") return next();
        if (pluginOption.enableDevDirectory && fileUrl.endsWith("/")) {
            res.end(genDirectory(rootDir, entries, pluginOption));
            return;
        }
        const filename = path.basename(fileUrl).replace("/index.html", "");
        const configUrl = filename + "/config.json"
        // render as normal when no config file detected.
        if (!existsSync(configUrl)) return next();
        const temp = readFileSync(configUrl, { encoding: "utf-8" });
        const pageConfig: PagePluginConfig = JSON.parse(temp);
        let generatedHtml = fetchTemplateHTML(pluginOption, pageConfig, filename)
        generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml)
        res.end(generatedHtml);
    };
}