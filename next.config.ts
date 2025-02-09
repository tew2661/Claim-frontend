import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_MODE: process.env.NEXT_MODE,
    NEXT_PORT: process.env.PORT,
  },
  /* config options here */
};

export default nextConfig;
