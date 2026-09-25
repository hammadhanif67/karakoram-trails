// Post-build fix for the static export (runs automatically after `npm run build`).
//
// Next.js 16.3 writes the prefetch payloads of dynamic routes into nested folders, e.g.
//   out/tours/hunza-escape/__next.tours/$d$slug/__PAGE__.txt
// but the client router requests the dot-joined file name:
//   out/tours/hunza-escape/__next.tours.$d$slug.__PAGE__.txt
// Without this copy those prefetches 404 and <Link> falls back to full page loads.
// Copies every nested "__next.*" file to its flat name. Safe to remove once Next.js fixes it.

import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const OUT = "out";
let copied = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name.startsWith("__next.")) flatten(dir, full);
    else walk(full);
  }
}

function flatten(parent, segmentDir) {
  const stack = [segmentDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        stack.push(full);
        continue;
      }
      const flatName = relative(parent, full).split(sep).join(".");
      const target = join(parent, flatName);
      if (!existsSync(target)) {
        copyFileSync(full, target);
        copied++;
      }
    }
  }
}

if (existsSync(OUT)) {
  walk(OUT);
  console.log(`flatten-segment-files: ${copied} file(s) copied`);
}
