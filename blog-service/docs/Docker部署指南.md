# Blog服务Docker部署指南

## 概述

本指南详细介绍如何使用Docker容器化部署Blog服务，包括完整的服务栈配置、部署流程和运维管理。

## 架构概览

### 服务组件

```
┌─────────────────────────────────────────────────────────────┐
│                        Nginx (反向代理)                      │
│                     Port: 80, 443                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                   Blog Application                         │
│                     Port: 8888                             │
│                   (Spring Boot)                            │
└─┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┘
  │         │         │         │         │         │
┌─▼─┐   ┌─▼─┐   ┌───▼───┐   ┌─▼─┐   ┌───▼───┐   ┌─▼─┐
│MySQL│ │Redis│ │RabbitMQ│ │ES │ │Monitor│ │Log│
│3306 │ │6379 │ │  5672  │ │9200│ │ Stack │ │...│
└───┘   └───┘   └───────┘   └───┘   └───────┘   └───┘
```

### 容器清单

| 服务 | 镜像 | 端口 | 说明 |
|------|------|------|------|
| blog-service | 自构建 | 8888 | 主应用服务 |
| mysql | mysql:8.0 | 3306 | 数据库 |
| redis | redis:7-alpine | 6379 | 缓存 |
| rabbitmq | rabbitmq:3-management | 5672, 15672 | 消息队列 |
| elasticsearch | elasticsearch:8.11.0 | 9200, 9300 | 搜索引擎 |
| nginx | nginx:alpine | 80, 443 | 反向代理 |

## 快速开始

### 1. 环境准备

#### 系统要求
- Docker 20.10+
- Docker Compose 2.0+
- 可用内存: 4GB+
- 可用磁盘: 10GB+

#### 安装Docker (Ubuntu)
```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加Docker仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加用户到docker组
sudo usermod -aG docker $USER
```

#### 安装Docker (Windows)
1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 启动Docker Desktop
3. 确保启用WSL2后端（推荐）

### 2. 项目准备

```bash
# 克隆项目
git clone <repository-url>
cd blog-service

# 确保脚本可执行
chmod +x docker/entrypoint.sh
```

### 3. 一键部署

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs
```

### 4. 验证部署

访问以下地址验证服务：

- **应用主页**: http://localhost
- **API文档**: http://localhost/swagger-ui.html
- **健康检查**: http://localhost/actuator/health
- **RabbitMQ管理**: http://localhost:15672 (blog/blog123456)
- **Elasticsearch**: http://localhost:9200

## 详细配置

### 环境变量配置

创建或修改 `.env` 文件：

```env
# 项目配置
COMPOSE_PROJECT_NAME=blog
ENVIRONMENT=production
APP_VERSION=1.0.0

# 数据库配置
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_DATABASE=blog
MYSQL_USER=blog
MYSQL_PASSWORD=your-secure-password

# Redis配置
REDIS_PASSWORD=your-redis-password

# RabbitMQ配置
RABBITMQ_DEFAULT_USER=blog
RABBITMQ_DEFAULT_PASS=your-rabbitmq-password

# 应用配置
SPRING_PROFILES_ACTIVE=docker
SA_TOKEN_JWT_SECRET=your-jwt-secret-key

# JVM配置
JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC
JVM_XMS=1g
JVM_XMX=2g

# 安全配置
SECURITY_FILE_UPLOAD_MAX_SIZE=20MB

# 功能开关
SPRINGDOC_SWAGGER_UI_ENABLED=true
NOTIFICATION_EMAIL_ENABLED=true
NOTIFICATION_WEBSOCKET_ENABLED=true
```

### 数据持久化

数据卷配置：

```yaml
volumes:
  mysql_data:          # MySQL数据
  redis_data:          # Redis数据
  rabbitmq_data:       # RabbitMQ数据
  elasticsearch_data:  # Elasticsearch数据
  blog_logs:           # 应用日志
  blog_uploads:        # 上传文件
  nginx_logs:          # Nginx日志
```

### 网络配置

自定义网络：

```yaml
networks:
  blog-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## Docker Compose 常用命令

```bash
# 构建镜像
docker-compose build

# 启动服务（前台）
docker-compose up

# 启动服务（后台）
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs [service-name]
```

## 生产环境配置

### 1. 安全加固

#### SSL/TLS配置
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

#### 数据库安全
```yaml
environment:
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
  MYSQL_PASSWORD: ${MYSQL_PASSWORD}
  # 禁用远程root登录
  MYSQL_ROOT_HOST: localhost
```

