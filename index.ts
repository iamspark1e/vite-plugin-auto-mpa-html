import path from 'path'
import { devServerMiddleware } from './src/dev-middleware.js'
import { getEntries, getBuildRequiredComponents } from './src/core.js'
import { defaultPluginOption } from './src/types.js'
import { cleanTempEntries, prepareTempEntries } from './src/template.js'
import type { Entries, EntriesWithComponent } from './src/core.js'
import type { PluginOption } from './src/types.js'
import type { Plugin, ResolvedConfig, UserConfig } from 'vite'

function autoMpaHTMLPlugin(pluginOption?: PluginOption): Plugin {
    let config: ResolvedConfig;
    let opt = {
        ...defaultPluginOption,
        ...(pluginOption ? pluginOption : {})
    }
    let entries: Entries = [];
    let entryComponents: EntriesWithComponent;
    return {
        name: "vite:auto-mpa-html-plugin",
        enforce: "pre",
        buildStart: () => {
            prepareTempEntries(config.root, entries, opt, path.resolve(config.root, config.build.outDir))
        },
        buildEnd: () => {
            cleanTempEntries(config.root, entries, opt)
        },
        configureServer: (server) => {
            server.middlewares.use(devServerMiddleware(config.root, entries, opt, server))
        },
        configResolved: (resolvedConfig: ResolvedConfig) => {
            config = resolvedConfig;
        },
        config: (config: UserConfig, env: { mode: string, command: string }) => {
            entries = getEntries(config.root, opt.entryName)
            if (entries.length === 0) {
                throw new Error("[vite-plugin-auto-mpa-html] Error: 0 entry detected! Please check vite:auto-mpa-html-plugin's option in Vite config file.")
            }
            entryComponents = getBuildRequiredComponents(config.root, entries, opt.entryName)
            let input: { [key: string]: string } = {}
            entries.forEach(entry => {
                input[entry] = entryComponents[entry].template
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