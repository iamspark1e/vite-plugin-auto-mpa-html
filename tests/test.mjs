import path from 'path'
import connect from "connect";
import http from 'http'
import { createServer } from "vite";
import { fileURLToPath } from 'url';
import { getEntries, devServerMiddleware } from '../dist/index.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pluginOption = {
    entryName: "main.jsx",
    enableDevDirectory: true
};

const tmp = connect();
let entries;

let viteServer = await createServer({
    root: path.resolve(__dirname, "example", "src"),
    server: {
        middlewareMode: true,
    },
    appType: "custom",
});
entries = getEntries(path.resolve(__dirname, "example"), pluginOption.entryName)
tmp.use(viteServer.middlewares);
tmp.use(devServerMiddleware(path.resolve(__dirname, "example"), entries, pluginOption, viteServer));

http.createServer(tmp).listen(30081);