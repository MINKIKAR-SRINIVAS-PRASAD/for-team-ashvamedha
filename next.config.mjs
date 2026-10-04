/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  eslint: {
    ignoreDuringBuilds: true,
  },

  /*
   * Make Next.js use this project directory as the tracing root.
   * This prevents it from incorrectly using:
   * C:\Users\srini
   * because of the extra package-lock.json there.
   */
  outputFileTracingRoot: new URL(".", import.meta.url).pathname,

  images: {
    // Swap procedural artwork for real photography later without touching components.
    remotePatterns: [
      { protocol: "https", hostname: "**" },

      // Images uploaded to the backend while running locally.
      {
        protocol: "http",
        hostname: "localhost",
      },

      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],

    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;