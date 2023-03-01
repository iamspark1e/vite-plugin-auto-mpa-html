import {
    existsSync,
    mkdirSync,
    readFileSync,
    unlinkSync,
    writeFileSync,
} from "node:fs";
import path from "node:path";
import renderEjs from "./template.js";
import type { ViteDevServer } from "vite";
import type { PluginOption, PagePluginConfig } from "./types.js";

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
        let htmlContent = readFileSync(pageData.template || "node_modules/vite-plugin-auto-mpa-html/assets/index.html", {
            encoding: "utf-8",
        });
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

export function devServerMiddleware(
    pluginOption: PluginOption,
    server: ViteDevServer
) {
    server.middlewares.use(async (req, res, next) => {
        const fileUrl = req.url || "";
        if (!fileUrl.endsWith(".html") && fileUrl !== "/") return next();
        const configUrl = path.dirname(fileUrl) + "/" + pluginOption.configName;
        const temp = readFileSync(configUrl, { encoding: "utf-8" });
        const pageConfig: PagePluginConfig = JSON.parse(temp);
        let htmlContent = readFileSync(
            pageConfig.template || "./assets/index.html",
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
    });
}
