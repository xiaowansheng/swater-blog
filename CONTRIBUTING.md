# 贡献指南

感谢您对 Swater Blog 项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题
- 使用 [GitHub Issues](../../issues) 报告 bug
- 提供详细的问题描述和复现步骤
- 包含系统环境信息（操作系统、JDK版本等）

### 提交功能请求
- 在 Issues 中描述新功能的需求和用例
- 说明功能的预期行为和价值

### 代码贡献
1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/your-feature-name`
3. 提交更改：`git commit -m 'feat: add some feature'`
4. 推送分支：`git push origin feature/your-feature-name`
5. 创建 Pull Request

## 📝 开发规范

### 代码风格
- 遵循 [开发与本地启动](docs/01-%E5%BC%80%E5%A7%8B/%E5%BC%80%E5%8F%91%E4%B8%8E%E6%9C%AC%E5%9C%B0%E5%90%AF%E5%8A%A8.md) 中的说明和编码规范
- 使用 4 个空格缩进
- 类和方法必须添加 JavaDoc 注释
- 变量和方法使用驼峰命名

### Commit 消息格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

**示例:**
```
feat(post): 添加文章置顶功能

- 添加 isTop 字段到 Post 实体
- 实现置顶排序逻辑
- 更新相关 API 接口

Closes #123
```

### 分支管理
- `main`: 主分支，用于生产环境
- `develop`: 开发分支
- `feature/*`: 功能开发分支
- `bugfix/*`: bug 修复分支
- `hotfix/*`: 紧急修复分支

## 🧪 测试要求

- 新功能必须包含单元测试
- 确保所有测试通过：`./gradlew test`
- 代码覆盖率不低于 80%

## 📚 文档要求

- 新功能需要更新相关文档
- API 变更需要更新接口文档
- 重要配置变更需要更新配置说明

## 🔍 代码审查

所有 Pull Request 都需要经过代码审查：
- 至少一个维护者的批准
- 通过所有自动化检查
- 符合项目的编码规范

## 🚀 发布流程

1. 功能开发完成后合并到 `develop` 分支
2. 在 `develop` 分支进行集成测试
3. 创建 Release 分支进行最终测试
4. 合并到 `main` 分支并打标签
5. 自动部署到生产环境

## 💬 社区交流

- GitHub Issues: 问题报告和功能请求
- GitHub Discussions: 技术讨论和问答
- Email: [维护者邮箱]

## 📄 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](LICENSE) 下授权。

## 🙏 致谢

感谢所有为项目做出贡献的开发者！

---

如有任何问题，请随时通过 Issues 或邮件联系我们。
