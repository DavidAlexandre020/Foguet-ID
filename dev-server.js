const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = 8766;
const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp"
};

http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const file = path.join(root, urlPath === "/" ? "Front.html" : urlPath);
    if (!file.startsWith(root)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end("Not found");
            return;
        }
        res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
        res.end(data);
    });
}).listen(port, "127.0.0.1", () => {
    console.log(`http://127.0.0.1:${port}/Front.html`);
});
