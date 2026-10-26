import { readFile } from "node:fs/promises"
import { build, createServer } from "vite"

const configFile = new URL("./vite.config.js", import.meta.url).pathname

await build({ configFile })

const builtHtml = await readFile(new URL("./dist/index.html", import.meta.url), "utf8")
if (!builtHtml.includes("<title>compatibility smoke test</title>")) {
  throw new Error("The production build did not render the configured page title")
}

const server = await createServer({ configFile })

try {
  await server.listen(0)
  const address = server.httpServer?.address()
  if (!address || typeof address === "string") {
    throw new Error("The development server did not expose a TCP address")
  }

  const response = await fetch(`http://127.0.0.1:${address.port}/index.html`)
  const html = await response.text()

  if (!response.ok) {
    throw new Error(`The development server returned HTTP ${response.status}`)
  }
  if (!html.includes("<title>compatibility smoke test</title>")) {
    throw new Error("The development server did not render the configured page title")
  }
  if (!html.includes("/@vite/client")) {
    throw new Error("The development HTML did not pass through Vite's HTML transform")
  }
} finally {
  await server.close()
}

console.log("Compatibility smoke test passed")
