import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["node-fetch", "hpagent"],
  devIndicators: false,
};

export default nextConfig;
