import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["node-fetch", "hpagent"],
};

export default nextConfig;
