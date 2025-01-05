/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
		config.externals.push("@node-rs/argon2");
		return config;
	},
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  }
};

export default nextConfig;
