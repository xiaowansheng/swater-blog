import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

/**
 * 从环境变量推导外部图片主机名，构建 next/image 的 remotePatterns 白名单。
 *
 * 图片资源前缀 NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX 有两种形态：
 *  - 绝对地址（如 http://localhost:8888/uploads、https://cdn.example.com/uploads）：提取其主机名加入白名单；
 *  - 相对路径（如 /uploads，生产环境同源反代）：无需白名单，next/image 默认允许同源。
 *
 * 历史上曾用 hostname: "**" 通配全部 https 域名，等于无白名单限制（SSRF 风险），此处收窄。
 */
function buildImageRemotePatterns(): { protocol: "http" | "https"; hostname: string; port?: string }[] {
  const patterns: { protocol: "http" | "https"; hostname: string; port?: string }[] = [
    // 开发环境后端直连
    { protocol: "http", hostname: "localhost", port: "8888" },
    { protocol: "http", hostname: "127.0.0.1", port: "8888" },
  ];

  const prefix = process.env.NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX ?? "";
  // 仅处理绝对地址（以 http:// 或 https:// 开头）
  const match = prefix.match(/^(https?):\/\/([^/:]+)(?::(\d+))?/);
  if (match) {
    const [, proto, hostname, port] = match;
    patterns.push({
      protocol: proto as "http" | "https",
      hostname,
      ...(port ? { port } : {}),
    });
  }

  return patterns;
}

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
    // 恢复内置图片优化（历史上 unoptimized:true 关闭了全部优化）
    remotePatterns: buildImageRemotePatterns(),
  },
};

export default withNextIntl(nextConfig);
