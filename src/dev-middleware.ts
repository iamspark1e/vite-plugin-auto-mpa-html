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
    const templateName = entry.__options.templateName;
    return `<li><a target="_blank" href="${entry.value === '.' ? templateName : entry.value + templateName}">${entry.value}</a></li>`
  }).join("")}
        </ul>
      </div>
    </body>
    </html>`
}

/**
 * Find an entry that matches the given URL path
 * @param url - The URL path (e.g., "/subdir", "/subdir/nested")
 * @param entries - All discovered entries
 * @param opt - Plugin options
 * @returns The matching entry or undefined
 */
function findEntryByUrl(url: string, entries: Entries, opt: MergedPluginOption): EntryPath | undefined {
  if (opt.experimental?.customTemplateName === '.html') {
    // Experimental mode: URL like "/subdir" should match entry with value "subdir"
    const urlPath = url.startsWith('/') ? url.slice(1) : url;
    return entries.entries.find(entry => entry.value === urlPath);
  } else {
    // Normal mode: URL like "/subdir" should match entry with value "subdir"
    // URL like "/" should match entry with value "."
    if (url === "/") {
      return entries.entries.find(entry => entry.value === ".");
    }
    const urlPath = url.startsWith('/') ? url : '/' + url;
    return entries.entries.find(entry => '/' + entry.value === urlPath);
  }
}

/**
 * Find the nearest parent entry for history API fallback
 * For example, if URL is "/subdir/page", it should fallback to entry "subdir"
 * @param url - The URL path
 * @param entries - All discovered entries
 * @param opt - Plugin options
 * @returns The nearest matching entry or undefined
 */
function findNearestEntry(url: string, entries: Entries, opt: MergedPluginOption): EntryPath | undefined {
  if (opt.experimental?.customTemplateName === '.html') {
    // Experimental mode: find the longest matching prefix
    const urlPath = url.startsWith('/') ? url.slice(1) : url;
    const parts = urlPath.split('/');
    
    // Try progressively shorter paths
    for (let i = parts.length; i > 0; i--) {
      const candidatePath = parts.slice(0, i).join('/');
      const found = entries.entries.find(entry => entry.value === candidatePath);
      if (found) return found;
    }
    
    // Try root entry
    return entries.entries.find(entry => entry.value === ".");
  } else {
    // Normal mode: find the longest matching prefix
    const urlPath = url.startsWith('/') ? url : '/' + url;
    const parts = urlPath.split('/').filter(Boolean);
    
    // Try progressively shorter paths
    for (let i = parts.length; i > 0; i--) {
      const candidatePath = '/' + parts.slice(0, i).join('/');
      const found = entries.entries.find(entry => '/' + entry.value === candidatePath);
      if (found) return found;
    }
    
    // Try root entry
    return entries.entries.find(entry => entry.value === ".");
  }
}

/**
 * Render an entry and send the response
 */
async function renderEntry(
  entry: EntryPath,
  req: Connect.IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  server: ViteDevServer,
  opt: MergedPluginOption,
  _console: ColoringConsole
): Promise<boolean> {
  const configUrl = path.join(entry.abs, entry.__options.configName);
  
  // Check if config file exists
  if (!existsSync(configUrl)) {
    _console.error(`[devServer] The configuration file: ${configUrl} cannot be found, please check!`);
    return false;
  }
  
  let generatedHtml = await prepareSingleVirtualEntry(entry, opt).catch(e => {
    console.log(e.message);
    return undefined;
  });
  
  if (!generatedHtml) return false;
  
  generatedHtml = await server.transformIndexHtml(req.url || "", generatedHtml);
  res.setHeader("Content-Type", "text/html");
  res.end(generatedHtml);
  return true;
}

export function devServerMiddleware(entries: Entries, opt: MergedPluginOption, server: ViteDevServer) {
  return async (
    req: Connect.IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    next: Connect.NextFunction
  ) => {
    const _console = new ColoringConsole(1);
    let fileUrl = req.url || "";
    if (fileUrl.includes("?")) fileUrl = fileUrl.split("?")[0];
    
    // Skip non-HTML requests (static assets like .js, .css, .svg, etc.)
    // Allow "/" for directory listing and all other paths for entry matching
    const ext = path.extname(fileUrl);
    if (ext && ext !== '.html') return next();
    
    // Handle root path with enableDevDirectory option
    if (opt.enableDevDirectory && fileUrl === "/") {
      const rootEntry = entries.entries.find(entry => entry.value === ".");
      if (rootEntry) {
        const rootIndexHtml = path.join(rootEntry.abs, "index.html");
        if (!existsSync(rootIndexHtml)) {
          // No root index.html, show directory listing
          res.setHeader("Content-Type", "text/html");
          res.end(genDirectory(entries));
          return;
        }
        // Root has index.html, let it be handled by the entry matching logic below
      } else {
        // No root entry, show directory listing
        res.setHeader("Content-Type", "text/html");
        res.end(genDirectory(entries));
        return;
      }
    }
    
    // Handle .html requests (existing logic)
    if (fileUrl.endsWith(".html")) {
      let foundedEntry: EntryPath | undefined;
      
      if (opt.experimental?.customTemplateName === '.html') {
        const matchedFolder = fileUrl.match(/\/(.*).html/);
        if (!matchedFolder || !matchedFolder[1]) {
          throw new Error(`Could not match the entry module (${fileUrl}) in experimental.customTemplateName mode, please check.`);
        }
        const dirname = matchedFolder[1];
        foundedEntry = entries.entries.find(entry => entry.value === dirname);
      } else {
        if (opt.experimental?.customTemplateName && !fileUrl.endsWith(opt.experimental.customTemplateName)) return next();
        const dirname = path.dirname(fileUrl);
        foundedEntry = entries.entries.find(entry => {
          if ((dirname === "/" && entry.value === ".") || ("/" + entry.value === dirname)) {
            return true;
          }
          return false;
        });
      }
      
      if (!foundedEntry) return next();
      
      const rendered = await renderEntry(foundedEntry, req, res, server, opt, _console);
      if (!rendered) return next();
      return;
    }
    
    // Handle non-.html requests (new logic)
    // Try to find a matching entry for the URL
    const matchedEntry = findEntryByUrl(fileUrl, entries, opt);
    if (matchedEntry) {
      const rendered = await renderEntry(matchedEntry, req, res, server, opt, _console);
      if (rendered) return;
    }
    
    // If no direct match and historyApiFallback is enabled, try fallback
    if (opt.historyApiFallback) {
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('text/html')) {
        const nearestEntry = findNearestEntry(fileUrl, entries, opt);
        if (nearestEntry) {
          const rendered = await renderEntry(nearestEntry, req, res, server, opt, _console);
          if (rendered) return;
        }
      }
    }
    
    return next();
  };
}
