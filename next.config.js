/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // For local development
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

