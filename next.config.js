/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
    ignoreBuildErrors: true
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
