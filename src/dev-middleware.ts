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
  
  // 1. 精确匹配 .html 文件
  const htmlIndex = cleanPath.indexOf('.html');
  const hasHtmlInPath = htmlIndex !== -1;
  
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
  
  // 2. 匹配入口目录路径（模拟 nginx try_files）
  // 按路径长度排序，优先匹配更具体的路径
  const sortedEntries = [...entries.entries].sort((a, b) => b.value.length - a.value.length);
  
  for (const entry of sortedEntries) {
    const entryPath = entry.value === '.' ? '/' : '/' + entry.value;
    
    // 检查请求路径是否匹配入口路径
    // /vip-register-mobile/receipt 应该匹配 vip-register-mobile 入口
    if (cleanPath === entryPath || cleanPath.startsWith(entryPath + '/')) {
      return entry;
    }
  }
  
  // 3. 回退到根入口
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
    // const isRootRequest = fileUrl === "/";
    const hasFileExtension = /\.[a-zA-Z0-9]+$/.test(fileUrl.split('/').pop() || '');
    // const isPotentialSpaRoute = !hasFileExtension && !isRootRequest && !hasHtmlInPath;
    
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
    
    if (!foundedEntry) return next();
    
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
    
    // 判断是否需要注入 <base> 标签
    // 需要注入的情况：
    // 1. /vip-register-mobile/receipt （纯路径，无 .html）
    // 2. /vip-register-mobile.html/receipt （.html 在中间）
    // 不需要注入的情况：
    // 1. /vip-register-mobile.html （.html 在末尾，hash 模式）
    const endsWithHtml = fileUrl.endsWith('.html');
    const needsBaseTag = !endsWithHtml;
    
    if (needsBaseTag && generatedHtml.includes('<head>')) {
      const baseHref = foundedEntry.value === '.' ? '/' : `/${foundedEntry.value}/`;
      generatedHtml = generatedHtml.replace('<head>', `<head>\n    <base href="${baseHref}">`);
    }
    
    generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml);
    res.setHeader("Content-Type", "text/html");
    res.end(generatedHtml);
  };
}