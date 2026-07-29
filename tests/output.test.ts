import path from 'path'
import { describe, expect, it } from 'vitest'
import type { EntryPath } from '../src/core'
import { createPageOutput } from '../src/output'
import { HandlebarsEngine } from '../src/template-engine'

function entry(value: string): EntryPath {
    return {
        value,
        abs: path.resolve('/project/src', value),
        __options: {
            configName: 'config.json',
            templateName: '/index.html',
            entryName: 'main.js',
            engine: new HandlebarsEngine(),
        },
    }
}

describe('page output structure', () => {
    const entries = [entry('.'), entry('page-a'), entry('group/page-b')]
    const output = createPageOutput(
        entries,
        new Map([
            ['_root', ''],
            ['page-a', 'page-a'],
            ['group/page-b', 'group/page-b'],
        ]),
        'common',
    )

    it('puts entry chunks beside their HTML page', () => {
        expect(output.entryFileNames({
            facadeModuleId: '/project/src/page-a/index.html',
            moduleIds: [],
            name: 'page-a',
        })).toBe('page-a/assets/page-a-[hash].js')

        expect(output.entryFileNames({
            facadeModuleId: '/project/src/index.html',
            moduleIds: [],
            name: '_root',
        })).toBe('assets/_root-[hash].js')

        expect(output.entryFileNames({
            facadeModuleId: '/project/src/group/page-b/index.html',
            moduleIds: [],
            name: 'group/page-b',
        })).toBe('group/page-b/assets/page-b-[hash].js')
    })

    it('keeps page-owned chunks and source assets in the page directory', () => {
        expect(output.chunkFileNames({
            facadeModuleId: null,
            moduleIds: [
                '/project/src/page-a/lazy.ts',
                '/project/node_modules/example/index.js',
            ],
            name: 'lazy',
        })).toBe('page-a/assets/[name]-[hash].js')

        expect(output.assetFileNames({
            originalFileNames: ['/project/src/group/page-b/logo.svg'],
        })).toBe('group/page-b/assets/[name]-[hash][extname]')
    })

    it('puts ambiguous and dependency-only files in the shared directory', () => {
        expect(output.chunkFileNames({
            facadeModuleId: null,
            moduleIds: [
                '/project/src/page-a/shared.ts',
                '/project/src/group/page-b/shared.ts',
            ],
            name: 'shared',
        })).toBe('common/[name]-[hash].js')

        expect(output.chunkFileNames({
            facadeModuleId: null,
            moduleIds: ['/project/node_modules/react/index.js'],
            name: 'vendor',
        })).toBe('common/[name]-[hash].js')

        expect(output.assetFileNames({
            originalFileNames: [],
        })).toBe('common/[name]-[hash][extname]')
    })

    it('rejects a shared directory outside build.outDir', () => {
        expect(() => createPageOutput(entries, new Map(), '../shared')).toThrow(
            'sharedDir option must be a non-empty relative directory'
        )
        expect(() => createPageOutput(entries, new Map(), 'shared/..')).toThrow()
        expect(() => createPageOutput(entries, new Map(), 'C:\\shared')).toThrow()
    })
})
