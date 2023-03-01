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
        configureServer: (server) => devServerMiddleware(pluginOption || pluginDefaultOption, server),
        configResolved: (resolvedConfig: ResolvedConfig) => {
            config = resolvedConfig;
        },
        config: () => {
            return {
                build: {
                    rollupOptions: {
                        input: entries
                    },
                }
            }
        }
    }
}

export default autoMpaHTMLPlugin;