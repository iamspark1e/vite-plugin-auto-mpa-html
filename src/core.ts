import path from "path";
import pkg from 'glob';
import { UserConfig } from "vite";
import { MergedPluginOption } from "./types";
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
    ejsOption?: object;
}

export default class Entries {
    entries: EntryPath[] = []

    configName = "config.json"
    templateName = "index.html"
    entryName: string

    constructor(config: UserConfig, pluginOption: MergedPluginOption) {
        this.entryName = pluginOption.entryName;
        const rootDir = config.root || "";
        const globPath = `**/${this.entryName}`
        // (\/|\\\\) posix/darwin adaption
        // const pathDir = "(/|\\\\)(.*?)(/|\\\\)";
        const files = globSync(globPath, {cwd: rootDir});
        for (let i = 0; i < files.length; i++) {
            const dirname = path.dirname(files[i]);
            const fullDirname: EntryPath = {
                value: dirname,
                abs: path.resolve(rootDir, dirname),
                __options: {
                    configName: this.configName,
                    templateName: this.templateName,
                    entryName: this.entryName,
                    sharedData: pluginOption.sharedData,
                    ejsOption: pluginOption.ejsOption,
                }
            }
            this.entries.push(fullDirname)
        }
    }
}