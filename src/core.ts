import path from "path";
import pkg from 'glob';
const { globSync } = pkg;

export type Entries = string[]
export type EntriesWithComponent = { [key: string]: { template: string, config: string, entry: string } }

export function getEntries(rootDir: string = "", entryName: string) {
    const globPath = `${(rootDir.endsWith("/") ? rootDir : (rootDir + "/")) || "./"}**/${entryName}`;
    // (\/|\\\\) posix/darwin adaption
    // const pathDir = "(/|\\\\)(.*?)(/|\\\\)";
    const files = globSync(globPath);
    let dirname;
    const entries = [];
    for (let i = 0; i < files.length; i++) {
        dirname = path.dirname(files[i]);
        entries.push(dirname)
    }
    return entries;
}

export function getBuildRequiredComponents(rootDir: string = "", entries: Entries, entryName: string) {
    let kv: EntriesWithComponent = {}
    entries.forEach(entry => {
        kv[entry] = {
            template: path.resolve(rootDir, entry, "index.html"),
            config: path.resolve(rootDir, entry, "config.json"),
            entry: path.resolve(rootDir, entry, entryName)
        }
    })
    return kv;
}