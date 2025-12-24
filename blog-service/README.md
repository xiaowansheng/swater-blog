# Blog Service

## 技术栈

- Spring Boot 3.4.0
- Java 21
- MyBatis Plus 3.5.7
- MySQL
- Redis
- RabbitMQ
- Elasticsearch
- Sa-Token 1.38.0

## 环境要求

- JDK 21+
- MySQL 8.0+
- Redis
- RabbitMQ
- Elasticsearch（可选）

## 配置

复制 `application-dev.yml` 并修改数据库、Redis、RabbitMQ 等连接信息。

## 运行

```bash
./gradlew bootRun
```

或指定环境：

```bash
./gradlew bootRun --args='--spring.profiles.active=dev'
```

## 端口

默认端口：8080

## API 文档

启动后访问：http://localhost:8080/swagger-ui.html

