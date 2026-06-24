# syntax=docker/dockerfile:1.7
# ========================================
# 多阶段构建 Dockerfile for Blog Admin
# 第一阶段：构建 React 应用
# 第二阶段：Nginx 服务静态文件
# ========================================

# 构建阶段
# 镜像固定为 digest，确保可复现构建（标签变动需重新校验并更新 digest）
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS builder

LABEL stage=builder
LABEL maintainer="blog-team"
LABEL description="Blog Admin build stage"

WORKDIR /app

ENV PNPM_STORE_PATH=/pnpm/store

# 安装 pnpm（输出更完整日志，主备切换）
RUN --mount=type=cache,id=npm-cache,target=/root/.npm,sharing=locked \
    npm config set registry https://registry.npmmirror.com \
    && (npm install -g pnpm@9 --loglevel verbose || (npm config set registry https://mirrors.cloud.tencent.com/npm && npm install -g pnpm@9 --loglevel verbose)) \
    && pnpm config set registry https://registry.npmmirror.com \
    && pnpm config set store-dir ${PNPM_STORE_PATH} \
    && pnpm config set fetch-retries 5 \
    && pnpm config set fetch-timeout 600000

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN --mount=type=cache,id=blog-admin-pnpm-store,target=/pnpm/store,sharing=locked \
    pnpm install --frozen-lockfile --prefer-offline --reporter=ndjson || (pnpm config set registry https://mirrors.cloud.tencent.com/npm && pnpm install --frozen-lockfile --prefer-offline --reporter=ndjson)

# 复制源代码
COPY . .

# 构建应用
RUN pnpm --reporter=ndjson run build

# 生产阶段
FROM nginx:alpine@sha256:1a8724a52d432501548a8d8681bb1554c2d09778f8b9ed0882fc3442549980b7

LABEL maintainer="blog-team"
LABEL version="1.0.0"
LABEL description="Blog Admin production runtime"

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置（主配置 + 安全头片段）
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
