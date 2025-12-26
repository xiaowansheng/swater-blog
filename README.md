# Swater Blog 博客系统

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.java.net/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 📖 项目简介

Swater Blog 是一个基于 Spring Boot 3.x 的现代化博客系统，提供完整的文章管理、评论系统、访客统计、实时通知等功能。项目采用前后端分离架构，支持多样化配置和扩展。

## ✨ 特性亮点

- 🚀 **现代化技术栈**: Spring Boot 3.x + JDK 21 + React 18
- 🔧 **高度可配置**: 支持多环境配置，灵活的存储策略
- 📦 **容器化部署**: Docker + Docker Compose 一键部署
- 🔍 **全文搜索**: 集成 Elasticsearch 实现高效搜索
- 📊 **实时监控**: Prometheus + Grafana 监控体系
- 🔐 **安全可靠**: 完善的认证授权和安全防护
- 🎨 **响应式设计**: 支持多端适配的现代化界面

## 🏗️ 项目架构

```
swater-blog/
├── blog-service/          # 后端服务 (Spring Boot)
├── blog-admin/           # 管理后台前端 (React + Ant Design)
├── blog-web/             # 博客前端 (Next.js)
├── docs/                 # 项目文档
├── docker-compose.yml    # Docker 编排文件
└── README.md            # 项目说明
```

## 🛠️ 技术栈

### 后端技术
- **核心框架**: Spring Boot 3.4.0
- **数据库**: MySQL 8.0 + MyBatis-Plus
- **缓存**: Redis 6.0+
- **消息队列**: RabbitMQ 3.12+
- **搜索引擎**: Elasticsearch 8.0+
- **认证授权**: SaToken
- **任务调度**: Quartz
- **API文档**: SpringDoc OpenAPI 3.0

### 前端技术
- **管理后台**: React 18 + Ant Design + TypeScript
- **博客前端**: Next.js + Tailwind CSS
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **富文本编辑**: MD Editor

### 运维技术
- **容器化**: Docker + Docker Compose
- **监控**: Prometheus + Grafana + Micrometer
- **构建工具**: Gradle (Kotlin DSL)
- **CI/CD**: GitHub Actions

## 🚀 快速开始

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/your-username/swater-blog.git
cd swater-blog

# 2. 启动所有服务
docker-compose up -d

# 3. 等待服务启动完成，访问应用
# 博客前端: http://localhost:3000
# 管理后台: http://localhost:3001  
# API文档: http://localhost:8080/swagger-ui.html
```

### 方式二：本地开发

#### 环境要求
- JDK 21+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+
- RabbitMQ 3.12+
- Elasticsearch 8.0+

#### 启动步骤

1. **准备数据库**
```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE blog DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **启动后端服务**
```bash
cd blog-service
# 修改配置文件 src/main/resources/application-dev.yml
./gradlew bootRun
```

3. **启动管理后台**
```bash
cd blog-admin
npm install
npm run dev
```

4. **启动博客前端**
```bash
cd blog-web  
npm install
npm run dev
```

## 📚 文档导航

| 文档类型 | 链接 | 描述 |
|---------|------|------|
| 🏗️ 系统设计 | [系统设计文档](docs/design/系统设计文档.md) | 整体架构和设计思路 |
| 🗄️ 数据库设计 | [数据库设计文档](docs/design/数据库设计文档.md) | 数据表结构和关系 |
| 🔌 接口文档 | [接口设计文档](docs/design/接口设计文档.md) | API 接口说明 |
| 🛠️ 开发指南 | [开发指南](docs/tech/开发指南.md) | 开发环境搭建和规范 |
| ⚙️ 配置说明 | [配置说明文档](docs/tech/配置说明文档.md) | 详细配置参数说明 |
| 🚀 部署指南 | [部署文档](docs/tech/部署文档.md) | 生产环境部署指南 |
| 🤝 贡献指南 | [CONTRIBUTING.md](CONTRIBUTING.md) | 如何参与项目贡献 |

## 🎯 功能特性

### 核心功能
- ✅ **文章管理**: 支持 Markdown 编辑，分类标签，定时发布
- ✅ **评论系统**: 多级评论，邮件通知，垃圾评论过滤  
- ✅ **用户系统**: 角色权限管理，OAuth 登录集成
- ✅ **文件管理**: 本地存储/OSS，图片压缩优化
- ✅ **搜索功能**: Elasticsearch 全文搜索，高亮显示

### 管理功能  
- ✅ **数据统计**: 访问量统计，用户行为分析
- ✅ **系统监控**: 性能监控，健康检查，日志管理
- ✅ **配置管理**: 动态配置，主题切换，SEO 优化
- ✅ **备份恢复**: 数据备份，一键恢复

### 扩展功能
- ✅ **多主题支持**: 响应式设计，暗黑模式
- ✅ **国际化**: 多语言支持，本地化适配  
- ✅ **插件系统**: 可扩展的插件架构
- ✅ **API 开放**: RESTful API，支持第三方集成

## 🤝 参与贡献

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

### 贡献方式
- 🐛 报告 Bug
- 💡 提出新功能建议  
- 📝 改进文档
- 💻 提交代码
- 🌍 翻译项目

### 开发者
感谢所有为项目做出贡献的开发者！

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

- [Spring Boot](https://spring.io/projects/spring-boot) - 强大的 Java 框架
- [React](https://reactjs.org/) - 优秀的前端框架
- [Ant Design](https://ant.design/) - 企业级 UI 设计语言
- [Elasticsearch](https://www.elastic.co/) - 分布式搜索引擎

## 📞 联系我们

- 📧 邮箱: [your-email@example.com]
- 💬 讨论: [GitHub Discussions](../../discussions)
- 🐛 问题: [GitHub Issues](../../issues)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！

