const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, ".next"), { recursive: true });

// Copy Next.js standalone server output.
// dereference avoids pnpm symlinks that break after copy.
fs.cpSync(path.join(root, ".next", "standalone"), dist, {
  recursive: true,
  dereference: true,
});

// Sanity check: standalone should include .next/BUILD_ID.
if (!fs.existsSync(path.join(dist, ".next", "BUILD_ID"))) {
  console.warn("Warning: dist/.next/BUILD_ID missing. Check your archive command includes dotfiles.");
}

// Copy static assets and public files required at runtime
fs.cpSync(path.join(root, ".next", "static"), path.join(dist, ".next", "static"), {
  recursive: true,
});
fs.cpSync(path.join(root, "public"), path.join(dist, "public"), { recursive: true });

// Remove pnpm compatibility links that are often broken in standalone output.
const pnpmCompat = path.join(dist, "node_modules", ".pnpm", "node_modules");
fs.rmSync(pnpmCompat, { recursive: true, force: true });

// Materialize top-level deps from pnpm virtual store if missing.
const pnpmStore = path.join(dist, "node_modules", ".pnpm");
if (fs.existsSync(pnpmStore)) {
  for (const storeEntry of fs.readdirSync(pnpmStore, { withFileTypes: true })) {
    if (!storeEntry.isDirectory()) continue;
    const nm = path.join(pnpmStore, storeEntry.name, "node_modules");
    if (!fs.existsSync(nm)) continue;
    for (const pkgEntry of fs.readdirSync(nm, { withFileTypes: true })) {
      if (!pkgEntry.isDirectory()) continue;
      if (pkgEntry.name.startsWith("@")) {
        const scopeDir = path.join(nm, pkgEntry.name);
        for (const scopedPkg of fs.readdirSync(scopeDir, { withFileTypes: true })) {
          if (!scopedPkg.isDirectory()) continue;
          const src = path.join(scopeDir, scopedPkg.name);
          const dest = path.join(dist, "node_modules", pkgEntry.name, scopedPkg.name);
          if (fs.existsSync(dest)) continue;
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.cpSync(src, dest, { recursive: true, dereference: true });
        }
        continue;
      }
      const src = path.join(nm, pkgEntry.name);
      const dest = path.join(dist, "node_modules", pkgEntry.name);
      if (fs.existsSync(dest)) continue;
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.cpSync(src, dest, { recursive: true, dereference: true });
    }
  }
}

// Replace any remaining symlinks with real files/dirs so the dist is portable.
function materializeSymlinks(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) {
      let real;
      try {
        real = fs.realpathSync(full);
      } catch (err) {
        // Broken symlink; remove and continue.
        fs.rmSync(full, { recursive: true, force: true });
        continue;
      }
      const stat = fs.statSync(real);
      fs.rmSync(full, { recursive: true, force: true });
      if (stat.isDirectory()) {
        fs.cpSync(real, full, { recursive: true });
        materializeSymlinks(full);
      } else {
        fs.copyFileSync(real, full);
      }
      continue;
    }
    if (entry.isDirectory()) materializeSymlinks(full);
  }
}

materializeSymlinks(path.join(dist, "node_modules"));

// Verify there are no symlinks left under dist/node_modules.
function hasSymlink(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return true;
    if (entry.isDirectory() && hasSymlink(full)) return true;
  }
  return false;
}

if (hasSymlink(path.join(dist, "node_modules"))) {
  console.warn("Warning: symlinks remain under dist/node_modules.");
}
