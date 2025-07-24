/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  serverExternalPackages: ['pg', 'cloudinary'],
  experimental: {
    dynamicIO: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.indianexpress.com',
      },
      {
        protocol: 'https',
        hostname: 'hospitalityinsights.ehl.edu',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: 'images.stockcake.com',
      },
      {
        protocol: 'https',
        hostname: 'uglyfood.com.sg',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.vox-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'www.6newyork.fr',
      },
      {
        protocol: 'https',
        hostname: 'image-tc.galaxy.tf',
      },
    ],
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
