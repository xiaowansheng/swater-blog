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

# 可通过构建参数覆盖镜像源（主/备）
ARG NPM_REGISTRY_PRIMARY=https://registry.npmmirror.com
ARG NPM_REGISTRY_FALLBACK=https://mirrors.cloud.tencent.com/npm
ARG PNPM_REGISTRY_PRIMARY=https://registry.npmmirror.com
ARG PNPM_REGISTRY_FALLBACK=https://mirrors.cloud.tencent.com/npm

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm（输出更完整日志，主备切换）
RUN npm config set registry ${NPM_REGISTRY_PRIMARY} \
    && (npm install -g pnpm@9 --loglevel verbose || (npm config set registry ${NPM_REGISTRY_FALLBACK} && npm install -g pnpm@9 --loglevel verbose)) \
    && pnpm config set registry ${PNPM_REGISTRY_PRIMARY} \
    && pnpm config set fetch-retries 5 \
    && pnpm config set fetch-timeout 600000

# 安装依赖
RUN pnpm install --frozen-lockfile --reporter=ndjson || (pnpm config set registry ${PNPM_REGISTRY_FALLBACK} && pnpm install --frozen-lockfile --reporter=ndjson)

# 复制源代码
COPY . .

# 构建期环境变量
ARG NEXT_PUBLIC_API_BASE_URL=/
ARG NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX=/uploads
ARG NEXT_PUBLIC_USE_MOCK=false
ARG NEXT_PUBLIC_SITE_URL=https://blog.example.com
ARG SERVER_API_BASE_URL=http://blog-service:8888
ARG REVALIDATE_TOKEN=

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX=${NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX} \
    NEXT_PUBLIC_USE_MOCK=${NEXT_PUBLIC_USE_MOCK} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    SERVER_API_BASE_URL=${SERVER_API_BASE_URL} \
    REVALIDATE_TOKEN=${REVALIDATE_TOKEN}

# 构建 Next.js 应用
RUN pnpm exec next build --webpack

# 生产阶段
FROM node:20-alpine

LABEL maintainer="blog-team"
LABEL version="1.0.0"
LABEL description="Blog Web production runtime"

ARG NEXT_PUBLIC_API_BASE_URL=/
ARG NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX=/uploads
ARG NEXT_PUBLIC_USE_MOCK=false
ARG NEXT_PUBLIC_SITE_URL=https://blog.example.com
ARG SERVER_API_BASE_URL=http://blog-service:8888
ARG REVALIDATE_TOKEN=

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

# 设置环境变量
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL} \
    NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX=${NEXT_PUBLIC_UPLOAD_RESOURCE_PREFIX} \
    NEXT_PUBLIC_USE_MOCK=${NEXT_PUBLIC_USE_MOCK} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    SERVER_API_BASE_URL=${SERVER_API_BASE_URL} \
    REVALIDATE_TOKEN=${REVALIDATE_TOKEN}

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
