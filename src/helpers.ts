import getEntryKV from "./entry"
import type { PluginOption } from "./types"

export function genDirectory(pluginOption: PluginOption) {
  let kvs = getEntryKV(pluginOption)
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maxium-scale=1.0">
    <title>Project Directory</title>
  </head>
  <body>
    <div>
      <h1>Directory:</h1>
      <ul>
        ${Object.keys(kvs).map(kv => {
          return `<li><a target="_blank" href="/${kv}.html">${kv}</a></li>`
        }).join("")}
      </ul>
    </div>
  </body>
  </html>`
}