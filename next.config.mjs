/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push('@node-rs/argon2');
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: process.env.MINIO_ENDPOINT,
      },
    ],
  },
};

export default nextConfig;
