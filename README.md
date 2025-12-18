# Swater Blog 博客系统

## 项目简介

Swater Blog 是一个基于 Spring Boot 3.x 的现代化博客系统，提供完整的文章管理、评论系统、访客统计、实时通知等功能。

## 技术栈

- **JDK**: 21
- **框架**: Spring Boot 3.x
- **ORM**: MyBatis-Plus
- **数据库**: MySQL
- **缓存**: Redis
- **消息队列**: RabbitMQ
- **搜索引擎**: Elasticsearch
- **认证授权**: SaToken
- **定时任务**: Quartz
- **实时通信**: WebSocket
- **API文档**: Swagger
- **数据校验**: Hibernate Validator
- **构建工具**: Gradle (Kotlin DSL)

## 项目结构

```
blog/              # 后端服务
blog-admin/        # 管理后台前端
blog-web/          # 博客前端
docs/              # 文档目录
```

## 快速开始

### 环境要求

- JDK 21+
- MySQL 8.0+
- Redis 6.0+
- RabbitMQ 3.12+
- Elasticsearch 8.0+
- Gradle 8.0+

### 启动步骤

1. 克隆项目
```bash
git clone <repository-url>
cd swater-blog
```

2. 配置数据库
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 修改配置文件
```bash
# 编辑 src/main/resources/application-dev.yml
# 配置数据库、Redis、RabbitMQ等连接信息
```

4. 启动服务
```bash
cd blog
./gradlew bootRun
```

5. 访问接口文档
```
http://localhost:8080/swagger-ui.html
```

## 文档

- [系统设计文档](docs/design/系统设计文档.md)
- [数据库设计文档](docs/design/数据库设计文档.md)
- [接口设计文档](docs/design/接口设计文档.md)
- [技术架构文档](docs/tech/技术架构文档.md)
- [配置说明文档](docs/tech/配置说明文档.md)
- [部署文档](docs/tech/部署文档.md)
- [开发指南](docs/tech/开发指南.md)

## 功能特性

- ✅ 文章管理（分类、标签、归档）
- ✅ 说说功能（富文本）
- ✅ 评论系统
- ✅ 友链管理
- ✅ 访客统计（IP定位、地理位置）
- ✅ 操作日志记录
- ✅ 异常日志记录
- ✅ 用户权限管理
- ✅ 接口资源授权
- ✅ 文件上传管理
- ✅ 配置管理
- ✅ 实时通知（WebSocket）
- ✅ 邮件通知
- ✅ 全文搜索（Elasticsearch）
- ✅ 数据可视化统计

## 许可证

MIT License

