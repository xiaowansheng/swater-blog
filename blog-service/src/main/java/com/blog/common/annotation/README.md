# API资源自动初始化注解使用说明

## 概述

本文档介绍了如何使用 `@ApiResource` 和 `@ApiOperation` 注解来自动初始化接口权限数据，实现权限控制的自动化管理。

## 注解说明

### 1. @ApiResource 注解

**用途**: 标注在控制器类上，定义模块级别的资源信息

**位置**: 类级别注解

**主要属性**:
- `value`: 资源唯一标识（必填）
- `name`: 资源显示名称
- `type`: 资源类型（MENU/API/BOTH）
- `path`: 资源路径
- `icon`: 菜单图标
- `sort`: 排序值
- `parentId`: 父级资源ID
- `perms`: 权限标识
- `status`: 资源状态
- `visible`: 是否可见
- `cache`: 是否缓存
- `description`: 资源描述
- `autoInit`: 是否启用自动初始化

**示例**:
```java
@RestController
@RequestMapping("/admin/article")
@ApiResource(
    value = "article",
    name = "文章管理",
    type = ApiResource.ResourceType.BOTH,
    path = "/admin/article",
    icon = "el-icon-document",
    sort = 100,
    description = "文章管理模块，包含文章的增删改查操作"
)
public class ArticleController {
    // 控制器方法...
}
```

### 2. @ApiOperation 注解

**用途**: 标注在控制器方法上，定义方法级别的操作信息

**位置**: 方法级别注解

**主要属性**:
- `value`: 操作唯一标识（必填）
- `name`: 操作显示名称
- `type`: 操作类型（CREATE/UPDATE/DELETE/QUERY等）
- `method`: HTTP请求方法（GET/POST/PUT/DELETE等）
- `path`: 接口路径
- `perms`: 权限标识
- `status`: 操作状态
- `requireAuth`: 是否需要权限验证
- `requireRole`: 是否需要角色验证
- `description`: 操作描述
- `group`: 操作分组
- `autoInit`: 是否启用自动初始化

**示例**:
```java
@PostMapping
@ApiOperation(
    value = "create",
    name = "创建文章",
    type = ApiOperationType.CREATE,
    method = ApiOperation.HttpMethod.POST,
    path = "",
    perms = "system:article:create",
    description = "创建新的文章",
    group = "创建操作"
)
public Result<ArticleDto> createArticle(@RequestBody ArticleReq articleReq) {
    // 创建文章逻辑...
}
```

## 使用流程

### 1. 在控制器类上添加 @ApiResource 注解

```java
@RestController
@RequestMapping("/admin/user")
@ApiResource(
    value = "user",
    name = "用户管理",
    type = ApiResource.ResourceType.BOTH,
    path = "/admin/user",
    icon = "el-icon-user",
    sort = 200
)
public class UserController {
    // 控制器方法...
}
```

### 2. 在控制器方法上添加 @ApiOperation 注解

```java
@GetMapping("/list")
@ApiOperation(
    value = "list",
    name = "获取用户列表",
    type = ApiOperationType.QUERY,
    method = ApiOperation.HttpMethod.GET,
    perms = "system:user:list"
)
public Result<List<UserDto>> getUserList() {
    // 获取用户列表逻辑...
}
```

### 3. 系统自动扫描并初始化

应用启动时，系统会自动扫描所有带有这些注解的控制器，并：
- 创建系统菜单节点（如果type包含MENU）
- 创建系统API资源节点（如果type包含API）
- 生成权限标识
- 建立权限控制基础数据

## 权限标识生成规则

### 自动生成规则
如果未在注解中指定 `perms` 属性，系统会自动生成权限标识：

**控制器级别**: `system:{value}:menu` 或 `system:{value}:api`
**方法级别**: `system:{value}:{operation}`

**示例**:
- 控制器 `@ApiResource(value = "article")` → `system:article:menu`
- 方法 `@ApiOperation(value = "create")` → `system:article:create`

### 手动指定规则
可以在注解中直接指定 `perms` 属性来自定义权限标识：

```java
@ApiOperation(
    value = "create",
    perms = "article:create:write"  // 自定义权限标识
)
```

## 配置选项

### 自动初始化配置
在 `application.yml` 中配置自动初始化相关参数：

```yaml
blog:
  api:
    auto-init:
      enabled: true                    # 是否启用自动初始化
      force-update: false              # 是否强制更新已存在的资源
      auto-startup: true               # 是否在启动时自动执行
      verbose-logging: false           # 是否记录详细日志
      continue-on-error: true          # 是否跳过错误继续执行
```

### 禁用自动初始化
如果某个资源不需要自动初始化，可以设置 `autoInit = false`：

```java
@ApiResource(
    value = "temp",
    autoInit = false  // 禁用自动初始化
)
```

## 最佳实践

### 1. 命名规范
- `value`: 使用英文小写，用连字符分隔（如：user-management）
- `name`: 使用中文描述，清晰表达功能
- `perms`: 遵循 `模块:资源:操作` 的命名规范

### 2. 资源类型选择
- `MENU`: 纯菜单资源，不包含API接口
- `API`: 纯API资源，不显示在菜单中
- `BOTH`: 既是菜单又是API，推荐使用

### 3. 权限标识设计
- 保持权限标识的层次性和可读性
- 避免过于复杂的权限标识
- 考虑权限的继承关系

### 4. 错误处理
- 在自动初始化失败时，系统会记录错误日志
- 可以通过管理接口手动触发重新初始化
- 建议在开发环境中启用详细日志

## 注意事项

1. **注解扫描**: 确保控制器类被Spring容器管理
2. **路径配置**: 注意控制器路径和方法路径的组合
3. **权限冲突**: 避免权限标识重复
4. **性能考虑**: 大量接口时，初始化可能需要一定时间
5. **数据一致性**: 手动修改数据库中的权限数据可能被自动初始化覆盖

## 故障排除

### 常见问题

1. **注解未生效**
   - 检查控制器是否被Spring扫描到
   - 确认注解属性配置正确

2. **权限数据未创建**
   - 检查自动初始化是否启用
   - 查看启动日志中的错误信息

3. **路径不正确**
   - 检查控制器和方法的路径配置
   - 确认路径拼接逻辑

### 调试建议

1. 启用详细日志记录
2. 使用管理接口手动触发初始化
3. 检查数据库中的权限数据
4. 验证注解配置的正确性

## 总结

通过使用 `@ApiResource` 和 `@ApiOperation` 注解，可以实现：

- **自动化权限管理**: 减少手动配置权限的工作量
- **统一权限规范**: 建立标准的权限标识体系
- **快速权限部署**: 新接口自动获得权限控制
- **权限数据一致性**: 避免手动配置导致的错误

这些注解为权限管理系统提供了强大的自动化能力，大大简化了权限配置的复杂度。
