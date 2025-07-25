import {
    existsSync,
    readFileSync,
    unlinkSync,
} from "fs";
import Handlebars from 'handlebars'
import { isErrorOfNotFound, PagePluginConfig, ColoringConsole, MergedPluginOption } from "./types";
import { EntryPath } from "./core";
import path from "path";
import { pathToFileURL } from "url";

const _console = new ColoringConsole(1)
const GENERATED_FLAG = "<!--This is generated by vite-plugin-auto-mpa-html.-->"

export const __defaultHTMLTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    {{#if title}}<title>{{title}}</title>{{else}}<title>Application</title>{{/if}}
    {{#if description}}<meta name="description" content="{{description}}" />{{/if}}
    {{#if keywords}}<meta name="keywords" content="{{keywords}}" />{{/if}}
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`

// function renderEjs(
//     templateStr: string,
//     data?: object,
//     ejsOption?: EjsOptions
// ): string {
//     if (data && Object.keys(data).length > 0)
//         return ejs.render(templateStr, data, {
//             ...ejsOption,
//             async: false,
//         });
//     return templateStr;
// }

function renderHandlebarsTpl(
    templateStr: string,
    data?: object,
    handlebarsOption?: {
        compileOptions?: CompileOptions,
        runtimeOptions?: Handlebars.RuntimeOptions
    }
): string {
    const tmpl = Handlebars.compile(templateStr, handlebarsOption?.compileOptions)
    return tmpl(data, handlebarsOption?.runtimeOptions)
}

export function fetchTemplateHTML(entry: EntryPath, pageConfig: PagePluginConfig) {
    let htmlContent;
    try {
        htmlContent = readFileSync(
            path.resolve(entry.abs, pageConfig.template || ""),
            {
                encoding: "utf-8",
            }
        );
    } catch (e) {
        if (!isErrorOfNotFound(e)) throw e;
        _console.error(`Page entry "${entry.abs}", its template cannot be found, using default template as fallback! (${e.message})`)
        htmlContent = __defaultHTMLTemplate
    }
    htmlContent = renderHandlebarsTpl(
        htmlContent,
        {
            ...entry.__options.sharedData,
            ...pageConfig.data,
        },
        entry.__options.renderEngineOption
    );
    const generatedHtml = GENERATED_FLAG.concat(htmlContent).replace(
        "</html>",
        // FIXME: this line of rewrite entry module script is not perfect
        `<script type="module" src="${entry.__options.templateName.startsWith("/") ? `./${entry.__options.entryName}` : `./${entry.value.includes('/') ? entry.value.split('/').reverse()[0] : entry.value}/${entry.__options.entryName}`}"></script></html>`
        // `<script type="module" src="${path.relative(root, entry.abs + '/' + entry.__options.entryName)}"></script></html>`
    );
    return generatedHtml
}

/**
 * [DEPRECATED] generate entries for `rollupOptions.build.input`
 * @param entries {Entries}
 * @param dest {string} Output dir
 */
// export async function prepareSingleEntry(entry: EntryPath, pluginOption: MergedPluginOption, shouldWriteFile = true) {
//     let pageData: PagePluginConfig = {}
//     // const configPath = entry.abs + "/" + entry.__options.configName;
//     const configPath = path.join(entry.abs, entry.__options.configName);
//     if (!existsSync(configPath)) {
//         _console.fatal(`Page entry: ${entry.value}, its config (${entry.__options.configName}) cannot be found, please check!`)
//         return;
//     }
//     if (entry.__options.configName.endsWith('.json')) {
//         const tmp = readFileSync(configPath, { encoding: "utf-8" })
//         pageData = JSON.parse(tmp)
//     } else if (entry.__options.configName.endsWith('.js')) {
//         let config = await import(pathToFileURL(configPath).toString()).catch(e => {
//             _console.fatal(e.message);
//         })
//         if(config && config.default) {
//             if(typeof config.default == "function") {
//                 pageData = await config.default(pluginOption)
//             } else {
//                 pageData = config.default
//             }
//         } else {
//             _console.fatal(`config file ${configPath} cannot be parsed and imported, maybe forgot exporting default?`)
//         }
//     } else {
//         _console.fatal(`using ${entry.__options.configName} as page config is not supported yet`)
//     }
//     const generatedHtml = fetchTemplateHTML(entry, pageData)
//     if (existsSync(entry.abs + entry.__options.templateName)) {
//         let fileContent = readFileSync(entry.abs + entry.__options.templateName, { encoding: "utf-8" });
//         if (!fileContent.startsWith(GENERATED_FLAG)) {
//             _console.warn(`There is a same named HTML file (${entry.__options.templateName}) already exist in entry '${entry.value}', template generation skipped`)
//             return;
//         }
//     }
//     if (shouldWriteFile) {
//         writeFileSync(entry.abs + entry.__options.templateName, generatedHtml, {
//             encoding: "utf-8",
//         });
//     }
//     return pageData;
// }

/**
 * generate entries for `rollupOptions.build.input`
 * @param entries {Entries}
 * @param dest {string} Output dir
 */
export async function prepareSingleVirtualEntry(entry: EntryPath, pluginOption: MergedPluginOption) {
    let pageData: PagePluginConfig = {}
    const configPath = path.join(entry.abs, entry.__options.configName);
    if (!existsSync(configPath)) {
        _console.fatal(`Page entry: ${entry.value}, its config (${entry.__options.configName}) cannot be found, please check!`)
    }
    if (entry.__options.configName.endsWith('.json')) {
        const tmp = readFileSync(configPath, { encoding: "utf-8" })
        pageData = JSON.parse(tmp)
    } else if (entry.__options.configName.endsWith('.js')) {
        const config = await import(pathToFileURL(configPath).toString()).catch(e => {
            _console.fatal(e.message);
        })
        if(config && config.default) {
            if(typeof config.default == "function") {
                pageData = await config.default(pluginOption)
            } else {
                pageData = config.default
            }
        } else {
            _console.fatal(`config file ${configPath} cannot be parsed and imported, maybe forgot exporting default?`)
        }
    } else {
        _console.fatal(`using ${entry.__options.configName} as page config is not supported yet`)
    }
    const generatedHtml = fetchTemplateHTML(entry, pageData)
    const tplPath = path.join(entry.abs, entry.__options.templateName)
    if (existsSync(tplPath)) {
        const fileContent = readFileSync(tplPath, { encoding: "utf-8" });
        if (!fileContent.startsWith(GENERATED_FLAG)) {
            _console.warn(`There is a same named HTML file (${entry.__options.templateName}) already exist in entry '${entry.value}', template generation skipped`)
            return "";
        }
    }
    return generatedHtml;
}
export async function prepareVirtualEntries(
    entries: EntryPath[],
    pluginOption: MergedPluginOption
) {
    const virtualMap = new Map<string, string>();
    await Promise.all(entries.map(async entry => {
        const tplPath = entry.__options.templateName.startsWith(".") ? (entry.abs + entry.__options.templateName) : path.join(entry.abs, entry.__options.templateName);
        const generatedHtml = await prepareSingleVirtualEntry(entry, pluginOption);
        virtualMap.set(tplPath, generatedHtml);
    }));
    return virtualMap;
}

// export function prepareVirtualTempEntries(
//     entries: EntryPath[],
// ) {
//     let virtualMap = new Map<string, string>();
//     entries.forEach(entry => {
//         let pageData: PagePluginConfig = {}
//         const configPath = entry.abs + "/" + entry.__options.configName;
//         if (existsSync(configPath)) {
//             const tmp = readFileSync(configPath, { encoding: "utf-8" })
//             pageData = JSON.parse(tmp)
//         } else {
//             _console.fatal(`Page entry: ${entry.value}, its config (config.json) cannot be found, please check!`)
//         }
//         const generatedHtml = fetchTemplateHTML(entry, pageData)
//         if (existsSync(entry.abs + entry.__options.templateName)) {
//             let fileContent = readFileSync(entry.abs + entry.__options.templateName, { encoding: "utf-8" });
//             if(!fileContent.startsWith(GENERATED_FLAG)) {
//                 _console.warn(`There is a same named HTML file (${entry.__options.templateName}) already exist in entry '${entry.value}', template generation skipped`)
//                 return;
//             }
//         }
//         // writeFileSync(entry.abs + entry.__options.templateName, generatedHtml, {
//         //     encoding: "utf-8",
//         // });
//         virtualMap.set(entry.abs + entry.__options.templateName, generatedHtml);
//     })
//     return virtualMap;
// }

export function cleanTempEntries(
    entries: EntryPath[],
) {
    // `buildEnd` will be called even build failed, so a throttle is needed.
    if (!entries || entries.length === 0) return;
    entries.forEach(k => {
        // generate temp entries for build
        const absTemplatePath = k.abs + k.__options.templateName
        if (existsSync(absTemplatePath)) {
            const tmp = readFileSync(absTemplatePath, { encoding: "utf-8" })
            if (tmp.startsWith(GENERATED_FLAG)) unlinkSync(absTemplatePath);
        }
    });
}