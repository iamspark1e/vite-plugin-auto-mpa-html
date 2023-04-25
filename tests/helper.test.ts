import { genDirectory } from '../src/dev-middleware'
import { describe, test, expect, beforeAll } from 'vitest'
import type { MergedPluginOption } from '../src/types'
import Entries from '../src/core';

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