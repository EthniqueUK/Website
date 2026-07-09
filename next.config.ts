import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Allow identity/address proof uploads via server actions in production.
    proxyClientMaxBodySize: 15 * 1024 * 1024,
  },
};

export default nextConfig;
