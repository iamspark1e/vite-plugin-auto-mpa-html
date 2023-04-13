import { genDirectory } from '../src/helpers'
import { describe, test, expect } from 'vitest'
import type { PluginOption } from '../src/types'

describe('Helpers - genDirectory', () => {
    const pluginOption: PluginOption = {
        sourceDir: 'tests/fixtures/src',
        configName: 'config.json',
        entryName: "main.jsx",
        sharedData: {},
        ejsOption: {},
    }

    test('generates a valid directory', () => {
        const directory = genDirectory(pluginOption)
        expect(directory).toContain('<html')
        expect(directory).toContain('</html>')
        expect(directory).toContain('<title>Project Directory</title>')
    })

    test('generates directory with entries and titles', () => {
        const directory = genDirectory(pluginOption)
        expect(directory).toContain('<li><a target="_blank" href="/no-template.html">No template defined page</a></li>')
    })

    test('generates directory with entries and no titles', () => {
        const directory = genDirectory(pluginOption)
        expect(directory).toContain('<li><a target="_blank" href="/html-env-replacement.html">tests/fixtures/src/html-env-replacement</a></li>')
    })
})

