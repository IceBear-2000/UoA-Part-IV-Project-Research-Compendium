import "server-only";
import { YoutubeTranscript } from "youtube-transcript";

export type TranscriptResult = { text: string } | { error: string };

function isYoutubeUrl(rawUrl: string): boolean {
  try {
    const host = new URL(rawUrl).hostname.replace(/^www\.|^m\./, "");
    return host === "youtube.com" || host === "youtube-nocookie.com" || host === "youtu.be";
  } catch {
    return false;
  }
}

// Only YouTube is supported — see AI_WORKSHEET_GENERATOR_SPEC.md's "Video
// scope" decision. Vimeo/file videos return a clear "not available" error
// instead of attempting a fetch that can't succeed.
export async function fetchYoutubeTranscript(rawUrl: string): Promise<TranscriptResult> {
  if (!isYoutubeUrl(rawUrl)) {
    return { error: "No transcript available (not a YouTube video)." };
  }

  try {
    const segments = await YoutubeTranscript.fetchTranscript(rawUrl);
    const text = segments.map((s) => s.text).join(" ");
    if (!text.trim()) return { error: "Transcript came back empty." };
    return { text };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Couldn't fetch a transcript for this video.",
    };
  }
}
