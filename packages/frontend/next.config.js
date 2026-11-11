/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || "",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Localhost for development (Rails Active Storage)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/rails/active_storage/**',
      },
      // Production Active Storage (same origin as the site and the API host)
      {
        protocol: 'https',
        hostname: 'properlia.com',
        port: '',
        pathname: '/rails/active_storage/**',
      },
      {
        protocol: 'https',
        hostname: 'api.properlia.com',
        port: '',
        pathname: '/rails/active_storage/**',
      },
    ],
  },
};

module.exports = nextConfig;
