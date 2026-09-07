import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const port = Number(process.env.PORT || 3006);
const root = resolve(process.env.STATIC_ROOT || "dist");
const indexFile = join(root, "index.html");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

function sendFile(response, filePath) {
  const contentType = contentTypes.get(extname(filePath)) || "application/octet-stream";
  response.writeHead(200, {
    "content-type": contentType,
    "x-content-type-options": "nosniff",
  });
  createReadStream(filePath).pipe(response);
}

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url || "/", "http://localhost").pathname);
  const candidate = normalize(join(root, pathname));

  if (!candidate.startsWith(root)) {
    return undefined;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  return indexFile;
}

createServer((request, response) => {
  const filePath = resolveRequestPath(request.url);

  if (!filePath || !existsSync(filePath)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  sendFile(response, filePath);
}).listen(port, "127.0.0.1", () => {
  console.log(`notes-sync-app listening on http://127.0.0.1:${port}`);
});
