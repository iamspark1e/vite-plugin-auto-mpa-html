import { describe, it, expect } from 'vitest'
import { HandlebarsEngine } from '../src/template-engine'
import type { TemplateEngine, TemplateRenderContext } from '../src/template-engine'
import { __defaultHTMLTemplate, prepareSingleVirtualEntry } from '../src/template'
import Entries from '../src/core'
import type { MergedPluginOption } from '../src/types'
import autoMpaHTMLPlugin from '../index'
import path from 'path'

describe('HandlebarsEngine - basic rendering', () => {
    it('should render a simple template with data', () => {
        const engine = new HandlebarsEngine()
        const result = engine.render('<h1>{{title}}</h1>', { title: 'Hello' })
        expect(result).toBe('<h1>Hello</h1>')
    })

    it('should render template without data', () => {
        const engine = new HandlebarsEngine()
        const result = engine.render('<h1>Static Content</h1>')
        expect(result).toBe('<h1>Static Content</h1>')
    })

    it('should render with empty data object', () => {
        const engine = new HandlebarsEngine()
        const result = engine.render('<h1>{{title}}</h1>', {})
        expect(result).toBe('<h1></h1>')
    })

    it('should handle conditional blocks', () => {
        const engine = new HandlebarsEngine()
        const tpl = '{{#if show}}<p>Visible</p>{{/if}}'
        expect(engine.render(tpl, { show: true })).toBe('<p>Visible</p>')
        expect(engine.render(tpl, { show: false })).toBe('')
    })

    it('should handle else blocks', () => {
        const engine = new HandlebarsEngine()
        const tpl = '{{#if title}}<title>{{title}}</title>{{else}}<title>Default</title>{{/if}}'
        expect(engine.render(tpl, { title: 'Page' })).toBe('<title>Page</title>')
        expect(engine.render(tpl, {})).toBe('<title>Default</title>')
    })

    it('should default HTML escape for safety', () => {
        const engine = new HandlebarsEngine()
        const result = engine.render('{{content}}', { content: '<script>alert("xss")</script>' })
        expect(result).not.toContain('<script>')
        expect(result).toContain('&lt;script&gt;')
    })

    it('should support raw output with triple braces', () => {
        const engine = new HandlebarsEngine()
        const result = engine.render('{{{content}}}', { content: '<b>bold</b>' })
        expect(result).toBe('<b>bold</b>')
    })
})

describe('HandlebarsEngine - caching', () => {
    it('should cache compiled templates and return same result', () => {
        const engine = new HandlebarsEngine()
        const tpl = '<p>{{name}}</p>'
        const result1 = engine.render(tpl, { name: 'Alice' })
        const result2 = engine.render(tpl, { name: 'Bob' })
        expect(result1).toBe('<p>Alice</p>')
        expect(result2).toBe('<p>Bob</p>')
    })

    it('should produce consistent results for identical templates', () => {
        const engine = new HandlebarsEngine()
        const tpl = '{{#if active}}YES{{else}}NO{{/if}}'
        const results = Array.from({ length: 100 }, (_, i) =>
            engine.render(tpl, { active: i % 2 === 0 })
        )
        expect(results[0]).toBe('YES')
        expect(results[1]).toBe('NO')
        expect(results[98]).toBe('YES')
        expect(results[99]).toBe('NO')
    })
})

