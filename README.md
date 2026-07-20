<h1 align='center'>vite-plugin-auto-mpa-html</h1>

<p align='center'>
  <a href="https://codecov.io/gh/iamspark1e/vite-plugin-auto-mpa-html" ><img src="https://codecov.io/gh/iamspark1e/vite-plugin-auto-mpa-html/branch/main/graph/badge.svg?token=xW4J4R4P7b"/></a>
  <a href="https://www.npmjs.com/package/vite-plugin-auto-mpa-html"><img src="https://img.shields.io/npm/v/vite-plugin-auto-mpa-html" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-auto-mpa-html"><img src="https://img.shields.io/npm/dm/vite-plugin-auto-mpa-html" /></a>
  <img src="https://img.shields.io/badge/Vite-%5E2.9.15%7C%5E3.2.3%7C4%7C5-brightgreen" />
</p>

<p align='center'>English | <a href="./README.zh.md">中文文档</a></p>
<br />
<p align='center'>A file directory-based automated multi-page Vite plugin that supports HTML templates using Handlebars.</p>
<p align='center'>基于文件目录的Vite自动化多页面构建插件，支持使用 Handlebars 的 HTML 模板。</p>
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
    watchConfig: true, // automatically reload when config or template files change (default: true)
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
│   └── vite.svg
├── src
│   ├── index
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── config.json
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   └── page2
│       ├── App.css
│       ├── App.tsx
│       ├── assets
│       │   └── react.svg
│       ├── config.json
│       ├── index.css
│       ├── main.tsx
│       └── vite-env.d.ts
├── templates
│   └── index.html
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
   * Enable history API fallback for SPA routing in development.
   * When enabled, requests for non-existent paths will fallback to the nearest entry's HTML
   * if the Accept header includes "text/html".
   * @default false
   */
  historyApiFallback?: boolean
  /**
   * Watch config and template files for changes and trigger full-reload in development.
   * When enabled, changes to config.json (or other config files) and HTML templates
   * will automatically trigger a browser refresh.
   * @default true
   */
  watchConfig?: boolean
  /**
   * Top-level data, which will be shared to every entry during template render.
   * @default {}
   */
  sharedData?: object
  /**
   * Custom template engine implementation. When provided, overrides the built-in Handlebars engine.
   * Must implement the `TemplateEngine` interface:
   * `{ render(templateStr: string, data?: object, context?: TemplateRenderContext): string | Promise<string> }`
   * @default undefined (uses built-in HandlebarsEngine)
   */
  templateEngine?: TemplateEngine
  /**
   * Built-in Handlebars engine options. Handlebars is the stable default engine.
   * Ignored when `templateEngine` is provided.
   * @see {@link https://handlebarsjs.com/api-reference/compilation.html}
   * @default {}
   */
  handlebars?: {
    compileOptions?: CompileOptions
    runtimeOptions?: RuntimeOptions
    helpers?: Record<string, HelperDelegate>
    partials?: Record<string, string>
  }
  /**
   * @deprecated Use `handlebars.compileOptions` and `handlebars.runtimeOptions`.
   */
  renderEngineOption?: {
    compileOptions?: CompileOptions
    runtimeOptions?: RuntimeOptions
  }
  /**
   * Register custom Handlebars helpers. Only effective with the built-in Handlebars engine.
   * @deprecated Use `handlebars.helpers`.
   * @example { eq: (a, b) => a === b, upper: (str) => str.toUpperCase() }
   */
  handlebarsHelpers?: Record<string, HelperDelegate>
  /**
   * Register custom Handlebars partials. Only effective with the built-in Handlebars engine.
   * @deprecated Use `handlebars.partials`.
   * @example { header: '<header>{{title}}</header>', footer: '<footer>© 2024</footer>' }
   */
  handlebarsPartials?: Record<string, string>
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
   * Note: experimental options will be deprecated in the future, use top-level options instead.
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
    /**
     * @deprecated Use top-level `enableDevDirectory` instead.
     */
    enableDevDirectory?: boolean
    /**
     * @deprecated Use top-level `historyApiFallback` instead.
     */
    historyApiFallback?: boolean
  }
}
```

### Custom Template Engine

Handlebars is the stable default template engine. You can provide a custom template engine by implementing the `TemplateEngine` interface; when `templateEngine` is provided, it overrides the built-in Handlebars engine and all `handlebars`, `renderEngineOption`, `handlebarsHelpers`, and `handlebarsPartials` options are ignored.

```typescript
import autoMpaHtmlPlugin, { HandlebarsEngine } from 'vite-plugin-auto-mpa-html'
import type { TemplateEngine } from 'vite-plugin-auto-mpa-html'

