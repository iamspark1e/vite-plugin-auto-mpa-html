import getEntryKV from "./entry.js"
import { readFileSync } from 'node:fs'
import type { PluginOption } from "./types"

export function genDirectory(pluginOption: PluginOption) {
  let kvs = getEntryKV(pluginOption)
  let entriesWithConfig: { [key: string]: { path: string, config: { title?: string } } } = {}
  Object.keys(kvs).forEach(kv => {
    const configPath = `${pluginOption.sourceDir}/${kv}/${pluginOption.configName}`;
    let data = readFileSync(configPath, { encoding: "utf-8" })
    try {
      let dataObj = JSON.parse(data)
      entriesWithConfig[kv] = {
        path: kvs[kv],
        config: dataObj.data || {}
      }
    } catch (e) {
      entriesWithConfig[kv] = {
        path: kvs[kv],
        config: {}
      }
    }
  })
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maxium-scale=1.0">
    <title>Project Directory</title>
    <style>:root{font-size:16px;}</style>
  </head>
  <body>
    <div>
      <h1 style="font-size:20px;">Directory:</h1>
      <ul>
        ${Object.keys(entriesWithConfig).map(kv => {
    return `<li><a target="_blank" href="/${kv}.html">${entriesWithConfig[kv].config.title || `${pluginOption.sourceDir}/${kv}`}</a></li>`
  }).join("")}
      </ul>
    </div>
  </body>
  </html>`
}

type ErrorOfNotFound = {
  code: string;
  message: string;
}

export function isErrorOfNotFound(error: unknown): error is ErrorOfNotFound {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as Record<string,unknown>).code === 'string' &&
    typeof (error as Record<string,unknown>).message === 'string'
  )
}