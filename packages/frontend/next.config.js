/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  },
  images: {
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
      // Add your own image domains here
      {
        protocol: 'https',
        hostname: 'your-domain.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
