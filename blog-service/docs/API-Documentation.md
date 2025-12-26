# Blog API 文档说明

## 概述

Blog API 是一个功能完整的个人博客系统后端API，提供文章管理、用户认证、评论系统、文件上传等核心功能。

## 技术特性

### 🔒 安全防护
- **多维度限流**: IP、用户、API级别的智能限流
- **SQL注入防护**: 自动检测和阻止SQL注入攻击
- **XSS防护**: 输入内容自动清理和转义
- **数据脱敏**: 敏感信息自动脱敏处理

### 📈 性能监控
- **实时监控**: Prometheus + Grafana监控面板
- **指标收集**: 业务指标和技术指标全面收集
- **健康检查**: 多层次健康状态检查
- **链路追踪**: 分布式请求链路追踪

### 💾 缓存优化
- **多级缓存**: 本地缓存 + Redis分布式缓存
- **智能过期**: 不同业务场景的差异化过期策略
- **缓存预热**: 热点数据预加载
- **缓存穿透防护**: 布隆过滤器防护

### 🔍 搜索功能
- **全文搜索**: Elasticsearch集成
- **智能分词**: 中文分词支持
- **搜索建议**: 自动补全和搜索建议
- **搜索统计**: 搜索行为分析

## API 分组

### 公开接口 (`/api/public/**`)
无需认证即可访问的接口，包括：
- 文章列表和详情
- 分类和标签信息
- 搜索功能
- RSS订阅

### 认证接口 (`/api/auth/**`)
用户认证相关接口：
- 用户登录/登出
- Token刷新
- 用户信息获取

### 管理接口 (`/api/admin/**`)
需要管理员权限的接口：
- 文章管理
- 用户管理
- 系统配置
- 数据统计

### 监控接口 (`/api/monitoring/**`)
系统监控和测试接口：
- 健康检查
- 性能指标
- 安全测试

## 认证机制

### Bearer Token 认证
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 获取Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "123456"
  }'
```

### Token刷新
```bash
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

## 限流策略

### IP限流
- **登录接口**: 5分钟内最多5次尝试
- **公开接口**: 每分钟100次请求
- **搜索接口**: 每分钟50次请求

### 用户限流
- **文章发布**: 每小时最多10篇
- **评论发布**: 每分钟最多5条
- **文件上传**: 每小时最多100个文件

### API限流
- **批量操作**: 每分钟最多10次
- **数据导出**: 每小时最多5次
- **敏感操作**: 每天最多100次

## 响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  },
  "timestamp": 1640995200000
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  },
  "timestamp": 1640995200000
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "参数校验失败",
  "timestamp": 1640995200000
}
```

## 状态码说明

| 状态码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 成功 | 正常请求处理成功 |
| 400 | 请求错误 | 参数校验失败、格式错误 |
| 401 | 未授权 | 未登录或token过期 |
| 403 | 权限不足 | 无权限访问资源 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 429 | 请求过频 | 触发限流策略 |
| 500 | 服务器错误 | 系统内部错误 |

## 使用示例

### 1. 获取文章列表
```bash
curl -X GET "http://localhost:8080/api/public/post/list?page=1&size=10&categoryId=1"
```

### 2. 搜索文章
```bash
curl -X GET "http://localhost:8080/api/public/search?keyword=Spring Boot&type=article"
```

### 3. 发布文章（需要认证）
```bash
curl -X POST http://localhost:8080/api/admin/post \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "文章标题",
    "content": "文章内容",
    "categoryId": 1,
    "tagIds": [1, 2, 3],
    "status": "published"
  }'
```

### 4. 上传文件
```bash
curl -X POST http://localhost:8080/api/admin/file/upload \
  -H "Authorization: Bearer your-token" \
  -F "file=@/path/to/file.jpg"
```

## 开发工具

### Swagger UI
访问地址: http://localhost:8080/swagger-ui.html
- 交互式API文档
- 在线测试功能
- 参数说明和示例

### Postman集合
导入 `docs/api/Blog-API.postman_collection.json` 到Postman：
- 预配置的请求模板
- 环境变量支持
- 自动化测试脚本

### OpenAPI规范
- 完整规范: `docs/api/openapi.json`
- 分组规范: `docs/api/{group}-api.json`
- 支持代码生成工具

## 监控和调试

### 健康检查
```bash
curl http://localhost:8080/actuator/health
```

### 性能指标
```bash
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/prometheus
```

### 限流状态
```bash
curl http://localhost:8080/api/security-test/rate-limit/status
```

### 安全测试
```bash
# 测试SQL注入检测
curl -X POST "http://localhost:8080/api/security-test/sql-injection-check?input=admin' OR 1=1 --"

# 测试数据脱敏
curl -X POST http://localhost:8080/api/security-test/data-masking \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"13812345678"}'
```

## 部署说明

### 环境要求
- Java 21+
- MySQL 8.0+
- Redis 6.0+
- Elasticsearch 8.0+ (可选)
- RabbitMQ 3.8+ (可选)

### 配置文件
- 开发环境: `application-dev.yml`
- 测试环境: `application-test.yml`
- 生产环境: `application-prod.yml`

### Docker部署
```bash
# 构建镜像
docker build -t blog-api:latest .

# 运行容器
docker run -d \
  --name blog-api \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  blog-api:latest
```

## 常见问题

### Q: 如何获取API文档？
A: 启动应用后访问 http://localhost:8080/swagger-ui.html

### Q: Token过期怎么办？
A: 使用refresh token调用 `/api/auth/refresh-token` 接口

### Q: 如何处理限流？
A: 检查响应头中的限流信息，适当降低请求频率

### Q: 上传文件大小限制？
A: 默认限制10MB，可在配置文件中调整

### Q: 如何启用搜索功能？
A: 配置Elasticsearch连接信息，设置 `search.provider.type=elasticsearch`

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 完整的API文档
- 安全防护功能
- 性能监控集成
- 缓存优化实现

## 联系方式

- 项目地址: https://github.com/your-username/blog
- 问题反馈: https://github.com/your-username/blog/issues
- 邮箱: admin@blog.com

## 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件