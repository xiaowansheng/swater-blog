# ========================================
# 多阶段构建 Dockerfile for Blog Web
# 第一阶段：构建 Next.js 应用
# 第二阶段：运行 Next.js 应用
# ========================================

# 构建阶段
FROM node:20-alpine AS builder

LABEL stage=builder
LABEL maintainer="blog-team"
LABEL description="Blog Web build stage"

WORKDIR /app

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm（输出更完整日志，主备切换）
RUN npm config set registry https://registry.npmmirror.com \
    && (npm install -g pnpm@9 --loglevel verbose || (npm config set registry https://mirrors.cloud.tencent.com/npm && npm install -g pnpm@9 --loglevel verbose)) \
    && pnpm config set registry https://registry.npmmirror.com \
    && pnpm config set fetch-retries 5 \
    && pnpm config set fetch-timeout 600000

# 安装依赖
RUN pnpm install --frozen-lockfile --reporter=ndjson || (pnpm config set registry https://mirrors.cloud.tencent.com/npm && pnpm install --frozen-lockfile --reporter=ndjson)

# 复制源代码
COPY . .

# 构建 Next.js 应用
RUN pnpm exec next build --webpack

# 生产阶段
FROM node:20-alpine

LABEL maintainer="blog-team"
LABEL version="1.0.0"
LABEL description="Blog Web production runtime"

# 安装 dumb-init 用于正确的信号处理
RUN apk add --no-cache dumb-init

# 创建应用目录
WORKDIR /app

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制必要的文件
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml

# 复制 .next 目录
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

# 使用 dumb-init 启动
ENTRYPOINT ["dumb-init", "--"]

# 启动应用
CMD ["node", "server.js"]
