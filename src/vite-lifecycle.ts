import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import path from 'node:path';
import renderEjs from './template'
import { pagePluginDefaultConfig } from './types'
import type { ViteDevServer } from 'vite';
import type { PluginOption } from './types'

export function buildStart(pluginOption: PluginOption, dest: string, entriesKV: { [key: string]: string }) {
    if (!existsSync(dest)) mkdirSync(dest);
    Object.keys(entriesKV).forEach((k, _) => {
        var htmlContent = readFileSync('build/templates/mobile.html', {
            encoding: "utf-8"
        })
        var generatedHtml = htmlContent.replace("</html>", `<script type="module" src="./pages/${k}/main.js"></script></html>`)
        // put templates in root folder temporary, cleaned in `buildEnd` lifecycle.
        writeFileSync(path.resolve(`${k}.html`), generatedHtml, {
            encoding: "utf-8"
        })
    })
}

export function buildEnd(pluginOption: PluginOption, entriesKV: { [key: string]: string }) {
    Object.keys(entriesKV).forEach((k, _) => {
        if (statSync(path.resolve(`${k}.html`))) unlinkSync(path.resolve(`${k}.html`))
    })
}

export function devServerMiddleware(pluginOption: PluginOption, server: ViteDevServer) {
    server.middlewares.use(async (req, res, next) => {
        var fileUrl = req.url || "";
        if (!fileUrl.endsWith('.html') && fileUrl !== '/') return next();
        var htmlContent = readFileSync('build/templates/mobile.html', {
            encoding: "utf-8"
        })
        // TODO: render ejs with data
        var folderName = path.basename(fileUrl).replace(".html", "")
        var generatedHtml = htmlContent.replace("</html>", `<script type="module" src="./pages/${folderName}/main.js"></script></html>`)
        res.end(generatedHtml)
    })
}