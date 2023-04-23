/* eslint-disable @typescript-eslint/no-unused-vars */
// import { devServerMiddleware } from './src/dev-middleware.js'
import { MergedPluginOption, defaultPluginOption } from './src/types.js'
import { cleanTempEntries, prepareTempEntries } from './src/template.js'
import Entries from './src/core.js'
import type { PluginOption } from './src/types.js'
import type { Plugin, ResolvedConfig, UserConfig } from 'vite'
import { devServerMiddleware } from './src/dev-middleware.js'

function autoMpaHTMLPlugin(pluginOption?: PluginOption): Plugin {
    let config: ResolvedConfig;
    const opt: MergedPluginOption = {
        ...defaultPluginOption,
        ...(pluginOption ? pluginOption : {})
    }
    let entries: Entries;
    return {
        name: "vite:auto-mpa-html-plugin",
        enforce: "pre",
        buildStart: () => {
            prepareTempEntries(entries.entries)
        },
        buildEnd: () => {
            cleanTempEntries(entries.entries)
        },
        configureServer: (server) => {
            server.middlewares.use(devServerMiddleware(entries, opt, server))
        },
        configResolved: (resolvedConfig: ResolvedConfig) => {
            config = resolvedConfig;
        },
        config: (config: UserConfig, _env: { mode: string, command: string }) => {
            entries = new Entries(config, opt)
            if (entries.entries.length === 0) {
                throw new Error("[vite-plugin-auto-mpa-html] Error: 0 entry detected! Please check vite:auto-mpa-html-plugin's option in Vite config file.")
            }
            const input: { [key: string]: string } = {}
            entries.entries.forEach(entry => {
                let entryName = entry.value;
                if (entryName === "") entryName = "main";
                input[entryName] = entry.abs + "/" + entry.__options.templateName
            })

            return {
                build: {
                    rollupOptions: {
                        input
                    },
                }
            }
        },
    }
}

export default autoMpaHTMLPlugin;