describe('HandlebarsEngine - custom helpers', () => {
    it('should register and use custom helpers', () => {
        const engine = new HandlebarsEngine({
            helpers: {
                eq: (a: unknown, b: unknown) => a === b,
            }
        })
        const tpl = '{{#if (eq status "active")}}ONLINE{{else}}OFFLINE{{/if}}'
        expect(engine.render(tpl, { status: 'active' })).toBe('ONLINE')
        expect(engine.render(tpl, { status: 'inactive' })).toBe('OFFLINE')
    })

    it('should register multiple helpers', () => {
        const engine = new HandlebarsEngine({
            helpers: {
                upper: (str: string) => String(str).toUpperCase(),
                lower: (str: string) => String(str).toLowerCase(),
            }
        })
        expect(engine.render('{{upper name}}', { name: 'hello' })).toBe('HELLO')
        expect(engine.render('{{lower name}}', { name: 'WORLD' })).toBe('world')
    })

    it('should support helper with format date', () => {
        const engine = new HandlebarsEngine({
            helpers: {
                formatDate: (date: string) => new Date(date).toISOString().split('T')[0],
            }
        })
        const result = engine.render('{{formatDate date}}', { date: '2024-01-15T10:30:00Z' })
        expect(result).toBe('2024-01-15')
    })

    it('should isolate helpers per engine instance', () => {
        const engineA = new HandlebarsEngine({
            helpers: {
                label: () => 'A',
            }
        })
        const engineB = new HandlebarsEngine({
            helpers: {
                label: () => 'B',
            }
        })

        expect(engineA.render('{{label this}}')).toBe('A')
        expect(engineB.render('{{label this}}')).toBe('B')
        expect(() => new HandlebarsEngine().render('{{label this}}')).toThrow()
    })
})

describe('HandlebarsEngine - custom partials', () => {
    it('should register and use partials', () => {
        const engine = new HandlebarsEngine({
            partials: {
                header: '<header><h1>{{title}}</h1></header>',
                footer: '<footer>{{copyright}}</footer>',
            }
        })
        const tpl = '{{> header}}<main>Content</main>{{> footer}}'
        const result = engine.render(tpl, { title: 'My Site', copyright: '2024' })
        expect(result).toBe('<header><h1>My Site</h1></header><main>Content</main><footer>2024</footer>')
    })

    it('should allow partials to access parent context', () => {
        const engine = new HandlebarsEngine({
            partials: {
                meta: '<meta name="description" content="{{description}}" />',
            }
        })
        const result = engine.render('{{> meta}}', { description: 'A test page' })
        expect(result).toBe('<meta name="description" content="A test page" />')
    })
})

describe('HandlebarsEngine - compile and runtime options', () => {
    it('should pass compileOptions (noEscape)', () => {
        const engine = new HandlebarsEngine({
            compileOptions: { noEscape: true }
        })
        const result = engine.render('{{content}}', { content: '<b>bold</b>' })
        expect(result).toBe('<b>bold</b>')
    })

    it('should pass compileOptions (strict mode)', () => {
        const engine = new HandlebarsEngine({
            compileOptions: { strict: true }
        })
        // In strict mode, accessing undefined variables throws
        expect(() => engine.render('{{title}}', {})).toThrow()
    })
})

describe('TemplateEngine interface - custom implementation', () => {
    it('should accept a custom TemplateEngine implementation', () => {
        const customEngine: TemplateEngine = {
            render: (tpl, data) => {
                return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => {
                    return (data as Record<string, string>)[key] ?? ''
                })
            }
        }
        const result = customEngine.render('Hello {{name}}, welcome to {{place}}!', {
            name: 'Alice',
            place: 'Wonderland'
        })
        expect(result).toBe('Hello Alice, welcome to Wonderland!')
    })

    it('custom engine should be usable in place of HandlebarsEngine', () => {
        const calls: string[] = []
        const spyEngine: TemplateEngine = {
            render: (tpl, data) => {
                calls.push(tpl)
                return `rendered:${tpl}`
            }
        }
        const result = spyEngine.render('<p>test</p>', {})
        expect(result).toBe('rendered:<p>test</p>')
        expect(calls).toHaveLength(1)
        expect(calls[0]).toBe('<p>test</p>')
    })

    it('should accept an async custom TemplateEngine implementation', async () => {
        const customEngine: TemplateEngine = {
            render: async (tpl, data) => {
                await Promise.resolve()
                return tpl.replace('{{name}}', String((data as Record<string, string>).name))
            }
        }

        await expect(customEngine.render('Hello {{name}}', { name: 'Async' })).resolves.toBe('Hello Async')
    })

    it('should pass render context to a custom engine during template generation', async () => {
        let receivedContext: TemplateRenderContext | undefined
        const pluginOption: MergedPluginOption = {
            entryName: 'main.jsx',
            enableDevDirectory: false,
            historyApiFallback: false,
            watchConfig: false,
            sharedData: { shared: 'yes' },
            engine: {
                render: async (_tpl, data, context) => {
                    receivedContext = context
                    return `<html><body>${(data as Record<string, string>).title}</body></html>`
                }
            },
        }
        const entries = new Entries({ root: 'tests/example/src' }, pluginOption)
        const entry = entries.entries.find(item => item.value === '.')

        expect(entry).toBeDefined()
        const result = await prepareSingleVirtualEntry(entry!, pluginOption)

        expect(result).toContain('This is the rootDir of vite config')
        expect(receivedContext?.entry).toBe(entry)
        expect(receivedContext?.pageConfig.data).toEqual({ title: 'This is the rootDir of vite config' })
        expect(receivedContext?.pluginOptions).toBe(pluginOption)
        expect(receivedContext?.templatePath).toBe(path.resolve(entry!.abs, '../templates/handlebars-title.html'))
    })
})

