<h1 align='center'>vite-plugin-auto-mpa-html</h1>

<p align='center'>An out-of-box solution for MPA application built with Vite.</p>
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
    configName: "config.json",
    entryName: "main.tsx",
    sharedData: {},
    sourceDir: "src",
    enableDirectoryPage: true, // enable directory page will render an directory page at "http://localhost:5173/", if you have an index, it will not be affect.
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
    "template": "templates/index.html",
    "data": {
        "title": "This is page 2",
        "description": "page 22222222",
        "keywords": "2"
    }
}
```

> `template`'s value is based on the __ROOT__ directory of __PROJECT__.

Finished, everything is ready, run `npm run build` to see what is built with `vite-plugin-auto-mpa-html`.

## Options

## Limitation

- [ ] Nested folder is __NOT SUPPORTED__ for now.

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

## Problems

- Coverage cannot run.

  Using `@vitest/coverage-c8`, shows `Cannot find package '@vitest/coverage-c8' imported from /my/code/path/to/vite-plugin-auto-mpa-html/node_modules/local-pkg/index.mjs`

  > Report for now

```
% Coverage report from c8
--------------------|---------|----------|---------|---------|----------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s    
--------------------|---------|----------|---------|---------|----------------------
All files           |   48.92 |       50 |   23.07 |   48.92 |                      
 src                |   37.82 |    33.33 |   23.07 |   37.82 |                      
  entry.ts          |   14.28 |      100 |       0 |   14.28 | 6-35                 
  helpers.ts        |      20 |      100 |       0 |      20 | 6-44,52-60           
  template.ts       |    87.5 |       50 |     100 |    87.5 | 15-16                
  vite-lifecycle.ts |   47.05 |       30 |   33.33 |   47.05 | 16-65,68-76,87-89,99 
 tests              |     100 |      100 |     100 |     100 |                      
  server.test.ts    |     100 |      100 |     100 |     100 |                      
--------------------|---------|----------|---------|---------|----------------------
```