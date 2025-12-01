import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@prisma/client"],
  // Empty turbopack config to silence the warning about webpack config
  turbopack: {},
  webpack: (config) => {
    config.externals = [...(config.externals || []), "@prisma/client"];
    return config;
  },
};

export default nextConfig;
