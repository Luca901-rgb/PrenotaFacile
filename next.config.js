/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  eslint: {
    // Ignora errori ESLint durante il build di produzione
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
