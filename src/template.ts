import {
    existsSync,
    mkdirSync,
    readFileSync,
    unlinkSync,
    writeFileSync,
} from "fs";
import path from 'path';
import ejs from "ejs";
import type { Options as EjsOptions } from "ejs";
import { isErrorOfNotFound, MergedPluginOption, PagePluginConfig } from "./types";
import { Entries, getBuildRequiredComponents } from "./core";

export const __defaultHTMLTemplate = `<!DOCTYPE html>
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

function renderEjs(
    templateStr: string,
    data?: object,
    ejsOption?: EjsOptions
): string {
    if (data)
        return ejs.render(templateStr, data, {
            ...ejsOption,
            async: false,
        });
    return templateStr;
}

export function fetchTemplateHTML(pluginOption: MergedPluginOption, pageConfig: PagePluginConfig, filename: string) {
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
            console.warn(`Page entry: ${filename}, its template cannot be found, using default template as fallback! (${e.message})`)
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
    const folderName = path.basename(filename).replace(".html", "");
    let generatedHtml = htmlContent.replace(
        "</html>",
        `<script type="module" src="${folderName}/${pluginOption.entryName}"></script></html>`
    );
    return generatedHtml
}

export function prepareTempEntries(
    rootDir: string,
    entries: Entries,
    pluginOption: MergedPluginOption,
    dest: string,
) {
    if (!existsSync(dest)) mkdirSync(dest);
    const generatedKeys: string[] = [];
    const entryComponents = getBuildRequiredComponents(rootDir, entries, pluginOption.entryName)
    entries.forEach(entry => {
        let pageData: PagePluginConfig = {};
        const configPath = entryComponents[entry].config;
        if (existsSync(configPath)) {
            const tmp = readFileSync(configPath, { encoding: "utf-8" });
            pageData = JSON.parse(tmp);
        } else {
            throw new Error(`Page entry: ${entry}, its config (config.json) cannot be found, please check!`)
        }
        let generatedHtml = fetchTemplateHTML(pluginOption, pageData, entry)
        writeFileSync(path.resolve(`${entry}/index.html`), generatedHtml, {
            encoding: "utf-8",
        });
    })
    return generatedKeys;
}

export function cleanTempEntries(
    rootDir: string,
    entries: Entries,
    pluginOption: MergedPluginOption
) {
    // `buildEnd` will be called even build failed, so a throttle is needed.
    if (!entries || entries.length === 0) return;
    const entryComponents = getBuildRequiredComponents(rootDir, entries, pluginOption.entryName)
    entries.forEach(k => {
        // generate temp entries for build
        if (existsSync(entryComponents[k].template))
            unlinkSync(entryComponents[k].template);
    });
}