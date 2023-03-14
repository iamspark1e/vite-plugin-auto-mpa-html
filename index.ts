import getEntryKV from './src/entry.js'
import { prepareTempEntries, cleanTempEntries, devServerMiddleware } from './src/vite-lifecycle.js'
import { pluginDefaultOption } from './src/types.js'
import type { Plugin, ResolvedConfig } from 'vite'
import type { PluginOption } from './src/types.js'

function autoMpaHTMLPlugin(pluginOption?: PluginOption): Plugin {
    let config: ResolvedConfig;
    let entries = getEntryKV(pluginOption || pluginDefaultOption);
    let generatedMap: string[];
    return {
        name: "vite:auto-mpa-html-plugin",
        enforce: "pre",
        buildStart: () => {
            generatedMap = prepareTempEntries(pluginOption || pluginDefaultOption, config?.build?.outDir || "dist", entries)
        },
        buildEnd: () => {
            cleanTempEntries(pluginOption || pluginDefaultOption, generatedMap)
        },
        configureServer: (server) => {
            server.middlewares.use(devServerMiddleware(pluginOption || pluginDefaultOption))
        },
        configResolved: (resolvedConfig: ResolvedConfig) => {
            config = resolvedConfig;
        },
        config: () => {
            if(!entries || Object.keys(entries).length === 0) console.error("[vite-plugin-auto-mpa-html] Error: 0 entry detected! Please check your plugin's option (entryName) in Vite config file.")
            return {
                build: {
                    rollupOptions: {
                        input: entries
                    },
                },
                resolve: {
                    alias: {
                        "VITE_PLUGIN_AUTO_MPA_HTML": ""
                    }
                }
            }
        },
    }
}

export default autoMpaHTMLPlugin;