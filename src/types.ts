import type { Options as EjsOption } from "ejs";
export type PluginOption = {
  configName?: string; // config.js / config.json
  entryName?: string; // main.(js/ts) / index.(js/ts)
  sourceDir?: string; // scan entries under this dir
  ejsOption?: EjsOption; // see: https://github.com/mde/ejs#options
  sharedData?: object; // will be merged into every page's data
  enableDirectoryPage?: boolean;
};
export const pluginDefaultOption: PluginOption = {
  configName: "config.js",
  entryName: "main.js",
  sourceDir: "src",
};

export type PagePluginConfig = {
  template?: string;
  serverInjectMarkup?: string;
  data?: object;
};
export const pagePluginDefaultConfig = {
  template: "node_modules/vite-plugin-auto-mpa-html/assets/index.html",
  data: {
    title: "",
    description: "",
    keywords: "",
  },
};
