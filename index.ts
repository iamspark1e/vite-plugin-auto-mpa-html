/* eslint-disable @typescript-eslint/no-unused-vars */
// import { devServerMiddleware } from './src/dev-middleware.js'
import { MergedPluginOption, defaultPluginOption, ColoringConsole } from './src/types.js'
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
    let cmd: string;
    const _console = new ColoringConsole(1)
    return {
        name: "vite:auto-mpa-html-plugin",
        enforce: "pre",
        apply(config, { command }) {
            cmd = command;
            return true;
        },
        buildStart: () => {
            if(cmd !== 'serve') prepareTempEntries(entries.entries)
        },
        buildEnd: () => {
            if(cmd !== 'serve') cleanTempEntries(entries.entries)
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
                _console.fatal("0 entry detected! Please check plugin's option in Vite config file.")
            }
            const input: { [key: string]: string } = {}
            entries.entries.forEach(entry => {
                let entryName = entry.value;
                if (entryName === "" || entryName === ".") {
                    if(opt.experimental?.customTemplateName === ".html") {
                        _console.fatal("When `customTemplateName`'s value is \".html\", it's not able to put entry files directly under root dir (To prevent pollute files outside the `dist` option). Please resolve this conflict first!")
                        return;
                    } else {
                        entryName = opt.experimental?.rootEntryDistName || "_root";
                    }
                }
                input[entryName] = entry.abs + entry.__options.templateName
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