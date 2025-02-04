import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_MODE: process.env.NEXT_MODE
  },
  /* config options here */
};

export default nextConfig;
