import Handlebars from 'handlebars'
import type { RuntimeOptions, HelperDelegate, TemplateDelegate } from 'handlebars'
import type { EntryPath } from './core'
import type { MergedPluginOption, PagePluginConfig, CompileOptions } from './types'

export interface TemplateRenderContext {
    entry: EntryPath;
    pageConfig: PagePluginConfig;
    pluginOptions: MergedPluginOption;
    templatePath: string;
}

export type TemplateRenderResult = string | Promise<string>;

export interface TemplateEngine {
    render(templateStr: string, data?: object, context?: TemplateRenderContext): TemplateRenderResult;
}

export interface HandlebarsEngineOptions {
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
    helpers?: Record<string, HelperDelegate>;
    partials?: Record<string, string>;
}

export class HandlebarsEngine implements TemplateEngine {
    private cache = new Map<string, TemplateDelegate>();
    private compileOptions?: CompileOptions;
    private runtimeOptions?: RuntimeOptions;
    private handlebars = Handlebars.create();

    constructor(options?: HandlebarsEngineOptions) {
        if (options?.helpers) {
            for (const [name, fn] of Object.entries(options.helpers)) {
                this.handlebars.registerHelper(name, fn);
            }
        }
        if (options?.partials) {
            for (const [name, tpl] of Object.entries(options.partials)) {
                this.handlebars.registerPartial(name, tpl);
            }
        }
        this.compileOptions = options?.compileOptions;
        this.runtimeOptions = options?.runtimeOptions;
    }

    render(templateStr: string, data?: object): string {
        let compiled = this.cache.get(templateStr);
        if (!compiled) {
            compiled = this.handlebars.compile(templateStr, this.compileOptions);
            this.cache.set(templateStr, compiled);
        }
        return compiled(data, this.runtimeOptions);
    }
}
