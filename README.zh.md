<h1 align='center'>vite-plugin-auto-mpa-html</h1>

<p align='center'>
  <a href="https://codecov.io/gh/iamspark1e/vite-plugin-auto-mpa-html" ><img src="https://codecov.io/gh/iamspark1e/vite-plugin-auto-mpa-html/branch/main/graph/badge.svg?token=xW4J4R4P7b"/></a>
  <a href="https://www.npmjs.com/package/vite-plugin-auto-mpa-html"><img src="https://img.shields.io/npm/v/vite-plugin-auto-mpa-html" /></a>
  <a href="https://www.npmjs.com/package/vite-plugin-auto-mpa-html"><img src="https://img.shields.io/npm/dm/vite-plugin-auto-mpa-html" /></a>
  <img src="https://img.shields.io/badge/Vite-%5E2.9.15%7C%5E3.2.3%7C4-brightgreen" />
</p>

<p align='center'><a href="./README.md">English</a> | 中文文档</p>
<br />
<p align='center'>基于文件目录的Vite自动化多页面构建插件，支持使用 Handlebars 的 HTML 模板。</p>
<br />

## 快速使用

```bash
npm i vite-plugin-auto-mpa-html@latest -D # Or yarn/pnpm as you like
```

安装完成后，在`vite.config.(js/ts)`里加入插件，

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import autoMpaHtmlPlugin from 'vite-plugin-auto-mpa-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), autoMpaHtmlPlugin({
    entryName: "main.tsx",
    sharedData: {},
    enableDevDirectory: true, // 在dev环境下临时渲染一个目录页面
    renderEngineOption: {}
  })],
})
```

现在回到项目目录下，以下面这个项目结构为例：

> 这是一个基于官方模板生成的`react-ts`项目，index和page2是两个需要独立生成的HTML入口

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

> 上面的文件树使用了 `tree -I "node_modules|dist" > folders.txt` 命令。

在每个入口子文件夹下，创建一个 `config.json` 文件，内容可以参考下面：

```json
{
    "template": "../../templates/index.html", // 从v1版本开始，使用相对路径
    "data": {
        "title": "This is page 2",
        "description": "page 22222222",
        "keywords": "2"
    }
}
```

> 由于我们的项目文件是创建在了`src`的子文件夹下，所以`vite.config.(js/ts)`需要一些额外的配置来进行适配：
>
> ```javascript
> export default defineConfig({
>   root: "src", // 避免生成的入口目录中含有src层级
>   base: "",
>   build: {
>     outDir: "../dist", // outDir默认值是与root的相对路径，root改为子目录后，dist需要生成到根目录下，因此需要配置
>     emptyOutDir: true,
>   }
> })
> ```

完成配置，现在运行 `npm run build`，输出目录下就是使用本插件的效果了

> 提示，本插件在构建过程中会生成一个临时的`index.html`在各个入口处，请注意避免冲突！

## Plugin Options

```typescript
{
  /**
   * 当调试时，生成一个目录页来方便访问 (旧为`enableDirectoryPage`)
   * @default true
   */
  enableDevDirectory?: boolean
  /**
   * 顶层配置的共享数据，在渲染Handlebars时会添加到每个入口处。
   * @default {}
   */
  sharedData?: object
  /**
   * Handlebars的一些配置选项
   * @see {@link https://handlebarsjs.com/zh/api-reference/compilation.html}
   * @default {}
   */
  renderEngineOption?: object
  /**
   * 多页项目的每个入口文件名, 例如, Vue项目一般为`main.js`, React项目一般为`main.jsx`.
   * @default "main.js"
   */
  entryName: string
  /**
   * 配置文件名，在版本v1.1.0后，你可以使用js导出一个es module来配置页面，TS暂不支持.
   * @default "config.json"
   */
  configName?: string
  /**
   * 测试特性，键值可能会在版本更新时有改动，请注意！
   */
  experimental?: {
    /**
     * 重命名生成的HTML文件，默认为`index.html`(便于各类静态文件服务)，但是你也可以命名为其他名字。
     * *特殊的，如果你在此配置`.html`，那么HTML文件会置于入口文件的父级，并以入口文件名来命名。但是这个选项不能在你配置的root目录下生效，因为这样做生成的HTMl文件会置于outDir外，进而产生污染。
     */
    customTemplateName?: string
    /**
     * 由于根目录(vite.config.js内配置的root选项)无法自动获取入口名称，默认使用_root作为其module名，你也可以通过这个配置项来自定义。
     */
    rootEntryDistName?: string
  }
}
```

## 每个入口页面的单独配置选项

这个文件是放置在每个入口目录的`config.json`

```typescript
{
  /**
   * 本页应用模板的*相对*路径
   * @required
   */
  template: string
  /**
   * 本页Handlebars模板使用的渲染数据，会与顶层配置的sharedData进行合并
   * @default {}
   */
  data?: object
}
```

如果你需要根据一些外部变量动态控制每一页在编译时使用的页面配置，你也可以通过修改`configName`为.js文件，并在文件中导出一个默认配置

```javascript
// After v1.1.0, you can use `pageConfigGenerator` to dynamically set page config.
import { pageConfigGenerator } from 'vite-plugin-auto-mpa-html'

