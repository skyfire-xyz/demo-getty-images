/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['encoding'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'delivery.gettyimages.com',
      },
      {
        protocol: 'https',
        hostname: "media.gettyimages.com"
      }
    ],
  }
}

export default nextConfig
