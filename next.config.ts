import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node-fetch", "hpagent"],
  devIndicators: false,
};

export default nextConfig;
