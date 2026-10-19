// One-off setup script: creates the private Supabase Storage bucket that
// block file uploads (readings, worksheets) live in. Run with:
// npx tsx scripts/setup-storage-bucket.ts
import "dotenv/config";
import { supabaseAdmin, BLOCK_RESOURCES_BUCKET } from "../lib/supabase-admin";

async function main() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) throw listError;

  if (buckets.some((b) => b.name === BLOCK_RESOURCES_BUCKET)) {
    console.log(`Bucket "${BLOCK_RESOURCES_BUCKET}" already exists — nothing to do.`);
    return;
  }

  const { error } = await supabaseAdmin.storage.createBucket(BLOCK_RESOURCES_BUCKET, {
    public: false,
    fileSizeLimit: "25MB",
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ],
  });
  if (error) throw error;

  console.log(`Created private bucket "${BLOCK_RESOURCES_BUCKET}".`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
