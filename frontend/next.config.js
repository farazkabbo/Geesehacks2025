// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  // Add this to ensure proper middleware handling
  webpack: (config, { isServer }) => {
    // Server-specific configuration
    if (isServer) {
      // Handle middleware manifest
      config.externals = [...config.externals, 'bufferutil', 'utf-8-validate']
    }
    return config
  },
}

module.exports = nextConfig