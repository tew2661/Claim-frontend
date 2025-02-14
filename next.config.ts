import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_MODE: process.env.NEXT_MODE,
    NEXT_TEST: process.env.NEXT_TEST,
    NEXT_PUBLIC_URL_API: process.env.NEXT_PUBLIC_URL_API,
    NEXT_PUBLIC_SOCKET_SERVER_URL: process.env.NEXT_PUBLIC_SOCKET_SERVER_URL,
  },
};
export default nextConfig;
