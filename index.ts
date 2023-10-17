/* eslint-disable @typescript-eslint/no-unused-vars */
import { MergedPluginOption, defaultPluginOption, ColoringConsole } from './src/types.js'
import { cleanTempEntries, prepareTempEntries, prepareVirtualEntries } from './src/template.js'
import Entries from './src/core.js'
import type { PluginOption, PagePluginConfig } from './src/types.js'
import type { Plugin, ResolvedConfig, UserConfig } from 'vite'
import { devServerMiddleware } from './src/dev-middleware.js'
import path from 'path'

function autoMpaHTMLPlugin(pluginOption?: PluginOption): Plugin {
    let config: ResolvedConfig;
    const opt: MergedPluginOption = {
        ...defaultPluginOption,
        ...(pluginOption ? pluginOption : {})
    }
    let entries: Entries;
    let cmd: string;
    const _console = new ColoringConsole(1);
    const PREFIX = '\0virtual-auto-mpa-html:'
    let virtualMap: Map<string, string>;
    return {
        name: "vite:auto-mpa-html-plugin",
        enforce: "pre",
        apply(config, { command }) {
            cmd = command;
            return true;
        },
        resolveId: (id) => {
            return id.startsWith(PREFIX)
                /**
                 * Entry paths here must be absolute, otherwise it may cause problem on Windows. Closes #43
                 * @see https://github.com/vitejs/vite/issues/9771
                 */
                ? path.resolve(config.root, id.slice(PREFIX.length))
                : undefined;
        },
        load: (id) => {
            if (cmd !== 'serve') return virtualMap.get(id)
        },
        buildStart: async () => {
            // if (cmd !== 'serve') await prepareTempEntries(entries.entries, opt).catch(e => {
            //     _console.fatal(e.message);
            // })
            if (cmd !== 'serve') {
                virtualMap = await prepareVirtualEntries(entries.entries, opt)
            }
        },
        buildEnd: () => {
            if (cmd !== 'serve') cleanTempEntries(entries.entries)
        },
        configureServer: (server) => {
            server.middlewares.use(devServerMiddleware(entries, opt, server))
        },
        configResolved: (resolvedConfig: ResolvedConfig) => {
            config = resolvedConfig;
        },
        config: (config: UserConfig, _env: { mode: string, command: string }): UserConfig => {
            entries = new Entries(config, opt)
            if (entries.entries.length === 0) {
                _console.fatal("0 entry detected! Please check plugin's option in Vite config file.")
            }
            const input: { [key: string]: string } = {}
            entries.entries.forEach(entry => {
                let entryName = entry.value;
                if (entryName === "" || entryName === ".") {
                    if (opt.experimental?.customTemplateName === ".html") {
                        _console.fatal("When `customTemplateName`'s value is \".html\", it's not able to put entry files directly under root dir (To prevent pollute files outside the `dist` option). Please resolve this conflict first!")
                    } else {
                        entryName = opt.experimental?.rootEntryDistName || "_root";
                    }
                }
                // input[entryName] = entry.abs + entry.__options.templateName
                input[entryName] = PREFIX + entry.abs + entry.__options.templateName
            })

            let generatedConfig: UserConfig = {
                build: {
                    rollupOptions: {
                        input
                    }
                }
            }

            if (_env.command === "serve") {
                generatedConfig.optimizeDeps = {
                    entries: Object.keys(input)
                }
            }

            return generatedConfig;
        },
    }
}

type PageConfigFn = (pluginOpt: MergedPluginOption) => PagePluginConfig
type PageAsyncConfigFn = (pluginOpt: MergedPluginOption) => Promise<PagePluginConfig>
type PageConfigGeneratorTypeExport =
    PagePluginConfig |
    PageConfigFn |
    PageAsyncConfigFn
export function pageConfigGenerator(opt: PagePluginConfig): PagePluginConfig
export function pageConfigGenerator(opt: PageConfigFn): PageConfigFn
export function pageConfigGenerator(opt: PageAsyncConfigFn): PageAsyncConfigFn
export function pageConfigGenerator(opt: PageConfigGeneratorTypeExport): PageConfigGeneratorTypeExport {
    return opt
}

export default autoMpaHTMLPlugin;