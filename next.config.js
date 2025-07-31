/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', 'cloudinary'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    dynamicIO: false,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude server-only packages from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        pg: false,
        'pg-native': false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  }
}

module.exports = nextConfig
