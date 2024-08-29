import path from "path";
import pkg from 'glob';
import { UserConfig } from "vite";
import { ColoringConsole, MergedPluginOption } from "./types";
const { globSync } = pkg;

export type EntryPath = {
    value: string;
    abs: string;
    __options: EntryPathOption;
}

type EntryPathOption = {
    configName: string;
    templateName: string;
    entryName: string;
    sharedData?: object
    renderEngineOption?: object;
}

export default class Entries {
    entries: EntryPath[] = []

    configName = "config.json"
    templateName = "/index.html"
    entryName: string = "main.js"

    constructor(config: UserConfig, pluginOption: MergedPluginOption) {
        const _console = new ColoringConsole(1)
        if(pluginOption.experimental) {
            _console.warn("You are using experimental features which are not stable, features may change without migration or notification!")
        }
        if(pluginOption.experimental && pluginOption.experimental.customTemplateName) {
            this.templateName = pluginOption.experimental.customTemplateName
            if(!this.templateName.startsWith("/")) {
                _console.warn("You are putting temporary entries' parent folder which may cause unexpected file lost, using this feature at your own risk!")
            }
        }
        this.entryName = pluginOption.entryName;
        const rootDir = config.root || "";
        const globPath = `**/${this.entryName}`
        const files = globSync(globPath, {cwd: rootDir, ignore: 'node_modules/**'});
        for (let i = 0; i < files.length; i++) {
            const dirname = path.dirname(files[i]);
            const fullDirname: EntryPath = {
                value: dirname,
                abs: path.resolve(rootDir, dirname),
                __options: {
                    configName: pluginOption.configName || this.configName,
                    templateName: this.templateName,
                    entryName: this.entryName,
                    sharedData: pluginOption.sharedData,
                    renderEngineOption: pluginOption.renderEngineOption,
                }
            }
            this.entries.push(fullDirname)
        }
    }
}