#### Redis安全
```conf
# 启用密码认证
requirepass ${REDIS_PASSWORD}

# 禁用危险命令
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
```

### 2. 性能优化

#### JVM调优
```env
JAVA_OPTS=-Xms2g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication
```

#### MySQL调优
```cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 500
query_cache_size = 128M
```

#### Redis调优
```conf
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### 3. 监控配置

启用完整监控栈：

```bash
# 启动监控服务
docker-compose -f docker-compose-monitoring.yml up -d

# 访问监控界面
# Grafana: http://localhost:3000
# Prometheus: http://localhost:9090
# AlertManager: http://localhost:9093
```

## 运维管理

### 日志管理

#### 查看实时日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f blog-service

# 查看最近100行日志
docker-compose logs --tail=100 blog-service
```

#### 日志轮转配置
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "3"
```

### 数据备份

#### 自动备份
```bash
# 创建备份
# 建议使用 mysqldump/redis-cli 等方式自行编排备份任务
```

#### 手动备份
```bash
# MySQL备份
docker-compose exec mysql mysqldump -u blog -p blog > backup.sql

# Redis备份
docker-compose exec redis redis-cli BGSAVE
docker cp blog_redis_1:/data/dump.rdb ./redis-backup.rdb

# 文件备份
tar -czf uploads-backup.tar.gz uploads/
```

### 数据恢复

```bash
# MySQL恢复
docker-compose exec -T mysql mysql -u blog -p blog < backup.sql

# Redis恢复
docker-compose stop redis
docker cp redis-backup.rdb blog_redis_1:/data/dump.rdb
docker-compose start redis
```

### 扩容配置

#### 水平扩容
```bash
# 扩容应用实例
docker-compose up -d --scale blog-service=3

# 负载均衡配置
upstream blog_backend {
    server blog-service_1:8888;
    server blog-service_2:8888;
    server blog-service_3:8888;
}
```

#### 垂直扩容
```yaml
services:
  blog-service:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G
```

## 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 查看详细错误信息
docker-compose logs blog-service

# 检查容器状态
docker-compose ps

# 进入容器调试
docker-compose exec blog-service bash
```

#### 2. 数据库连接失败
```bash
# 检查MySQL状态
docker-compose exec mysql mysqladmin ping

# 检查网络连接
docker-compose exec blog-service nc -zv mysql 3306

# 查看数据库日志
docker-compose logs mysql
```

#### 3. 内存不足
```bash
# 查看资源使用情况
docker stats

# 调整JVM内存
export JAVA_OPTS="-Xms512m -Xmx1024m"
```

#### 4. 端口冲突
```bash
# 检查端口占用
netstat -tulpn | grep :8888

# 修改端口映射
ports:
  - "8081:8888"
```

### 性能调优

#### 1. 应用性能
- 调整JVM参数
- 优化数据库连接池
- 启用缓存
- 配置异步处理

#### 2. 数据库性能
- 添加索引
- 优化查询
- 调整缓冲区大小
- 启用查询缓存

#### 3. 缓存性能
- 调整Redis内存策略
- 优化缓存键设计
- 配置缓存过期策略

## 安全最佳实践

### 1. 容器安全
- 使用非root用户运行
- 最小化镜像体积
- 定期更新基础镜像
- 扫描安全漏洞

### 2. 网络安全
- 使用内部网络
- 限制端口暴露
- 配置防火墙规则
- 启用SSL/TLS

### 3. 数据安全
- 加密敏感数据
- 定期备份
- 访问控制
- 审计日志

### 4. 运行时安全
- 资源限制
- 健康检查
- 监控告警
- 应急响应

## 更新升级

### 应用更新
```bash
# 拉取最新代码
git pull origin main

# 重新构建并部署
docker-compose pull
docker-compose up -d --build
```

### 依赖更新
```bash
# 更新基础镜像
docker-compose pull

# 重启服务
docker-compose restart
```

### 滚动更新
```bash
# 逐个更新实例
docker-compose up -d --no-deps --scale blog-service=2 blog-service
docker-compose up -d --no-deps --scale blog-service=1 blog-service
```

## 总结

本部署指南提供了完整的Docker容器化部署方案，包括：

1. **完整的服务栈**: 应用、数据库、缓存、消息队列、搜索引擎
2. **自动化部署**: 一键部署脚本，支持多环境
3. **生产就绪**: 安全配置、性能优化、监控告警
4. **运维友好**: 日志管理、数据备份、故障排除
5. **可扩展性**: 水平扩容、负载均衡、高可用

通过遵循本指南，可以快速部署一个稳定、安全、高性能的Blog服务。
