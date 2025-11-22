/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // For local development
    domains: ["d1igx7lccgvz7g.cloudfront.net"], // Add CDN domain for images
  },
  env: {
    NEXT_PUBLIC_CDN_URL:
      process.env.NEXT_PUBLIC_CDN_URL ||
      "https://d1igx7lccgvz7g.cloudfront.net",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5001/api/:path*",
      },
      // REMOVED: assets rewrite - assets now come from CloudFront CDN
    ];
  },
};

module.exports = nextConfig;
