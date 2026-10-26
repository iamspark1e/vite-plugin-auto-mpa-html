import path from 'path'
import type { EntryPath } from './core'
import { PluginCustomizedError } from './types'

type ChunkInfo = {
    facadeModuleId: string | null;
    moduleIds: string[];
    name: string;
}

type AssetInfo = {
    originalFileName?: string | null;
    originalFileNames?: string[];
}

export type PageOutput = {
    entryFileNames: (chunkInfo: ChunkInfo) => string;
    chunkFileNames: (chunkInfo: ChunkInfo) => string;
    assetFileNames: (assetInfo: AssetInfo) => string;
}

function normalizeOutputDirectory(directory: string): string {
    const normalized = directory
        .replace(/\\/g, '/')
        .replace(/^\.\/+/, '')
        .replace(/\/+$/, '')
    if (
        normalized.length === 0
        || path.posix.isAbsolute(normalized)
        || /^[A-Za-z]:\//.test(normalized)
        || normalized.split('/').includes('..')
    ) {
        throw new PluginCustomizedError(
            `The sharedDir option must be a non-empty relative directory inside build.outDir, received "${directory}".`
        )
    }
    return normalized
}

function isPathInside(file: string, directory: string): boolean {
    const relative = path.relative(directory, file)
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

/**
 * Creates Rollup file-name functions for the page-oriented production layout.
 * A file is page-owned only when its source modules all resolve to one page.
 * Ambiguous and dependency-only files are deliberately emitted as shared files.
 */
export function createPageOutput(
    entries: EntryPath[],
    entryNames: Map<string, string>,
    sharedDirectory = 'shared',
): PageOutput {
    const sharedDir = normalizeOutputDirectory(sharedDirectory)
    // A root entry's directory contains every other page and cannot establish
    // ownership by itself. Its entry chunk is still handled by entryNames.
    const sortedEntries = entries
        .filter(entry => entry.value !== '.' && entry.value !== '')
        .sort((a, b) => b.abs.length - a.abs.length)

    const pageForFiles = (files: string[]): string | undefined => {
        const pages = new Set<string>()
        for (const file of files) {
            if (!path.isAbsolute(file)) continue
            const entry = sortedEntries.find(candidate => isPathInside(file, candidate.abs))
            if (entry) pages.add(entry.value === '.' ? '' : entry.value.replace(/\\/g, '/'))
        }
        return pages.size === 1 ? [...pages][0] : undefined
    }

    const pageAssetsDirectory = (page: string): string =>
        page ? `${page}/assets` : 'assets'

    return {
        entryFileNames(chunkInfo) {
            const page = entryNames.get(chunkInfo.name)
                ?? pageForFiles(chunkInfo.facadeModuleId ? [chunkInfo.facadeModuleId] : chunkInfo.moduleIds)
            const assetsDir = pageAssetsDirectory(page ?? '')
            const entryName = path.posix.basename(page || chunkInfo.name)
            return `${assetsDir}/${entryName}-[hash].js`
        },
        chunkFileNames(chunkInfo) {
            const page = pageForFiles(chunkInfo.moduleIds)
            return page === undefined
                ? `${sharedDir}/[name]-[hash].js`
                : `${pageAssetsDirectory(page)}/[name]-[hash].js`
        },
        assetFileNames(assetInfo) {
            const originalFiles = assetInfo.originalFileNames?.length
                ? assetInfo.originalFileNames
                : assetInfo.originalFileName
                    ? [assetInfo.originalFileName]
                    : []
            const page = pageForFiles(originalFiles)
            return page === undefined
                ? `${sharedDir}/[name]-[hash][extname]`
                : `${pageAssetsDirectory(page)}/[name]-[hash][extname]`
        },
    }
}
