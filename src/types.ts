import type { Options as EjsOption } from "ejs";

export type PluginOption = {
    entryName?: string;                 // default:main.js
    configName?: string;                // default:config.json
    ejsOption?: EjsOption;
    sharedData?: object;                // will be merged into every page's data
    enableDevDirectory?: boolean;
    experimental?: ExperimentalPluginOption;
}

export type ExperimentalPluginOption = {
    customTemplateName?: string;
    rootEntryDistName?: string; // if an entry is placed at the root folder of vite config's `root`, you can change its name, use "_root" as default. 
}

export type MergedPluginOption = {
    entryName: string;                 // default:main.js
    configName: string;
    ejsOption?: EjsOption;
    sharedData?: object;                // will be merged into every page's data
    enableDevDirectory: boolean;
    experimental?: ExperimentalPluginOption;
}

export const defaultPluginOption = {
    entryName: "main.js",
    configName: "config.json",
    enableDevDirectory: true,
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
    private coloredMsg = (msg: string, colorPrefix: string = "\x1b[37m") => {
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