// Example: using EJS as a custom engine
import ejs from 'ejs'

autoMpaHtmlPlugin({
  entryName: "main.tsx",
  templateEngine: {
    render: async (templateStr, data, context) => {
      return ejs.render(templateStr, {
        ...data,
        templatePath: context?.templatePath,
      }, { async: true })
    }
  }
})
```

The third `context` argument includes the current entry, page config, resolved plugin options, and template path:

```typescript
import type { TemplateEngine } from 'vite-plugin-auto-mpa-html'

const templateEngine: TemplateEngine = {
  async render(templateStr, data, context) {
    console.log(context?.entry.value)
    console.log(context?.pageConfig.template)
    console.log(context?.templatePath)
    return templateStr
  }
}
```

### Handlebars Helpers & Partials

Register custom helpers and partials through the preferred `handlebars` option object:

```typescript
autoMpaHtmlPlugin({
  entryName: "main.tsx",
  handlebars: {
    compileOptions: {
      noEscape: false,
    },
    runtimeOptions: {
      allowProtoPropertiesByDefault: false,
    },
    helpers: {
      eq: (a, b) => a === b,
      formatDate: (date) => new Date(date).toLocaleDateString(),
      upper: (str) => String(str).toUpperCase(),
    },
    partials: {
      header: '<header><h1>{{title}}</h1></header>',
      footer: '<footer>{{copyright}}</footer>',
    },
  },
  sharedData: {
    copyright: '2024 My Company'
  }
})
```

Then in your templates:

```html
{{> header}}
<main>{{#if (eq page "home")}}Welcome!{{/if}}</main>
<p>Published: {{formatDate publishDate}}</p>
{{> footer}}
```

The older `renderEngineOption`, `handlebarsHelpers`, and `handlebarsPartials` options still work for backward compatibility. Prefer `handlebars` for new projects; when both are provided, values from `handlebars` take precedence.

## Page Config Option

```typescript
{
  /**
   * The RELATIVE path of your template
   * @optional If not provided, a default template will be used
   */
  template?: string
  /**
   * Handlebars render data in this entry, which will be assigned with global `sharedData`
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

We have an option called `sharedData` cross pages, so you can inject the variables you need, then read them in page's config (or directly use in Handlebars templates), like this,

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

## URL Matching Behavior

The plugin supports automatic URL matching without requiring `.html` suffix:

| URL Pattern | Normal Mode | Experimental Mode (`.html`) |
|-------------|-------------|----------------------------|
| `/subdir` | Returns `subdir/index.html` | Returns `subdir.html` |
| `/subdir/nested` | Returns `subdir/nested/index.html` | Returns `subdir/nested.html` |
| `/subdir/page` (non-existent) | Falls back to `subdir/index.html` when `historyApiFallback: true` | Falls back to `subdir.html` when `historyApiFallback: true` |
| `/nonexistent` | Passes through (next()) | Passes through (next()) |

## History API Fallback

When `historyApiFallback` is enabled, the plugin will automatically fallback to the nearest parent entry's HTML for paths that don't match any entry. This is useful for SPA applications using client-side routing (e.g., React Router, Vue Router).

```javascript
autoMpaHtmlPlugin({
  entryName: "main.tsx",
  historyApiFallback: true
})
```

For example, if you have an entry at `/subdir`, accessing `/subdir/any/nested/path` will return the rendered HTML of `subdir/index.html` (or `subdir.html` in experimental mode).

## Limitation

- Nested folder is __SUPPORTED__ from v1, but will generate a temporary `index.html` besides your entry file.

- Env files is only supported in root folder (same level as `vite.config.js`), env-per-entry is __NOT SUPPORTED__.

- When `experimental.customTemplateName` equals ".html" (which means you want to reduce folder levels), it's NOT allowed to put entry files directly under root folder.

- **Config file watching**: Since v1.4.0, the plugin supports automatic full-reload when config or template files change during development. This is enabled by default via the `watchConfig` option. You can disable it by setting `watchConfig: false` in your plugin options.

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
