# Blog Admin 单独部署指南

本文档说明如何单独部署 Blog Admin 管理后台应用。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 后端服务已部署并可访问

## 🚀 快速启动

### 方式一：仅启动 Admin 应用（推荐）

```bash
# 进入 blog-admin 目录
cd blog-admin

# 复制环境变量文件
cp .env.docker .env

# 修改 .env.production 文件，配置后端 API 地址
# VITE_API_BASE_URL=http://your-backend-api:8888

# 启动服务（不包含额外的 nginx 代理层）
docker-compose up -d blog-admin

# 查看日志
docker-compose logs -f blog-admin
```

访问地址：http://localhost:3001

### 方式二：启动 Admin + Nginx 代理层

```bash
# 进入 blog-admin 目录
cd blog-admin

# 复制环境变量文件
cp .env.docker .env

# 修改 .env 文件
# ADMIN_PORT=3001
# NGINX_HTTP_PORT=80
# VITE_API_BASE_URL=http://your-backend-api:8888

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问地址：
- Nginx 代理：http://localhost:80
- 直接访问：http://localhost:3001

## 🔧 配置说明

### 环境变量（.env.docker）

```env
# Admin 应用端口
ADMIN_PORT=3001

# Nginx 端口（如果使用额外的代理层）
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# 后端 API 地址（重要！需要在构建前配置到 .env.production）
VITE_API_BASE_URL=http://localhost:8888

# 其他配置
NODE_ENV=production
```

### Nginx 配置

#### nginx-admin.conf

这是一个可以直接放到 `/etc/nginx/conf.d/` 目录下的独立配置文件。

主要功能：
- upstream 定义
- 反向代理到 blog-admin 容器
- Gzip 压缩
- 静态资源缓存
- API 代理配置
- 文件上传支持
- 安全头设置
- HTTPS 配置（注释状态）

**使用方式**：
```bash
# 复制到 nginx 配置目录
cp blog-admin/nginx-admin.conf /etc/nginx/conf.d/blog-admin.conf

# 修改域名
vim /etc/nginx/conf.d/blog-admin.conf

# 测试并重载
nginx -t && nginx -s reload
```

## 📦 构建镜像

```bash
# 确保 .env.production 已配置正确的 API 地址
# VITE_API_BASE_URL=http://your-backend-api:8888

# 构建镜像
docker-compose build

# 或使用 Docker 直接构建
docker build -t blog-admin:latest .
```

**重要提示**：Vite 应用的环境变量在构建时注入，修改 API 地址后必须重新构建镜像！

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
docker-compose exec blog-admin sh

# 重新构建并启动
docker-compose up -d --build
```

## 🌐 生产环境部署

### 1. 配置后端 API

**在构建前**修改 `.env.production` 文件：

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

### 2. 配置域名

如果使用额外的 Nginx 代理层，修改 `nginx-proxy.conf`：

```nginx
server {
    listen 80;
    server_name admin.your-domain.com;
    # ...
}
```

### 3. 配置 HTTPS

1. 准备 SSL 证书文件
2. 创建 `ssl` 目录并放入证书
3. 取消 `nginx-proxy.conf` 中 HTTPS 配置的注释
4. 修改 `docker-compose.yml` 挂载 SSL 目录

### 4. 安全配置

- 配置防火墙规则
- 启用 HTTPS
- 设置强密码策略
- 配置访问日志
- 定期备份数据

### 5. 性能优化

- 启用 CDN 加速静态资源
- 配置浏览器缓存
- 使用 HTTP/2
- 压缩静态资源

## 🐛 故障排查

### 无法访问应用

```bash
# 检查容器状态
docker-compose ps

# 查看容器日志
docker-compose logs blog-admin

# 检查端口占用
netstat -ano | findstr :3001
```

### API 请求失败

1. **检查 API 地址配置**
   - 查看 `.env.production` 文件
   - 确认构建时使用了正确的配置

2. **重新构建镜像**
   ```bash
   # 修改 .env.production 后必须重新构建
   docker-compose build --no-cache blog-admin
   docker-compose up -d blog-admin
   ```

3. **检查网络连接**
   ```bash
   # 进入容器测试网络
   docker-compose exec blog-admin sh
   wget http://your-backend-api:8888/api/health
   ```

4. **查看浏览器控制台**
   - 检查 API 请求地址是否正确
   - 查看 CORS 错误

### 构建失败

```bash
# 清理缓存重新构建
docker-compose build --no-cache

# 检查依赖安装
docker-compose run --rm blog-admin pnpm install

# 检查构建日志
docker-compose build 2>&1 | tee build.log
```

### 页面空白或路由错误

1. 检查 Nginx 配置中的 `try_files` 指令
2. 确认 SPA 路由配置正确
3. 查看浏览器控制台错误

## 📝 注意事项

1. **环境变量时机**：Vite 的环境变量在构建时注入，修改后必须重新构建镜像
2. **端口冲突**：确保配置的端口未被占用
3. **网络连接**：确保容器能访问后端服务
4. **文件上传**：注意 `client_max_body_size` 配置，默认 50M
5. **跨域问题**：确保后端配置了正确的 CORS 策略

## 🔄 更新部署

```bash
# 1. 拉取最新代码
git pull

# 2. 修改配置（如果需要）
vim .env.production

# 3. 重新构建镜像
docker-compose build --no-cache

# 4. 停止旧容器
docker-compose down

# 5. 启动新容器
docker-compose up -d

# 6. 查看日志确认启动成功
docker-compose logs -f
```

## 🔗 相关链接

- [Vite 文档](https://vitejs.dev/)
- [React 文档](https://react.dev/)
- [Ant Design 文档](https://ant.design/)
- [Docker 文档](https://docs.docker.com/)
- [Nginx 文档](https://nginx.org/en/docs/)
