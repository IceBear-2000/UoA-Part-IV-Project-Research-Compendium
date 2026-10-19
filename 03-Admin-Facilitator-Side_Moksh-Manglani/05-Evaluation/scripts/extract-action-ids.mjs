// Maps Next.js Server Action IDs (from the production build) to exported function names.
import fs from "node:fs";
import path from "node:path";

const manifest = JSON.parse(fs.readFileSync(".next/server/server-reference-manifest.json", "utf8")).node;
const ids = new Set(Object.keys(manifest));

function walk(d, out = []) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) walk(p, out);
    else if (p.endsWith(".js")) out.push(p);
  }
  return out;
}

const map = {};
const re = /"?([a-f0-9]{40})"?:\(\)=>Promise\.resolve\(\)\.then\([a-zA-Z_$]+\.bind\([a-zA-Z_$]+,\d+\)\)\.then\(e=>e\.(\w+)\)/g;
for (const f of walk(".next/server")) {
  const t = fs.readFileSync(f, "utf8");
  let m;
  while ((m = re.exec(t))) if (ids.has(m[1])) map[m[2]] = m[1];
}
fs.writeFileSync("eval/action-ids.json", JSON.stringify(map, null, 2));
console.log(Object.keys(map).length, "of", ids.size, "actions mapped");
console.log(Object.keys(map).sort().join(", "));
