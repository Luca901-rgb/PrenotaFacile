/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  eslint: {
    // Ignora errori ESLint durante il build di produzione
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
