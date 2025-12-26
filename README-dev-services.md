# 开发环境基础服务

这个配置提供了博客项目开发所需的基础服务容器。

## 包含的服务

- **MySQL 8.0** - 主数据库
- **Redis 7** - 缓存服务
- **RabbitMQ 3** - 消息队列（带管理界面）
- **Elasticsearch 8.11** - 搜索引擎

## 快速启动

### Windows 用户
```bash
# 启动所有服务
start-dev-services.bat

# 停止所有服务
stop-dev-services.bat
```

### Linux/Mac 用户
```bash
# 启动所有服务
./start-dev-services.sh

# 停止所有服务
./stop-dev-services.sh
```

### 手动启动
```bash
# 启动服务
docker-compose -f docker-compose.dev.yml up -d

# 查看状态
docker-compose -f docker-compose.dev.yml ps

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止服务
docker-compose -f docker-compose.dev.yml down
```

## 服务访问信息

### MySQL
- **地址**: `localhost:3306`
- **数据库**: `blog`
- **用户名**: `blog`
- **密码**: `blog123456`
- **Root密码**: `root123456`

### Redis
- **地址**: `localhost:6379`
- **密码**: 无

### RabbitMQ
- **AMQP地址**: `localhost:5672`
- **管理界面**: http://localhost:15672
- **用户名**: `admin`
- **密码**: `admin123`

### Elasticsearch
- **REST API**: http://localhost:9200
- **集群健康检查**: http://localhost:9200/_cluster/health

## 常用操作

### 查看特定服务日志
```bash
docker-compose -f docker-compose.dev.yml logs -f mysql
docker-compose -f docker-compose.dev.yml logs -f redis
docker-compose -f docker-compose.dev.yml logs -f rabbitmq
docker-compose -f docker-compose.dev.yml logs -f elasticsearch
```

### 重启特定服务
```bash
docker-compose -f docker-compose.dev.yml restart mysql
docker-compose -f docker-compose.dev.yml restart redis
```

### 进入容器
```bash
# 进入 MySQL 容器
docker exec -it blog-mysql-dev mysql -u blog -p

# 进入 Redis 容器
docker exec -it blog-redis-dev redis-cli

# 进入 RabbitMQ 容器
docker exec -it blog-rabbitmq-dev bash
```

### 数据持久化
所有服务的数据都会持久化到 Docker 卷中：
- `mysql_dev_data` - MySQL 数据
- `redis_dev_data` - Redis 数据
- `rabbitmq_dev_data` - RabbitMQ 数据
- `elasticsearch_dev_data` - Elasticsearch 数据

### 完全清理（删除所有数据）
```bash
docker-compose -f docker-compose.dev.yml down -v
```

## 健康检查

所有服务都配置了健康检查，你可以通过以下命令查看服务健康状态：

```bash
docker-compose -f docker-compose.dev.yml ps
```

## 故障排除

### 端口冲突
如果遇到端口冲突，可以修改 `docker-compose.dev.yml` 中的端口映射。

### 内存不足
如果 Elasticsearch 启动失败，可能是内存不足。可以调整 `ES_JAVA_OPTS` 参数：
```yaml
environment:
  - "ES_JAVA_OPTS=-Xms256m -Xmx256m"
```

### 权限问题
在 Linux/Mac 上，如果遇到权限问题，可能需要调整文件权限：
```bash
sudo chown -R $USER:$USER ./
```