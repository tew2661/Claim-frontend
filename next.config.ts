import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_MODE: process.env.NEXT_MODE,
    NEXT_TEST: process.env.NEXT_TEST
  },
};
console.log(process.env.NEXT_MODE ,process.env.NEXT_TEST);
export default nextConfig;
