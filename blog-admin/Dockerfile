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

# 复制 package 文件
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm@8

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

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
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
