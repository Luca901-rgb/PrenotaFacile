/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/icon', permanent: false }]
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  eslint: {
    // Ignora errori ESLint durante il build di produzione
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