// pageConfigGenerator accepts direct cofig object, function, and even Promise.
export default pageConfigGenerator({
  "template": "../../template/index.html"
})
```

### 条件页面配置

借助跨页面的选项 `sharedData` ，您可以注入所需的变量，然后在页面配置中读取它们（或直接在 Handlebars 模板中使用），例如：

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

// 如果你更喜欢使用JSDoc的方式，你也可以像下面一样引入类型，这样可以不导入`pageConfigGenerator`
/** @type {import('vite-plugin-auto-mpa-html').PageConfigGeneratorTypeExport} */
/** @param {import('vite-plugin-auto-mpa-html').PageConfigOption} opt  */
```

## 局限

- 多层级的多页应用从v1版本开始支持，但构建过程需要生成临时的HTML文件，请注意是否与目录结构有冲突。

- ENV文件只支持项目根目录，每页单独的env文件 __暂无计划支持__。

- 当 `experimental.customTemplateName` 配置为 `".html"` 时，即希望根据目录名称自动生成对应名称的html文件，此时如果根目录有符合条件的入口文件，构建将会失败，以避免生成到outDir目录外，污染其他项目。

- 本插件原本不支持页面配置更改时自动重启的功能，但你可以使用由@antfu维护的vite-plugin-restart，并添加如下配置，

```javascript
ViteRestart({
  restart: [
    'config.[jt]s', // your configuration file name
  ]
})
```

- Vite v6+ 默认开启`server.preTransformRequests`，目前插件所自动产生的资源路径没有被支持，因此会产生报错如 `[vite] Pre-transform error: Failed to load url /src/main.js (resolved id: /src/main.js). Does the file exist?` 但不影响实际构建，如果对于此报错信息非常在意可以设置 `server.preTransformRequests` 为 `false`。

## Vite自身特性

- [x] 环境变量和模式(Vite v4.2+)

## 构建

```bash
git clone https://github.com/iamspark1e/vite-plugin-auto-mpa-html.git
cd vite-plugin-auto-mpa-html
npm install
# npm run test # 建议在发起合并前，先本地进行单元测试😊
npm run build
```

## 类似功能的插件

这个插件在开发出发点是由于相关需求而来的，在开发前未曾了解过Vite插件开发。在此过程中阅读了一些相关功能插件的源码，从中学习了很多我能够借鉴的想法。下面这些插件同样能够完成多页应用的构建，如果我的插件不能够满足你的需求，你可以看看下面这些优秀的Vite插件，希望能帮助到你！

- [vite-plugin-mpa](https://github.com/IndexXuan/vite-plugin-mpa)
- [vite-plugin-mp](https://github.com/zhuweiyou/vite-plugin-mp)
- [vite-plugin-mpa-plus](https://github.com/yzydeveloper/vite-plugin-mpa-plus)
- [vite-plugin-html-template-mpa](https://github.com/Miofly/vite-plugin-html-template-mpa)
- [vite-plugin-virtual-mpa](https://github.com/emosheeep/vite-plugin-virtual-mpa)