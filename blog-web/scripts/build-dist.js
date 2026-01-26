const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, ".next"), { recursive: true });

// Copy Next.js standalone server output
fs.cpSync(path.join(root, ".next", "standalone"), dist, { recursive: true });

// Copy static assets and public files required at runtime
fs.cpSync(path.join(root, ".next", "static"), path.join(dist, ".next", "static"), {
  recursive: true,
});
fs.cpSync(path.join(root, "public"), path.join(dist, "public"), { recursive: true });
