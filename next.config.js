const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Resolver problema de múltiplos lockfiles
  outputFileTracingRoot: path.join(__dirname),
}

module.exports = nextConfig
