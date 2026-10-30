import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pipeline } from "node:stream/promises";

const siteRoot = path.resolve(process.cwd(), "out");
const basePath = (process.env.GITHUB_PAGES_BASE_PATH ?? "").replace(/\/$/, "");
const port = Number(process.env.PORT ?? "3000");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
]);

function isInsideSiteRoot(filePath) {
  return filePath === siteRoot || filePath.startsWith(`${siteRoot}${path.sep}`);
}

async function findStaticFile(requestPath) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    return null;
  }

  const candidate = path.resolve(siteRoot, `.${decodedPath}`);
  if (!isInsideSiteRoot(candidate)) return null;

  try {
    const fileStats = await stat(candidate);
    if (fileStats.isFile()) return { filePath: candidate, fileStats };
    if (fileStats.isDirectory()) {
      const indexPath = path.join(candidate, "index.html");
      const indexStats = await stat(indexPath);
      return indexStats.isFile() ? { filePath: indexPath, fileStats: indexStats } : null;
    }
  } catch {
    return null;
  }

  return null;
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let requestPath;
  try {
    requestPath = new URL(request.url ?? "/", "http://localhost").pathname;
  } catch {
    response.writeHead(400).end();
    return;
  }

  if (basePath) {
    if (requestPath === basePath) {
      requestPath = "/";
    } else if (requestPath.startsWith(`${basePath}/`)) {
      requestPath = requestPath.slice(basePath.length);
    } else {
      response.writeHead(404).end("Not found");
      return;
    }
  }

  const result = await findStaticFile(requestPath);
  if (!result) {
    const notFound = await findStaticFile("/404.html");
    response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    if (!notFound || request.method === "HEAD") {
      response.end();
      return;
    }
    try {
      await pipeline(createReadStream(notFound.filePath), response);
    } catch {
      response.destroy();
    }
    return;
  }

  const contentType = contentTypes.get(path.extname(result.filePath).toLowerCase()) ?? "application/octet-stream";
  response.writeHead(200, {
    "Content-Length": result.fileStats.size,
    "Content-Type": contentType,
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  try {
    await pipeline(createReadStream(result.filePath), response);
  } catch {
    response.destroy();
  }
});

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

server.listen(port, "127.0.0.1", () => {
  const origin = `http://127.0.0.1:${port}`;
  console.log(`Serving ${siteRoot} at ${origin}${basePath}/`);
});
