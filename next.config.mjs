/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: {
    // Swap procedural artwork for real photography later without touching components.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      // images uploaded to the backend while running locally
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
