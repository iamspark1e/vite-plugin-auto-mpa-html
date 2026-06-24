import Handlebars from 'handlebars'
import type { RuntimeOptions, HelperDelegate, TemplateDelegate } from 'handlebars'

export interface TemplateEngine {
    render(templateStr: string, data?: object): string;
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

    constructor(options?: HandlebarsEngineOptions) {
        if (options?.helpers) {
            for (const [name, fn] of Object.entries(options.helpers)) {
                Handlebars.registerHelper(name, fn);
            }
        }
        if (options?.partials) {
            for (const [name, tpl] of Object.entries(options.partials)) {
                Handlebars.registerPartial(name, tpl);
            }
        }
        this.compileOptions = options?.compileOptions;
        this.runtimeOptions = options?.runtimeOptions;
    }

    render(templateStr: string, data?: object): string {
        let compiled = this.cache.get(templateStr);
        if (!compiled) {
            compiled = Handlebars.compile(templateStr, this.compileOptions);
            this.cache.set(templateStr, compiled);
        }
        return compiled(data, this.runtimeOptions);
    }
}
