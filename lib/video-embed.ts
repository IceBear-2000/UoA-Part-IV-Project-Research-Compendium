type VideoEmbed = { kind: "iframe"; src: string } | { kind: "file"; src: string };

// YouTube/Vimeo watch-page URLs return an HTML page, not a video stream, so
// a plain <video src> tag can never play them — they need an <iframe> embed
// instead. Direct file links (.mp4 etc.) are the only case a <video> tag
// actually works for.
export function resolveVideoEmbed(rawUrl: string): VideoEmbed | null {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }
    // A playlist link plays from its first video, with the playlist menu available.
    if (url.pathname === "/playlist") {
      const list = url.searchParams.get("list");
      if (list) return { kind: "iframe", src: `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}` };
    }
    const shortsMatch = url.pathname.match(/^\/shorts\/([\w-]+)/);
    if (shortsMatch) {
      return { kind: "iframe", src: `https://www.youtube.com/embed/${shortsMatch[1]}` };
    }
    if (url.pathname.startsWith("/embed/")) return { kind: "iframe", src: url.toString() };
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
  }

  if (host === "vimeo.com") {
    const idMatch = url.pathname.match(/^\/(\d+)/);
    if (idMatch) return { kind: "iframe", src: `https://player.vimeo.com/video/${idMatch[1]}` };
  }

  if (host === "player.vimeo.com") return { kind: "iframe", src: url.toString() };

  // Only real video files can use a plain <video> tag. Channel pages, search pages and other web
  // pages cannot play inside the app, so the player shows a link card instead of a blank player.
  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(url.pathname)) return { kind: "file", src: rawUrl };
  return null;
}
