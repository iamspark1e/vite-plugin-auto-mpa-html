import { genDirectory } from '../src/dev-middleware'
import { describe, test, expect, beforeAll, vi, afterEach } from 'vitest'
import { ColoringConsole, MergedPluginOption } from '../src/types'
import Entries from '../src/core';
import { PluginCustomizedError } from '../src/types'

describe('Helpers - genDirectory', () => {
    let entries: Entries;
    const pluginOption: MergedPluginOption = {
        entryName: "main.jsx",
        enableDevDirectory: true
    }
    beforeAll(() => {
        entries = new Entries({
            root: "tests/example/src"
        }, pluginOption)
    })

    test('generates a valid directory', () => {
        const directory = genDirectory(entries)
        expect(directory).toContain('<html')
        expect(directory).toContain('</html>')
        expect(directory).toContain('<title>Project Directory</title>')
    })

    // FIXME: how to intergrate page data with template page?
    // test('generates directory with entries and titles', () => {
    //     const directory = genDirectory(entries)
    //     expect(directory).toContain('<li><a target="_blank" href="no-template/index.html">no-template</a></li>')
    // })

    test('generates directory with entries and no titles', () => {
        const directory = genDirectory(entries)
        expect(directory).toContain('<li><a target="_blank" href="vite-feature/index.html">vite-feature</a></li>')
    })
})

describe('Helpers - PluginCustomizedError', () => {
    test('error constructor', () => {
        const exampleError = new PluginCustomizedError("Test message", 1)
        expect(exampleError.errorLevel).toBe(1)
        expect(exampleError.message).toBe("[vite-plugin-auto-mpa-html]: Test message")
        expect(exampleError.name).toBe("VitePluginAutoMpaHTMLError")
    })
})

describe('Helpers - ColorizedConsole', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    test("envErrorLevel >= 3", () => {
        const _console = new ColoringConsole(3)
        const mock = vi.spyOn(console, "log")
        _console.debug("message")
        _console.log("message")
        _console.warn("message")
        _console.error("message")
        expect(mock).toHaveBeenCalledTimes(4)
    })

    test("envErrorLevel < 0", () => {
        const _console = new ColoringConsole(-1)
        const mock = vi.spyOn(console, "log")
        _console.debug("message")
        _console.log("message")
        _console.warn("message")
        _console.error("message")
        expect(mock).toHaveBeenCalledTimes(0)
    })

    test("triggered fatal error", () => {
        const _console = new ColoringConsole(0)
        const mock = vi.spyOn(console, "log")
        try {
            _console.fatal("test error")
        } catch (e) {
            expect(e).toBeInstanceOf(PluginCustomizedError)
        }
    })
})