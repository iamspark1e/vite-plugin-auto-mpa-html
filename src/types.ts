import type { TemplateEngine, HandlebarsEngineOptions } from './template-engine'
import type { HelperDelegate, RuntimeOptions } from 'handlebars'

export type CompileOptions = {
    data?: boolean;
    compat?: boolean;
    knownHelpers?: { [name: string]: boolean };
    knownHelpersOnly?: boolean;
    noEscape?: boolean;
    strict?: boolean;
    assumeObjects?: boolean;
    preventIndent?: boolean;
    ignoreStandalone?: boolean;
    explicitPartialContext?: boolean;
}

export type LegacyRenderEngineOption = {
    compileOptions?: CompileOptions;
    runtimeOptions?: RuntimeOptions;
}

export type PluginOption = {
    entryName?: string;                 // default:main.js
    configName?: string;                // default:config.json
    templateEngine?: TemplateEngine;    // custom template engine (overrides built-in Handlebars options)
    handlebars?: HandlebarsEngineOptions;  // built-in Handlebars engine options
    /** @deprecated Use `handlebars.compileOptions` and `handlebars.runtimeOptions` instead. */
    renderEngineOption?: LegacyRenderEngineOption;  // built-in Handlebars compile/runtime options
    /** @deprecated Use `handlebars.helpers` instead. */
    handlebarsHelpers?: Record<string, HelperDelegate>;  // custom Handlebars helpers
    /** @deprecated Use `handlebars.partials` instead. */
    handlebarsPartials?: Record<string, string>;         // custom Handlebars partials
    sharedData?: object;                // will be merged into every page's data
    enableDevDirectory?: boolean;
    historyApiFallback?: boolean;       // default:false, enable history API fallback for SPA routing
    experimental?: ExperimentalPluginOption;
}

export type ExperimentalPluginOption = {
    customTemplateName?: string;
    rootEntryDistName?: string; // if an entry is placed at the root folder of vite config's `root`, you can change its name, use "_root" as default.
    /** @deprecated Use top-level `enableDevDirectory` instead. This will be removed when experimental options are deprecated. */
    enableDevDirectory?: boolean;
    /** @deprecated Use top-level `historyApiFallback` instead. This will be removed when experimental options are deprecated. */
    historyApiFallback?: boolean;
}

export type MergedPluginOption = {
    entryName: string;                 // default:main.js
    configName?: string;
    engine: TemplateEngine;            // resolved template engine instance
    handlebars?: HandlebarsEngineOptions;
    renderEngineOption?: LegacyRenderEngineOption;
    sharedData?: object;                // will be merged into every page's data
    enableDevDirectory: boolean;
    historyApiFallback: boolean;        // default:false, enable history API fallback for SPA routing
    experimental?: ExperimentalPluginOption;
}

export const defaultPluginOption = {
    entryName: "main.js",
    configName: "config.json",
    enableDevDirectory: true,
    historyApiFallback: false,
    experimental: {}
}

export type PagePluginConfig = {
    template?: string;
    data?: object;
};

type ErrorOfNotFound = {
    code: string;
    message: string;
}

export function isErrorOfNotFound(error: unknown): error is ErrorOfNotFound {
    return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error &&
        typeof (error as Record<string, unknown>).code === 'string' &&
        typeof (error as Record<string, unknown>).message === 'string'
    )
}

enum PluginCustomizedErrorLevel {
    fatal = 0,
    warn,
    info,
    debug, // fatal error will be thrown
}

export class PluginCustomizedError extends Error {
    errorLevel: PluginCustomizedErrorLevel;
    constructor(message: string, errorLevel: PluginCustomizedErrorLevel = 0) {
        super(message)

        this.errorLevel = errorLevel
        this.name = "VitePluginAutoMpaHTMLError"
        this.message = `[vite-plugin-auto-mpa-html]: ${message}`
    }
}

// Plugin's custom errors
export class ColoringConsole {
    envErrorLevel: PluginCustomizedErrorLevel = 0;

    constructor(envErrorLevel: PluginCustomizedErrorLevel = 0) {
        if (envErrorLevel) this.envErrorLevel = envErrorLevel
    }

    /**
     * @see {@link https://sparkle.im/post/node-js%E7%8E%AF%E5%A2%83log%E9%A2%9C%E8%89%B2%E8%A1%A8}
     * default "debug" color is white
     */
    private coloredMsg = (msg: string, colorPrefix = "\x1b[37m") => {
        return `${colorPrefix}[vite-plugin-auto-mpa-html]: ${msg}\x1b[0m`
    }

    debug = (msg: string) => {
        if (this.envErrorLevel >= 3) console.log(this.coloredMsg(msg))
    }

    log = (msg: string) => {
        if (this.envErrorLevel >= 2) console.log(this.coloredMsg(msg, '\x1b[34m'))
    }

    warn = (msg: string) => {
        if (this.envErrorLevel >= 1) console.log(this.coloredMsg(msg, '\x1b[33m'))
    }

    error = (msg: string) => {
        if (this.envErrorLevel >= 0) console.log(this.coloredMsg(msg, '\x1b[31m'))
    }

    fatal = (msg: string) => {
        throw new PluginCustomizedError(msg, 0)
    }
}
