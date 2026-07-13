import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only — never import this into a Client Component. Uses the
// service role key, which bypasses Row Level Security entirely.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const BLOCK_RESOURCES_BUCKET = "block-resources";

// The bucket is private (see scripts/setup-storage-bucket.ts) — this is the
// only supported way to read an uploaded file's contents, per
// PROJECT_BRIEF.md's "signed URLs ... never public direct links".
export async function getSignedFileUrl(
  filePath: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(BLOCK_RESOURCES_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);

  if (error) return null;
  return data.signedUrl;
}
