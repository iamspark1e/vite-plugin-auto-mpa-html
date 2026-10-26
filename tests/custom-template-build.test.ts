import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { build } from 'vite'
import autoMpaHTMLPlugin from '../index.js'

describe('customTemplateName ".html" production build', () => {
    const projectDir = path.join(tmpdir(), 'auto-mpa-flat-html-test')
    const rootDir = path.join(projectDir, 'src')
    const pageDir = path.join(rootDir, 'account-recovery')
    const outDir = path.join(projectDir, 'dist')

    beforeAll(async () => {
        rmSync(projectDir, { recursive: true, force: true })
        mkdirSync(pageDir, { recursive: true })
        writeFileSync(path.join(pageDir, 'main.js'), 'document.body.textContent = "account recovery"')
        writeFileSync(path.join(pageDir, 'config.json'), '{}')

        await build({
            root: rootDir,
            publicDir: false,
            plugins: [
                autoMpaHTMLPlugin({
                    entryName: 'main.js',
                    experimental: {
                        customTemplateName: '.html',
                    },
                    outputStructure: 'page',
                    sharedDir: 'shared',
                }),
            ],
            build: {
                outDir,
                emptyOutDir: true,
            },
        })
    })

    afterAll(() => {
        rmSync(projectDir, { recursive: true, force: true })
    })

    it('emits a flat HTML file with a resolvable page entry', () => {
        expect(existsSync(path.join(outDir, 'account-recovery.html'))).toBe(true)
        expect(existsSync(path.join(outDir, 'account-recovery', 'assets'))).toBe(true)
        expect(existsSync(path.join(outDir, 'account-recovery', '.html'))).toBe(false)
    })
})
