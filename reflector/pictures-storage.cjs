const http = require('node:http');

const pathPattern = /^\/files\/apps\/com\.hellojevans\.greenlight\.pictures\/[\w-]{43}\/data\/[\w-]{43}$/;
const objects = new Map();
const maxObjectBytes = 11 * 1024 * 1024;
const maxStorageBytes = 64 * 1024 * 1024;
let storedBytes = 0;
let pendingBytes = 0;

const server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const finish = code => response.writeHead(code).end();
    if (!pathPattern.test(pathname)) return finish(404);

    if (request.method === 'GET' || request.method === 'HEAD') {
        const bytes = objects.get(pathname);
        if (!bytes) return finish(404);
        return response.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': bytes.length,
            'X-Content-Type-Options': 'nosniff'
        }).end(request.method === 'GET' ? bytes : undefined);
    }
    if (request.method !== 'PUT') return finish(405);
    const size = Number(request.headers['content-length']);
    if (!Number.isSafeInteger(size) || size <= 0 || size > maxObjectBytes) return finish(413);
    if (storedBytes + pendingBytes + size > maxStorageBytes || objects.size >= 512) return finish(507);

    pendingBytes += size;
    try {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        const bytes = Buffer.concat(chunks, size);
        if (!objects.has(pathname)) {
            objects.set(pathname, bytes);
            storedBytes += bytes.length;
        }
        finish(201);
    } catch (error) {
        if (!response.destroyed) finish(400);
    } finally {
        pendingBytes -= size;
    }
});

server.listen(9091, '127.0.0.1');
