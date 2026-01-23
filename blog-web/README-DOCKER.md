# Blog Web 单独部署指南

本文档说明如何单独部署 Blog Web 前端应用。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 后端服务已部署并可访问

## 🚀 快速启动

### 方式一：仅启动 Next.js 应用（推荐）

```bash
# 进入 blog-web 目录
cd blog-web

# 复制环境变量文件
cp .env.docker .env

# 修改 .env 文件，配置后端 API 地址
# NEXT_PUBLIC_API_URL=http://your-backend-api:8888

# 启动服务（不包含 nginx）
docker-compose up -d blog-web

# 查看日志
docker-compose logs -f blog-web
```

访问地址：http://localhost:3000

### 方式二：启动 Next.js + Nginx 代理

```bash
# 进入 blog-web 目录
cd blog-web

# 复制环境变量文件
cp .env.docker .env

# 修改 .env 文件
# WEB_PORT=3000
# NGINX_HTTP_PORT=80
# NEXT_PUBLIC_API_URL=http://your-backend-api:8888

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问地址：
- Nginx 代理：http://localhost:80
- 直接访问：http://localhost:3000

## 🔧 配置说明

### 环境变量（.env.docker）

```env
# Web 应用端口
WEB_PORT=3000

# Nginx 端口
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# 后端 API 地址（重要！）
NEXT_PUBLIC_API_URL=http://localhost:8888

# 其他配置
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### Nginx 配置（nginx-web.conf）

这是一个可以直接放到 `/etc/nginx/conf.d/` 目录下的独立配置文件。

主要功能：
- upstream 定义
- 反向代理到 Next.js 应用
- Gzip 压缩
- 静态资源缓存
- WebSocket 支持
- 安全头设置
- HTTPS 配置（注释状态）

**使用方式**：
```bash
# 复制到 nginx 配置目录
cp blog-web/nginx-web.conf /etc/nginx/conf.d/blog-web.conf

# 修改域名
vim /etc/nginx/conf.d/blog-web.conf

# 测试并重载
nginx -t && nginx -s reload
```

## 📦 构建镜像

```bash
# 构建镜像
docker-compose build

# 或使用 Docker 直接构建
docker build -t blog-web:latest .
```

## 🔍 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps

# 进入容器
docker-compose exec blog-web sh

# 重新构建并启动
docker-compose up -d --build
```

## 🌐 生产环境部署

### 1. 配置域名

修改 `nginx.conf`，将 `server_name _;` 改为你的域名：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    # ...
}
```

### 2. 配置 HTTPS

1. 准备 SSL 证书文件
2. 创建 `ssl` 目录并放入证书
3. 取消 `nginx.conf` 中 HTTPS 配置的注释
4. 修改 `docker-compose.yml` 挂载 SSL 目录

### 3. 配置后端 API

确保 `.env.production` 文件中配置了正确的后端 API 地址：

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### 4. 性能优化

- 启用 CDN 加速静态资源
- 配置 Redis 缓存（如果后端支持）
- 调整 Nginx 缓存策略
- 使用 HTTP/2

## 🐛 故障排查

### 无法访问应用

```bash
# 检查容器状态
docker-compose ps

# 查看容器日志
docker-compose logs blog-web

# 检查端口占用
netstat -ano | findstr :3000
```

### API 请求失败

1. 检查 `NEXT_PUBLIC_API_URL` 配置
2. 确认后端服务可访问
3. 检查网络连接
4. 查看浏览器控制台错误

### 构建失败

```bash
# 清理缓存重新构建
docker-compose build --no-cache

# 检查 Dockerfile 和依赖
```

## 📝 注意事项

1. **环境变量**：Next.js 的环境变量在构建时注入，修改后需要重新构建镜像
2. **端口冲突**：确保配置的端口未被占用
3. **网络连接**：确保容器能访问后端服务
4. **资源限制**：生产环境建议配置内存和 CPU 限制

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Docker 文档](https://docs.docker.com/)
- [Nginx 文档](https://nginx.org/en/docs/)
