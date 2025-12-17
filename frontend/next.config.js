/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rdgm-bucket-new.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'https',
        hostname: 'royaldgmart.com',
      },
      {
        protocol: 'https',
        hostname: 'www.royaldgmart.com',
      },
    ],
  },
  // Fix WebSocket and HMR issues
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  // Skip static generation for pages with useSearchParams
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
