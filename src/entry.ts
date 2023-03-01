import { globSync } from "glob";
import path from "node:path";
import type { PluginOption } from "./types.js";

function getEntry(pluginOption: PluginOption): string[] {
  const globPath = `${pluginOption.sourceDir}/*/${pluginOption.entryName}`;
  // (\/|\\\\) posix/darwin adaption
  const pathDir = pluginOption.sourceDir + "(/|\\\\)(.*?)(/|\\\\)";
  const files = globSync(globPath);
  let dirname;
  const entries = [];
  for (let i = 0; i < files.length; i++) {
    dirname = path.dirname(files[i]);
    entries.push(
      dirname
        .replace(new RegExp("^" + pathDir), "$2")
        .replace(pluginOption.sourceDir + "/", "")
    );
  }
  return entries;
}
export default function getEntryKV(pluginOption: PluginOption): {
  [key: string]: string;
} {
  const entryObj: { [key: string]: string } = {};
  getEntry(pluginOption).forEach((item: string) => {
    // FIXME: nested folder?
    entryObj[item] = path.resolve(item + ".html");
  });
  return entryObj;
}
