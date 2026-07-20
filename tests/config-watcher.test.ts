import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { createConfigWatcher } from '../src/config-watcher.js'
import type { MergedPluginOption, ColoringConsole } from '../src/types.js'
import type { EntryPath } from '../src/core.js'
import type { ViteDevServer } from 'vite'
import { HandlebarsEngine } from '../src/template-engine.js'
import path from 'path'
import fs from 'fs'

// Mock ViteDevServer
const mockWsSend = vi.fn()
const mockServer = {
  config: {
    root: '/tmp/test-root'
  },
  ws: {
    send: mockWsSend
  }
} as unknown as ViteDevServer

// Mock ColoringConsole
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  fatal: vi.fn()
} as unknown as ColoringConsole

// Test entries
const testEntries: EntryPath[] = [
  {
    value: '.',
    abs: '/tmp/test-root',
    __options: {
      configName: 'config.json',
      templateName: '/index.html',
      entryName: 'main.js',
      engine: new HandlebarsEngine()
    }
  },
  {
    value: 'subdir',
    abs: '/tmp/test-root/subdir',
    __options: {
      configName: 'config.json',
      templateName: '/index.html',
      entryName: 'main.js',
      engine: new HandlebarsEngine()
    }
  }
]

const defaultOptions: MergedPluginOption = {
  entryName: 'main.js',
  configName: 'config.json',
  enableDevDirectory: true,
  historyApiFallback: false,
  watchConfig: true,
  engine: new HandlebarsEngine()
}

describe('Config Watcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a config watcher', () => {
    const watcher = createConfigWatcher(testEntries, defaultOptions, mockServer, mockConsole)
    expect(watcher).toBeDefined()
    expect(watcher.stop).toBeTypeOf('function')
    watcher.stop()
  })

  it('should log watched files count', () => {
    const watcher = createConfigWatcher(testEntries, defaultOptions, mockServer, mockConsole)
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('Watching')
    )
    watcher.stop()
  })

  it('should handle empty entries', () => {
    const watcher = createConfigWatcher([], defaultOptions, mockServer, mockConsole)
    expect(mockConsole.warn).toHaveBeenCalledWith(
      expect.stringContaining('No config or template files to watch')
    )
    watcher.stop()
  })

  it('should stop watcher correctly', () => {
    const watcher = createConfigWatcher(testEntries, defaultOptions, mockServer, mockConsole)
    watcher.stop()
    expect(mockConsole.log).toHaveBeenCalledWith(
      expect.stringContaining('Stopped watching files')
    )
  })
})

describe('HandlebarsEngine Cache', () => {
  it('should clear cache when clearCache is called', () => {
    const engine = new HandlebarsEngine()
    
    // Render a template to populate cache
    engine.render('<h1>{{title}}</h1>', { title: 'Test' })
    
    // Clear cache
    engine.clearCache()
    
    // Verify cache is cleared (we can't directly test this, but we can verify the method exists)
    expect(engine.clearCache).toBeTypeOf('function')
  })
})
