/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse (pdfjs-dist) and mammoth aren't safe for webpack's bundling of
  // the server-action client-reference layer — keep them as real Node
  // requires instead of bundling them.
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth"],
  },
};

export default nextConfig;
