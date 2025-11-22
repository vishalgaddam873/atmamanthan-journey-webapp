/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // For local development
  },
  env: {
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || 'https://d1igx7lccgvz7g.cloudfront.net',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/assets/:path*',
        destination: 'http://localhost:5001/assets/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