describe('Plugin options - Handlebars compatibility', () => {
    async function renderCompatEntry(pluginOption: Parameters<typeof autoMpaHTMLPlugin>[0]) {
        const root = path.resolve('tests/example/src')
        const plugin = autoMpaHTMLPlugin(pluginOption)

        if (typeof plugin.apply === 'function') {
            plugin.apply({}, { command: 'build', mode: 'test' })
        }
        if (typeof plugin.config === 'function') {
            plugin.config({ root }, { command: 'build', mode: 'test' })
        }
        if (typeof plugin.buildStart === 'function') {
            await plugin.buildStart.call({} as never, {} as never)
        }
        return typeof plugin.load === 'function'
            ? await plugin.load(path.join(root, 'compat/index.html'))
            : undefined
    }

    it('should keep old renderEngineOption, handlebarsHelpers, and handlebarsPartials working', async () => {
        const html = await renderCompatEntry({
            entryName: 'compat.jsx',
            renderEngineOption: {
                compileOptions: { noEscape: true },
            },
            handlebarsHelpers: {
                legacyUpper: (value: string) => String(value).replace('compat', 'COMPAT'),
            },
            handlebarsPartials: {
                legacyFooter: '<footer>{{footer}}</footer>',
            },
        })

        expect(html).toContain('<title><strong>COMPAT</strong></title>')
        expect(html).toContain('<footer>legacy partial</footer>')
    })

    it('should prefer the new handlebars option object over legacy options', async () => {
        const html = await renderCompatEntry({
            entryName: 'compat.jsx',
            renderEngineOption: {
                compileOptions: { noEscape: false },
            },
            handlebarsHelpers: {
                legacyUpper: () => 'legacy helper',
            },
            handlebarsPartials: {
                legacyFooter: '<footer>legacy partial</footer>',
            },
            handlebars: {
                compileOptions: { noEscape: true },
                helpers: {
                    legacyUpper: (value: string) => String(value).replace('compat', 'NEW'),
                },
                partials: {
                    legacyFooter: '<footer>new partial</footer>',
                },
            },
        })

        expect(html).toContain('<title><strong>NEW</strong></title>')
        expect(html).toContain('<footer>new partial</footer>')
    })
})

describe('HandlebarsEngine - default HTML template', () => {
    it('should render the default template with all data', () => {
        const engine = new HandlebarsEngine()
        const result = engine.render(__defaultHTMLTemplate, {
            title: 'Test Title',
            description: 'Test Description',
            keywords: 'test, keywords',
        })
        expect(result).toContain('<title>Test Title</title>')
        expect(result).toContain('content="Test Description"')
        expect(result).toContain('content="test, keywords"')
    })

    it('should render the default template with fallback title', () => {
        const engine = new HandlebarsEngine()
        const result = engine.render(__defaultHTMLTemplate, {})
        expect(result).toContain('<title>Application</title>')
        expect(result).not.toContain('content="Test Description"')
    })
})
