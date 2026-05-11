# Blog Service

后端服务模块，提供 API、认证、评论、统计、文件管理等核心能力。

## 技术栈

- Spring Boot 3.4.0
- Java 21
- MyBatis Plus 3.5.7
- MySQL / Redis / RabbitMQ
- Elasticsearch（可选，当前默认禁用）
- Sa-Token 1.38.0

## 环境要求

- JDK 21+
- MySQL 8.0+
- Redis
- RabbitMQ
- Elasticsearch（可选）

## 配置

开发环境配置在 `src/main/resources/application-dev.yml`，请按实际环境修改连接信息。

## 开发运行

```bash
set -a
source ../.env
set +a
./gradlew bootRun --args='--spring.profiles.active=dev'
```

如果通过 IDE 直接启动，也需要把根目录 `.env` 中的关键变量注入运行环境，尤其是 `DB_*`、`JWT_SECRET_KEY` 和 `AUTH_EMAIL_SESSION_SECRET`。

## Docker 启动（从项目根目录执行）

```bash
docker compose -f docker-compose.env.yml up -d mysql redis rabbitmq
```

如果希望使用后端容器启动：
```bash
docker compose -f docker-compose.dev.yml up -d
```

## 端口

默认端口：`8888`

## API 文档

启动后访问：`http://localhost:8888/swagger-ui.html`

## 相关文档

- [Blog API 文档说明](./docs/API-Documentation.md)
- [测试指南](./docs/testing-guide.md)
- [开发与本地启动](../docs/01-开始/开发与本地启动.md)
- [后端配置参考](../docs/03-开发参考/后端配置参考.md)

