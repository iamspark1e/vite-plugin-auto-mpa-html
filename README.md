<h1 align='center'>vite-plugin-auto-mpa-html</h1>

<p align='center'>
  <a href="https://codecov.io/gh/iamspark1e/vite-plugin-auto-mpa-html" ><img src="https://codecov.io/gh/iamspark1e/vite-plugin-auto-mpa-html/branch/main/graph/badge.svg?token=xW4J4R4P7b"/></a>
  <a href="https://www.npmjs.com/package/vite-plugin-auto-mpa-html"><img src="https://img.shields.io/npm/v/vite-plugin-auto-mpa-html" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-auto-mpa-html"><img src="https://img.shields.io/npm/dm/vite-plugin-auto-mpa-html" /></a>
  <img src="https://img.shields.io/badge/Vite-%5E2.9.15%7C%5E3.2.3%7C4%7C5-brightgreen" />
</p>

<p align='center'>English | <a href="./README.zh.md">中文文档</a></p>
<br />
<p align='center'>A file directory-based automated multi-page Vite plugin that supports HTML templates using LiquidJS.</p>
<p align='center'>基于文件目录的Vite自动化多页面构建插件，支持使用 LiquidJS 的 HTML 模板。</p>
<br />

## Quick Start

```bash
npm i vite-plugin-auto-mpa-html@latest -D # Or yarn/pnpm as you like
```

Then, add plugin to your `vite.config.(js/ts)`, like this,

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoMpaHtmlPlugin from 'vite-plugin-auto-mpa-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), autoMpaHtmlPlugin({
    entryName: "main.tsx",
    sharedData: {},
    enableDevDirectory: true, // enable directory page will render an directory page at "http://localhost:5173/", if you have an index, it will not be affect.
    renderEngineOption: {}
  })],
})
```

Now, focus on your __PAGES__, for example, a project like this,

> Using the official template of `react-ts`, copied page's assets to 2 pages, the "index" and the "page2"

```
.
├── package.json
├── package-lock.json
├── public
│   └── vite.svg
├── src
│   ├── index
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── config.json
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   └── page2
│       ├── App.css
│       ├── App.tsx
│       ├── assets
│       │   └── react.svg
│       ├── config.json
│       ├── index.css
│       ├── main.tsx
│       └── vite-env.d.ts
├── templates
│   └── index.html
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

> How to generate a beautiful tree like this? Run `tree -I "node_modules|dist" > folders.txt` with tree package!

Manually create a `config.json` in the subdirectory of the page, with these content,

```json
{
    "template": "../../templates/index.html", // Using relative path from v1
    "data": {
        "title": "This is page 2",
        "description": "page 22222222",
        "keywords": "2"
    }
}
```

> We put all pages into different folders under `src`, some additional config should be put into `vite.config.js`
>
> ```javascript
> export default defineConfig({
>   root: "src",
>   base: "",
>   build: {
>     outDir: "../dist",
>     emptyOutDir: true,
>   }
> })
> ```

Finished, everything is ready, run `npm run build` to see what is built with `vite-plugin-auto-mpa-html`.

> A temporary `index.html` will be generated to every entry, just beside your entry file, such as `main.jsx` or `main.js`, PLEASE take care!

## Plugin Options

```typescript
{
  /**
   * Render a directory page in development (as the old key `enableDirectoryPage`)
   * @default true
   */
  enableDevDirectory?: boolean
  /**
   * Top-level data, which will be shared to every entry during LiquidJS render.
   * @default {}
   */
  sharedData?: object
  /**
   * Render engine options, currently using LiquidJS
   * @see {@link https://liquidjs.com/tutorials/options.html}
   * @default {}
   */
  renderEngineOption?: object
  /**
   * Entries of your multi-entry application, for example, `main.js` for Vue, and `main.jsx` for React.
   * @default "main.js"
   */
  entryName: string
  /**
   * Config file name, after v1.1.0 you can use an ESM style exported config module, .ts is not supported yet.
   * @default "config.json"
   */
  configName?: string
  /**
   * Experimental features for plugin, using at your own risk!
   */
  experimental?: {
    /**
     * Re-define template name, if you want to put the HTML to the parent folder of "entry", you can use `.html` to directly use entry path as HTML path.
     * [NOTICE] When `customTemplateName` equals ".html" (which means you want to reduce folder levels), it's NOT allowed to put entry files directly under root folder.
     */
    customTemplateName?: string
    /**
     * Config the asset name of root's entry file, default value is "_root"
     */
    rootEntryDistName?: string
  }
}
```

