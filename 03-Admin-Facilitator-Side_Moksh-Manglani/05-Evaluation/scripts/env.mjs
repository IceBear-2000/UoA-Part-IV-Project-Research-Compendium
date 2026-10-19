// Shared env loader for the evaluation harness. Never prints secret values.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env"), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)="?(.*?)"?$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}
// Mirror production: transaction pooler
process.env.DATABASE_URL = process.env.DATABASE_URL.replace(":5432", ":6543").replace(/\?.*$/, "") + "?pgbouncer=true";
export const ROOT = root;
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
