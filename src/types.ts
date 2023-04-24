import type { Options as EjsOption } from "ejs";

export type PluginOption = {
    entryName?: string;                 // default:main.js
    ejsOption?: EjsOption;
    sharedData?: object;                // will be merged into every page's data
    enableDevDirectory?: boolean;
}

export type MergedPluginOption = {
    entryName: string;                 // default:main.js
    ejsOption?: EjsOption;
    sharedData?: object;                // will be merged into every page's data
    enableDevDirectory: boolean;
}

export const defaultPluginOption = {
    entryName: "main.js",
    enableDevDirectory: true
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