## Page Config Option

```typescript
{
  /**
   * The RELATIVE path of your template
   * @required
   */
  template: string
  /**
   * LiquidJS render data in this entry, which will be assigned with global `sharedData`
   * @default {}
   */
  data?: object
}
```

If you need to dynamically control the page configuration used during compilation for each page based on some external variables, you can also modify the `configName` to a ".js" file and export a default configuration in the file.

```javascript
// After v1.1.0, you can use `pageConfigGenerator` to dynamically set page config.
import { pageConfigGenerator } from 'vite-plugin-auto-mpa-html'

// pageConfigGenerator accepts direct cofig object, function, and even Promise.
export default pageConfigGenerator({
  "template": "../../template/index.html"
})
```

### Conditional page configuration

We have an option called `sharedData` cross pages, so you can inject the variables you need, then read them in page's config (or directly use in LiquidJS templates), like this,

```javascript
import { pageConfigGenerator } from 'vite-plugin-auto-mpa-html'

// `pageConfigGenerator` is not required, but it can provide TypeScript reference.
export default pageConfigGenerator((opt) => {
  console.log(opt.sharedData);
  return {
    "template": "../template/index.html",
    data: {
      isProd: opt.sharedData.isProd
    }
  }
})

// If you prefer to use JSDoc, you can also introduce types as shown below.
/** @type {import('vite-plugin-auto-mpa-html').PageConfigGeneratorTypeExport} */
/** @param {import('vite-plugin-auto-mpa-html').PageConfigOption} opt  */
```

## Limitation

- Nested folder is __SUPPORTED__ from v1, but will generate a temporary `index.html` besides your entry file.

- Env files is only supported in root folder (same level as `vite.config.js`), env-per-entry is __NOT SUPPORTED__.

- When `experimental.customTemplateName` equals ".html" (which means you want to reduce folder levels), it's NOT allowed to put entry files directly under root folder.

- Auto restart when page's config changed is not originally supported by this plugin, but you can use [vite-plugin-restart]() which is maintained by @antfu, and add config like this,

```javascript
ViteRestart({
  restart: [
    'config.[jt]s', // your configuration file name
  ]
})
```

## Vite native features

- [x] v4.2+ HTML Env Replacement

## Build Setup

```bash
# It's simple, just clone, install, and build!
git clone https://github.com/iamspark1e/vite-plugin-auto-mpa-html.git
cd vite-plugin-auto-mpa-html
npm install # or any node package manager you like
# npm run test # I'd suggest to run a fully test before commit.
npm run build
```

## Similar function plug-ins

I'm not familar with vite plugin development, so I've read some plugins' awesome code. Some ideas and my needs was added during development. There are some other plugins may solve your problems or meet your needs, I also suggest these,

- [vite-plugin-mpa](https://github.com/IndexXuan/vite-plugin-mpa)
- [vite-plugin-mp](https://github.com/zhuweiyou/vite-plugin-mp)
- [vite-plugin-mpa-plus](https://github.com/yzydeveloper/vite-plugin-mpa-plus)
- [vite-plugin-html-template-mpa](https://github.com/Miofly/vite-plugin-html-template-mpa)
- [vite-plugin-virtual-mpa](https://github.com/emosheeep/vite-plugin-virtual-mpa)
