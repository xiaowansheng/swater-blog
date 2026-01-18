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
./gradlew bootRun --args='--spring.profiles.active=dev'
```

## Docker 启动（从项目根目录执行）

```bash
docker-compose -f docker-compose.env.yml up -d mysql redis rabbitmq
```

如果希望使用后端容器启动：
```bash
docker-compose -f docker-compose.dev.yml up -d
```

## 端口

默认端口：`8888`

## API 文档

启动后访问：`http://localhost:8888/swagger-ui.html`

