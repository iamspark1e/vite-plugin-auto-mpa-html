import path from 'path'
import chokidar from 'chokidar'
import type { ViteDevServer } from 'vite'
import type { EntryPath } from './core.js'
import type { MergedPluginOption, ColoringConsole } from './types.js'
import type { FSWatcher } from 'chokidar'
import { resolveEntryTemplatePath } from './template.js'

export interface ConfigWatcher {
    stop: () => void
}

export function createConfigWatcher(
    entries: EntryPath[],
    opt: MergedPluginOption,
    server: ViteDevServer,
    _console: ColoringConsole
): ConfigWatcher {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    let watcher: FSWatcher | null = null

    // Collect all config and template files to watch
    const filesToWatch: string[] = []

    entries.forEach(entry => {
        // Add config file
        const configPath = path.join(entry.abs, entry.__options.configName)
        filesToWatch.push(configPath)

        // Add template file (if it exists and is not the default)
        // We'll add the template path even if it doesn't exist yet, so we can watch for its creation
        const templatePath = resolveEntryTemplatePath(entry)
        filesToWatch.push(templatePath)
    })

    // Remove duplicates
    const uniqueFiles = [...new Set(filesToWatch)]

    if (uniqueFiles.length === 0) {
        _console.warn('[Config Watcher] No config or template files to watch')
        return {
            stop: () => undefined
        }
    }

    _console.log(`[Config Watcher] Watching ${uniqueFiles.length} files for changes`)

    // Create debounced reload function
    const triggerReload = (filePath: string) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
            const relativePath = path.relative(server.config.root, filePath)
            _console.log(`[Config Watcher] File changed: ${relativePath}, triggering full-reload`)
            
            // Send full-reload signal to browser
            server.ws.send({ type: 'full-reload' })
            
            // Clear HandlebarsEngine cache if it exists
            if (opt.engine && 'clearCache' in opt.engine && typeof opt.engine.clearCache === 'function') {
                opt.engine.clearCache()
            }
        }, 300) // 300ms debounce
    }

    // Create chokidar watcher
    watcher = chokidar.watch(uniqueFiles, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50
        }
    })

    watcher.on('change', (filePath: string) => {
        triggerReload(filePath)
    })

    watcher.on('add', (filePath: string) => {
        triggerReload(filePath)
    })

    watcher.on('unlink', (filePath: string) => {
        const relativePath = path.relative(server.config.root, filePath)
        _console.warn(`[Config Watcher] File deleted: ${relativePath}`)
        triggerReload(filePath)
    })

    watcher.on('error', (error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        _console.error(`[Config Watcher] Error: ${message}`)
    })

    return {
        stop: () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer)
                debounceTimer = null
            }
            if (watcher) {
                watcher.close()
                watcher = null
                _console.log('[Config Watcher] Stopped watching files')
            }
        }
    }
}
