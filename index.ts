import getEntryKV from './src/entry'
import { buildStart, buildEnd, devServerMiddleware } from './src/vite-lifecycle'
import type { Plugin, ResolvedConfig } from 'vite'
import { pluginDefaultOption } from './src/types'
import type { PluginOption } from './src/types'

function autoMpaHTMLPlugin(pluginOption?: PluginOption): Plugin {
    let config: ResolvedConfig;
    let entries = getEntryKV();
    return {
        name: "vite:auto-mpa-html-plugin",
        enforce: "pre",
        buildStart: () => buildStart(pluginOption || pluginDefaultOption, config?.build?.outDir || "dist", entries),
        buildEnd: () => buildEnd(pluginOption || pluginDefaultOption, entries),
        configureServer: (server) => devServerMiddleware(pluginOption || pluginDefaultOption, server),
        configResolved: function (resolvedConfig: ResolvedConfig) {
            config = resolvedConfig;
        }
    }
}

export default autoMpaHTMLPlugin;