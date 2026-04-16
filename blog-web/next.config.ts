import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  compiler: process.env.NODE_ENV === "production"
    ? {
        removeConsole: {
          exclude: ["error", "warn"],
        },
      }
    : undefined,
  images: {
    // 开发环境
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8888", // 必须加上这个端口号
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
