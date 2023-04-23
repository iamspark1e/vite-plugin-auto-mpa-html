import {
    existsSync,
    mkdirSync,
    readFileSync,
    unlinkSync,
    writeFileSync,
} from "fs";
import ejs from "ejs";
import type { Options as EjsOptions } from "ejs";
import { isErrorOfNotFound, PagePluginConfig } from "./types";
import { EntryPath } from "./core";
import path from "path";

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

export function fetchTemplateHTML(entry: EntryPath, pageConfig: PagePluginConfig) {
    let htmlContent;
    try {
        htmlContent = readFileSync(
            path.resolve(entry.abs, pageConfig.template || ""),
            {
                encoding: "utf-8",
            }
        );
    } catch (e) {
        if (isErrorOfNotFound(e)) {
            console.warn(`Page entry: ${entry.abs}, its template cannot be found, using default template as fallback! (${e.message})`)
            htmlContent = __defaultHTMLTemplate
        } else {
            throw e
        }
    }
    htmlContent = renderEjs(
        htmlContent,
        {
            ...entry.__options.sharedData,
            ...pageConfig.data,
        },
        entry.__options.ejsOption
    );
    const generatedHtml = htmlContent.replace(
        "</html>",
        `<script type="module" src="./${entry.__options.entryName}"></script></html>`
    );
    return generatedHtml
}

/**
 * generate entries for `rollupOptions.build.input`
 * @param entries {Entries}
 * @param dest {string} Output dir
 */
export function prepareTempEntries(
    entries: EntryPath[],
    dest: string,
) {
    if (!existsSync(dest)) mkdirSync(dest);
    entries.forEach(entry => {
        let pageData: PagePluginConfig = {}
        const configPath = entry.abs + "/" + entry.__options.configName;
        if (existsSync(configPath)) {
            const tmp = readFileSync(configPath, { encoding: "utf-8" })
            pageData = JSON.parse(tmp)
        } else {
            throw new Error(`Page entry: ${entry.abs}, its config (config.json) cannot be found, please check!`)
        }
        const generatedHtml = fetchTemplateHTML(entry, pageData)
        writeFileSync(entry.abs + "/" + entry.__options.templateName, generatedHtml, {
            encoding: "utf-8",
        });
    })
}

export function cleanTempEntries(
    entries: EntryPath[],
) {
    // `buildEnd` will be called even build failed, so a throttle is needed.
    if (!entries || entries.length === 0) return;
    entries.forEach(k => {
        // generate temp entries for build
        const absTemplatePath = k.abs + "/" + k.__options.templateName
        if (existsSync(absTemplatePath))
            unlinkSync(absTemplatePath);
    });
}