import path from 'path'
import { MergedPluginOption, ColoringConsole } from "./types.js"
import type { Connect, ViteDevServer } from "vite";
import { IncomingMessage, ServerResponse } from "http";
import Entries, { EntryPath } from './core.js'
import { prepareSingleVirtualEntry } from "./template.js"
import { existsSync } from 'fs';

export function genDirectory(entries: Entries) {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <title>Project Directory</title>
      <style>:root{font-size:16px;}</style>
    </head>
    <body>
      <div>
        <h1 style="font-size:20px;">Directory:</h1>
        <ul>
          ${entries.entries.map(entry => {
    return `<li><a target="_blank" href="${entry.value + entry.__options.templateName}">${entry.value}</a></li>`
  }).join("")}
        </ul>
      </div>
    </body>
    </html>`
}

// 辅助函数：查找匹配的入口
function findMatchingEntry(entries: Entries, requestPath: string, opt: MergedPluginOption): EntryPath | undefined {
  // 移除查询参数和 hash
  const cleanPath = requestPath.split('?')[0].split('#')[0];
  
  // 检查路径中是否包含 .html（可能在中间位置，用于 history 路由）
  const htmlIndex = cleanPath.indexOf('.html');
  const hasHtmlInPath = htmlIndex !== -1;
  
  // 如果路径包含 .html，提取 .html 之前的部分作为入口路径
  if (hasHtmlInPath) {
    const htmlPath = cleanPath.substring(0, htmlIndex + 5); // 包含 .html
    
    if (opt.experimental?.customTemplateName === '.html') {
      const matchedFolder = htmlPath.match(/\/(.*).html/);
      if (matchedFolder && matchedFolder[1]) {
        const dirname = matchedFolder[1];
        return entries.entries.find(entry => entry.value === dirname);
      }
    } else {
      const dirname = path.dirname(htmlPath);
      return entries.entries.find(entry => {
        return (dirname === "/" && entry.value === ".") || ("/" + entry.value === dirname);
      });
    }
  }
  
  // 对于不包含 .html 的路径，尝试找到最佳匹配的入口（用于 history 模式）
  // 按路径长度排序，优先匹配更具体的路径
  const sortedEntries = [...entries.entries].sort((a, b) => b.value.length - a.value.length);
  
  for (const entry of sortedEntries) {
    const entryPath = entry.value === '.' ? '/' : '/' + entry.value;
    
    // 检查请求路径是否以入口路径开头
    if (cleanPath === entryPath || cleanPath.startsWith(entryPath + '/')) {
      return entry;
    }
  }
  
  // 如果没有匹配，返回根入口（如果存在）
  return entries.entries.find(entry => entry.value === '.');
}

export function devServerMiddleware(entries: Entries, opt: MergedPluginOption, server: ViteDevServer) {
  return async (
    req: Connect.IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: Connect.NextFunction
  ) => {
    const _console = new ColoringConsole(1);
    let fileUrl = req.url || "";
    
    // 移除查询参数和 hash（hash 模式的路由在服务端不可见，但以防万一）
    fileUrl = fileUrl.split('?')[0].split('#')[0];
    
    // 检查是否包含 .html（可能在路径中间，用于 history 路由）
    const hasHtmlInPath = fileUrl.includes('.html');
    const isRootRequest = fileUrl === "/";
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(fileUrl.split('/').pop() || '');
    const isPotentialSpaRoute = !hasFileExtension && !isRootRequest && !hasHtmlInPath;
    
    // 如果是静态资源请求（有扩展名但不是 .html），交给下一个中间件
    if (hasFileExtension && !hasHtmlInPath) return next();
    
    // 处理目录页面
    if (opt.enableDevDirectory && fileUrl.endsWith("/")) {
      res.setHeader("Content-Type", "text/html");
      res.end(genDirectory(entries));
      return;
    }
    
    // 查找匹配的入口
    const foundedEntry = findMatchingEntry(entries, fileUrl, opt);
    
    if (!foundedEntry) {
      // 对于 SPA 路由，如果没有找到匹配的入口，尝试返回根入口
      if (isPotentialSpaRoute) {
        const rootEntry = entries.entries.find(entry => entry.value === '.');
        if (rootEntry) {
          const configUrl = rootEntry.abs + "/" + rootEntry.__options.configName;
          if (existsSync(configUrl)) {
            let generatedHtml = await prepareSingleVirtualEntry(rootEntry, opt).catch(e => {
              console.log(e.message);
              return null;
            });
            
            if (generatedHtml) {
              generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml);
              res.setHeader("Content-Type", "text/html");
              res.end(generatedHtml);
              return;
            }
          }
        }
      }
      return next();
    }
    
    const configUrl = foundedEntry.abs + "/" + foundedEntry.__options.configName;
    
    // 当没有配置文件时正常渲染
    if (!existsSync(configUrl)) {
      _console.error(`[devServer] The configuration file: ${configUrl} cannot be found, please check!`);
      return next();
    }
    
    let generatedHtml = await prepareSingleVirtualEntry(foundedEntry, opt).catch(e => {
      console.log(e.message);
      return null;
    });
    
    if (!generatedHtml) return next();
    
    // 判断是否为 history 模式：
    // - Hash 模式：路径以 .html 结尾（如 /xxx.html，服务端看不到 # 后面的内容）
    // - History 模式：路径包含 .html/ （如 /xxx.html/receipt）
    const isHistoryMode = hasHtmlInPath && !fileUrl.endsWith('.html');
    
    if (isHistoryMode && generatedHtml.includes('<head>')) {
      const baseHref = foundedEntry.value === '.' ? '/' : `/${foundedEntry.value}/`;
      generatedHtml = generatedHtml.replace('<head>', `<head>\n    <base href="${baseHref}">`);
    }
    
    generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml);
    res.setHeader("Content-Type", "text/html");
    res.end(generatedHtml);
  };
}