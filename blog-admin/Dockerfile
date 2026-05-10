# ========================================
# 多阶段构建 Dockerfile for Blog Admin
# 第一阶段：构建 React 应用
# 第二阶段：Nginx 服务静态文件
# ========================================

# 构建阶段
FROM node:20-alpine AS builder

LABEL stage=builder
LABEL maintainer="blog-team"
LABEL description="Blog Admin build stage"

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
ARG VITE_API_BASE_URL=/api
ARG VITE_WS_BASE_URL=
ARG VITE_UPLOAD_URL=/api/upload
ARG VITE_UPLOAD_RESOURCE_PREFIX=/uploads
ARG VITE_UPLOAD_MAX_SIZE=10485760
ARG VITE_APP_TITLE=博客管理系统
ARG VITE_APP_VERSION=1.0.0
ARG VITE_STORAGE_PREFIX=blog_admin_
ARG VITE_MOCK_ENABLED=false
ARG VITE_BLOG_URL=https://blog.example.com
ARG VITE_GITHUB_URL=https://github.com/xiaowansheng/swater-blog

ENV NODE_ENV=production \
    VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_WS_BASE_URL=${VITE_WS_BASE_URL} \
    VITE_UPLOAD_URL=${VITE_UPLOAD_URL} \
    VITE_UPLOAD_RESOURCE_PREFIX=${VITE_UPLOAD_RESOURCE_PREFIX} \
    VITE_UPLOAD_MAX_SIZE=${VITE_UPLOAD_MAX_SIZE} \
    VITE_APP_TITLE=${VITE_APP_TITLE} \
    VITE_APP_VERSION=${VITE_APP_VERSION} \
    VITE_STORAGE_PREFIX=${VITE_STORAGE_PREFIX} \
    VITE_MOCK_ENABLED=${VITE_MOCK_ENABLED} \
    VITE_BLOG_URL=${VITE_BLOG_URL} \
    VITE_GITHUB_URL=${VITE_GITHUB_URL}

# 构建应用
RUN pnpm --reporter=ndjson run build

# 生产阶段
FROM nginx:alpine

LABEL maintainer="blog-team"
LABEL version="1.0.0"
LABEL description="Blog Admin production runtime"

# 复制构建产物到 nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
