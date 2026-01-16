/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 独立输出，用于Docker部署
  output: 'standalone',
};

module.exports = nextConfig;
