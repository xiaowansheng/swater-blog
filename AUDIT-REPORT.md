# Swater Blog 项目架构审核报告

> 首次审核日期：2026-08-06
> 最近复核日期：2026-08-10
> 审核范围：全栈架构、代码质量、安全性、部署配置

---

## 一、项目概览

Swater Blog 是一个前后端分离的个人博客系统，技术栈如下：

| 层级 | 技术 | 说明 |
|------|------|------|
| 管理后台 (blog-admin) | React 18 + TypeScript + Vite + Ant Design + Zustand | SPA 管理后台 |
| 博客前台 (blog-web) | Next.js 16.1 + React 19 + TypeScript + Tailwind CSS 4 | App Router SSR 博客前台 |
| 后端服务 (blog-service) | Spring Boot 3 + JDK 21 + MyBatis-Plus + Sa-Token | REST API 服务 |

---

## 二、前端架构审核

### 2.1 管理后台 (blog-admin)

#### 整体结构

```
blog-admin/src/
├── api/            # API 请求层（按模块拆分，约 20 个模块）
├── components/     # 公共组件（Chart、article、common、config、talk）
├── config/         # 配置文件（routes.ts 路由配置、vditor 编辑器）
├── hooks/          # 自定义 Hooks（自动保存、自动锁屏、WebSocket、页面缓存）
├── layout/         # 布局组件（BasicLayout、Header、Sidebar、Tabs）
├── pages/          # 页面组件（按业务模块拆分，约 30+ 页面）
├── router/         # 路由配置
├── store/          # 状态管理（Zustand: auth、tabs、websocket、notification、lockscreen）
├── styles/         # 全局样式
├── types/          # 类型定义
├── utils/          # 工具函数（加密、格式化、压缩、清理等）
└── websocket/      # WebSocket 通知
```

#### 已修复的问题

| # | 问题 | 修复方案 | 状态 |
|---|------|---------|------|
| 1 | 路由配置在 Router 和面包屑中重复定义 | 创建 `config/routes.ts` 提取共享路由配置，Router 和面包屑均从该配置动态生成 | ✅ 已修复 |
| 2 | 面包屑使用硬编码 `routeMap` 对象，路由变更时需手动同步 | 通过 `buildSegmentTitleMap()` 从 `routeConfig` 动态构建路径段标题映射 | ✅ 已修复 |
| 3 | `request.ts` 使用模块级变量管理弹窗状态，存在竞态问题 | 改用 Zustand auth store 的 `isLoginExpiredModalOpen` 状态控制弹窗 | ✅ 已修复 |
| 4 | `BasicLayout.tsx` 中 `useMemo` 导入未使用 | 从 import 中移除 | ✅ 已修复 |

#### 当前评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 路由设计 | ⭐⭐⭐⭐ | 集中式路由配置（`routes.ts`），支持动态路由和 keepAlive；面包屑仍保留少量静态标题映射 |
| 状态管理 | ⭐⭐⭐⭐⭐ | Zustand 简洁高效，5 个 store 划分清晰，关注点分离 |
| 组件复用 | ⭐⭐⭐⭐ | 公共组件拆分合理，lazy import 减少首屏加载 |
| 请求处理 | ⭐⭐⭐⭐⭐ | Axios 拦截器统一处理认证和错误，弹窗状态使用响应式管理 |
| 代码风格 | ⭐⭐⭐⭐ | 统一使用 TypeScript + React Hooks，类型定义完善 |

---

### 2.2 博客前台 (blog-web)

#### 整体结构

```
blog-web/src/
├── app/[locale]/    # Next.js App Router 页面（国际化路由）
├── components/      # 组件库（article、comment、layout、search、markdown、decoration 等）
├── lib/             # 工具库（API 客户端、认证、国际化、Hooks、Store）
├── store/           # Zustand 全局状态
├── styles/          # 全局样式
└── types/           # 类型定义
```

#### 已修复的问题

| # | 问题 | 修复方案 | 状态 |
|---|------|---------|------|
| 1 | `fetchClient` 缺少请求超时机制 | 使用 `AbortController` 实现超时控制，默认 10 秒，支持自定义 `timeout` 参数 | ✅ 已修复 |

#### 当前评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 框架选型 | ⭐⭐⭐⭐⭐ | Next.js App Router 充分利用 SSR/SSG，SEO 友好 |
| 国际化 | ⭐⭐⭐⭐⭐ | 基于路由的国际化方案，路径参数 `[locale]` |
| 组件设计 | ⭐⭐⭐⭐⭐ | 组件拆分精细，动画评论、装饰效果等体验优秀 |
| 请求处理 | ⭐⭐⭐⭐ | 客户端已添加 10 秒超时并支持 mock；服务端 SSR 请求仍缺显式超时 |
| 主题系统 | ⭐⭐⭐⭐⭐ | 暗色/亮色主题切换，装饰效果可配置 |

---

## 三、后端架构审核

### 3.1 整体分层架构

```
blog-service/src/main/java/com/blog/
├── bootstrap/          # 启动引导层
│   ├── config/         # Spring 配置类（安全、缓存、异步、WebSocket 等，共 17 个）
│   └── context/        # 请求级上下文（UserContext - ThreadLocal）
├── infrastructure/     # 基础设施层
│   ├── aspect/         # AOP 切面（日志、监控、限流）
│   ├── cache/          # 缓存（ApiResourceCache）
│   ├── filter/         # Servlet 过滤器（安全、限流、清理）
│   ├── interceptor/    # Spring 拦截器（API 权限、WebSocket 握手）
│   ├── lock/           # 分布式锁（Redis + Lua 脚本）
│   ├── mq/             # 消息队列（消费者、MQService）
│   ├── security/       # 安全组件（限流管理、数据脱敏、SQL 注入防护）
│   ├── websocket/      # WebSocket（通知推送）
│   └── ...             # mail、metrics、revalidate、webhook
├── modules/            # 业务模块层（约 20 个业务模块）
│   └── {module}/
│       ├── controller/admin/  # 管理端控制器
│       ├── controller/pub/    # 公开端控制器
│       ├── service/           # 业务服务
│       ├── mapper/            # 数据访问
│       └── model/             # 实体/DTO/VO/枚举
├── plugin/             # 插件架构层
│   ├── core/           # 插件核心接口（Plugin）
│   └── components/     # 插件组件（search、storage、mq、scheduler、notification、location）
└── shared/             # 共享层（异常、注解、工具类、Result）
```

**评价**：分层职责清晰，五层划分（bootstrap / infrastructure / modules / plugin / shared）合理。每个业务模块内部遵循 `controller → service → mapper` 标准三层结构，admin 和 public 控制器分离明确。

---

### 3.2 插件架构深度分析

#### 3.2.1 核心设计

插件核心接口 [Plugin](blog-service/src/main/java/com/blog/plugin/core/Plugin.java) 定义了 `isEnabled()`、`getName()` 五个方法，其中 `getId()`、`getPriority()`、`getVersion()` 提供默认实现，设计简洁。

**插件类型一览**：

| 插件类型 | 接口 | 工厂 | 实现 |
|---------|------|------|------|
| 搜索 | `SearchPlugin` | `SearchPluginFactory` | `DatabaseSearchPlugin`, `ElasticsearchSearchPlugin` |
| 存储 | `StoragePlugin` | `StoragePluginFactory` | `LocalStoragePlugin`, `OssStoragePlugin`, `QiniuStoragePlugin` |
| 消息队列 | `MessageQueuePlugin` | `MessageQueuePluginFactory` | `MemoryMQPlugin`, `RabbitMQPlugin` |
| 调度器 | `SchedulerPlugin` | `SchedulerPluginFactory` | `QuartzSchedulerPlugin`, `SpringScheduledPlugin` |
| 通知渠道 | `NotificationChannelPlugin` | `NotificationChannelFactory` | Email, WebSocket |
| 位置服务 | `LocationProviderPlugin` | `LocationProviderFactory` | `AmapLocationProviderPlugin`, `BaiduLocationProviderPlugin`, `Ip2LocationProviderPlugin` |

#### 3.2.2 🟢 工厂实现一致性（已确认一致）

六个工厂的实现模式完全一致，均通过 `Plugin::isEnabled` 过滤后收集可用插件：

```java
// Search / Storage / Scheduler / MQ 四个单插件族工厂
// 继承 AbstractSinglePluginFactory<T extends Plugin> 泛型基类，
// 统一的 fail-fast 单选逻辑（无可用/多可用即抛异常）在基类中实现，
// 子类仅需提供 getPlugins()（过滤后的列表）、getPluginTypeName()、getConfigPropertyKey()
public class SearchPluginFactory extends AbstractSinglePluginFactory<SearchPlugin> {
    public List<SearchPlugin> getPlugins() { ... .filter(Plugin::isEnabled) ... }
}

// Notification 工厂和 Location 工厂使用各自的接口方法引用，语义相同
// .filter(NotificationChannelPlugin::isEnabled) / .filter(LocationProviderPlugin::isEnabled)
```

**说明**：`@ConditionalOnProperty` 负责启动时静态注册（选择哪个实现族），`isEnabled()` 负责运行时过滤；只有具体实现主动检查配置或连接时，才能将其视为健康检查，两者不能自动保证外部服务可用。

#### 3.2.3 ✅ 已处理：`PluginSelector` 死代码

`PluginSelector` 提供了 `selectSingle()` / `selectBroadcast()` 方法，但全项目无任何调用方、无测试，属于死代码。已删除该类（`plugin/core/PluginSelector.java`），消除混淆。

#### 3.2.4 ✅ 已处理：`implements XxxPlugin, Plugin` 冗余

所有插件实现类此前同时声明特定接口和 `Plugin`（如 `implements SearchPlugin, Plugin`），由于特定接口已 `extends Plugin`，冗余声明已统一移除（14 个实现类），仅保留特定接口。

#### 3.2.5 ✅ 已处理：`NotificationChannelFactory` / `LocationProviderFactory` 未过滤 `isEnabled()`

已为这两个工厂添加 `isEnabled()` 过滤，与其余四个工厂保持一致。当前六个工厂全部基于 `isEnabled()` 过滤可用插件。

#### 3.2.6 🟡 `isEnabled()` 实现语义确认（含运行时检查）

| 插件 | `isEnabled()` 实现 | 说明 |
|------|-------------------|------|
| `LocalStoragePlugin` / `OssStoragePlugin` / `QiniuStoragePlugin` | `return true` | Bean 注册后视为可用，未在此方法中校验完整配置或外部连接 |
| `DatabaseSearchPlugin` / `ElasticsearchSearchPlugin` | `return true` | 数据库实现无需外部连接；ES 实现未在此方法中校验连接 |
| `MemoryMQPlugin` / `SpringScheduledPlugin` | `return true` | 内存/框架实现，未在此方法中校验全部运行时条件 |
| `AmapLocationProviderPlugin` / `BaiduLocationProviderPlugin` | `return StrUtil.isNotBlank(apiKey/ak)` | 运行时检查：API Key 未配置时禁用 |
| `EmailChannelPlugin` | `return emailService.isConfigured()` | 运行时检查：邮件服务未配置时禁用 |
| `WebSocketChannelPlugin` | `return webSocketHandler != null` | 运行时检查：handler 缺失时禁用 |
| `RabbitMQPlugin` | 检查 `rabbitTemplate`/连接工厂对象是否存在 | 仅检查 Bean 对象，不验证 Broker 实际连通性 |
| `QuartzSchedulerPlugin` | `return scheduler != null && scheduler.isStarted()` | 运行时检查：调度器未启动时禁用 |
| `Ip2LocationProviderPlugin` | `return false` | 恒禁用（未实现，占位） |

**结论**：当前表格包含 14 个插件实现，其中 6 个实现包含 API Key、邮件服务、WebSocket handler、RabbitMQ 或 Quartz 状态检查；其余实现直接返回 `true`，不能等同于完整配置和外部服务健康检查。统一策略为：`@ConditionalOnProperty` 控制启动时 Bean 注册，工厂以 `isEnabled()` 做运行时过滤；这不是动态热插拔。`Ip2LocationProviderPlugin`（恒 false）在被配置为 active 时会被工厂过滤，但调用方仍需明确处理无可用插件的情况。

---

### 3.3 安全架构深度分析

#### 3.3.1 请求处理链（纵深防御）

```
SecurityFilter (HIGHEST_PRECEDENCE + 1)
  → GlobalRateLimitFilter (HIGHEST_PRECEDENCE + 10)
    → SaToken Login Interceptor (order=1)
      → ApiPermissionInterceptor (order=2)
        → Controller
          → RequestCleanupFilter (LOWEST_PRECEDENCE, finally 清理 ThreadLocal)
```

这个链条只适用于未被 CORS、OPTIONS、白名单路径和 profile 开关放行的请求；应将这些例外条件一并纳入安全评估。

#### 3.3.2 SecurityFilter 详细分析

[SecurityFilter](blog-service/src/main/java/com/blog/infrastructure/filter/SecurityFilter.java) 实现了多层安全检查：

| 检查项 | 说明 | 评价 |
|--------|------|------|
| 请求头校验 | 检查非标准 HTTP 头中的明显恶意片段 | 🟡 有限黑名单，不能替代输入验证 |
| 参数校验 | 检查 query/form 参数中的明显 XSS/SQL 片段，不解析 JSON body | 🟡 仅为兜底防护 |
| User-Agent 校验 | 拒绝已知扫描器关键词（sqlmap/nmap 等），空 UA 仅记日志放行 | 🟢 基础防护 |
| CSRF 防护 | Referer/Origin 校验（仅对写请求，Docker profile 开启） | 🟡 依赖 profile 和请求头 |
| 安全响应头 | CSP、HSTS、X-Frame-Options、X-Content-Type-Options | 🟢 全面 |

**🟢 亮点 1：路径跳过使用 `AntPathMatcher` 精确匹配**

```java
private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
private static final String[] SKIP_PATHS_BASE = {
    "/actuator/**", "/swagger-*/**", "/v3/api-docs/**", "/favicon.ico", "/uploads/**"
};
```

使用 `AntPathMatcher.match()` 进行精确模式匹配，避免了 `contains()` 子串误匹配问题。

**🟢 亮点 2：异常处理正确分离**

```java
try {
    // 1-4. 安全检查（可能抛出异常）
} catch (Exception e) {
    sendSecurityError(httpResponse, "请求处理异常");
    return;
}
// 5. 安全响应头
addSecurityHeaders(httpRequest, httpResponse);
// 继续处理请求（异常交由 Spring 异常处理机制，不在此吞没）
chain.doFilter(request, response);  // ← 在 try-catch 之外
```

`chain.doFilter()` 在 try-catch 块之外，Controller 中的业务异常不会被吞没，能正确传播到 `GlobalExceptionHandler`。

**🟢 亮点 3：CSRF 防护设计精细**

- 仅校验写请求（POST/PUT/DELETE/PATCH）
- 开发环境域名组合（localhost:3000 ↔ 127.0.0.1:8888）放行
- 已认证请求必须有 Referer/Origin
- 携带 Referer/Origin 时必须同源

> 注意：`security.csrf.enabled` 在公共配置中默认关闭，仅 Docker profile 开启；当前 `isSameOrigin()` 主要比较 host/port，未严格比较 scheme，因此应将其描述为来源校验，而不是完整浏览器同源校验。

#### 3.3.3 限流架构

项目实现了三层限流：

| 层级 | 组件 | 策略 | 评价 |
|------|------|------|------|
| 全局 IP 限流 | `GlobalRateLimitFilter` | 滑动窗口（秒/分钟） | 🟢 覆盖全站 |
| 注解级限流 | `@RateLimit` + `RateLimitAspect` | 滑动窗口/令牌桶/固定窗口 | 🟢 灵活精细 |
| 业务限流 | `RateLimitManager` | 支持 IP/用户/API 维度 | 🟢 手动调用 |

滑动窗口和令牌桶使用 Redis + Lua，脚本执行具备原子性；固定窗口仍使用普通 `INCR`/`EXPIRE`。此外，IP 提取逻辑必须只信任可信代理注入的转发头，否则客户端可伪造 IP 绕过 IP 限流。Redis 异常时采用 **fail-close** 会提升暴力破解防护，但也会把 Redis 故障放大为全站不可用，应按接口重要性评估，而不能一概称为正确。

#### 3.3.4 认证与授权

[SaTokenConfig](blog-service/src/main/java/com/blog/bootstrap/config/SaTokenConfig.java) 配置了两层拦截器：

1. **SaToken 登录拦截器**（order=1）：验证登录状态，设置 `UserContext`
2. **ApiPermissionInterceptor**（order=2）：验证 API 接口权限

**🟢 亮点**：
- 登录拦截器在验证登录后立即查询数据库，检查用户是否被删除/禁用
- 使用 `StpUtil.updateLastActiveToNow()` 实现滚动过期
- `RequestCleanupFilter` 在 finally 块中清理 `UserContext`，防止 ThreadLocal 内存泄漏
- `SaTokenConfig` 直接 `implements WebMvcConfigurer`，但当前仍保留未使用的 `servletPath` 字段，需清理或实际使用

---

### 3.4 控制器层设计

#### 3.4.1 Admin vs Public 分离

每个业务模块的控制器清晰地分为 `controller/admin/` 和 `controller/pub/`：

- **Admin 控制器**：`/api/admin/**`，需要认证和权限
- **Public 控制器**：`/api/public/**`，公开访问

这种分离使得安全策略可以通过路径前缀统一管理，符合 API 网关友好的设计原则。

#### 3.4.2 API 文档

控制器使用了 `@ApiOperation` 自定义注解，包含 `name`、`type`、`description`、`open` 等元数据。这些元数据被 `ApiResourceInitializer` 用于自动注册 API 资源到数据库，实现接口资源的动态权限管理。

**🟢 亮点**：`ApiResourceCache` 缓存了接口资源信息，`ApiPermissionInterceptor` 通过缓存查询接口权限，避免了每次请求都查询数据库。

---

### 3.5 异常处理架构

[GlobalExceptionHandler](blog-service/src/main/java/com/blog/shared/exception/GlobalExceptionHandler.java) 统一处理：

| 异常类型 | 响应码 | 说明 |
|---------|--------|------|
| `BusinessException` | 自定义 code | 业务异常 |
| `NotLoginException` | 401 | 未登录 |
| `NotPermissionException` | 403 | 无权限 |
| `NotRoleException` | 403 | 无角色 |
| `MethodArgumentNotValidException`/`BindException` | 400 | 参数校验失败 |
| `NoResourceFoundException` | 404 | 资源不存在 |
| `Exception` | 500 | 兜底系统异常 |

**评价**：异常类型覆盖较全，返回统一的 `Result` 格式；但表中的 401/403/400/500 当前主要是业务码，除 404 外并未统一设置 HTTP 状态码。由于 SecurityFilter 的 `chain.doFilter()` 在 try-catch 之外，Controller 层异常仍可传播到全局处理器。

---

### 3.6 基础设施层评估

| 组件 | 技术 | 评价 |
|------|------|------|
| 分布式锁 | Redis + Lua 脚本 | 🟢 原子释放，Redis 不可用时降级 |
| 消息队列 | RabbitMQ / 内存实现 | 🟡 未配置时跳过发送；RabbitMQ 失败不会自动切换到内存实现 |
| WebSocket | Spring WebSocket | 🟢 支持心跳检测（ping/pong），ConcurrentHashMap 管理 session |
| 异步任务 | `@Async` + ThreadPoolExecutor | 🟢 配置了未捕获异常处理器 |
| 缓存 | Redis CacheManager + RedisTemplate | 🟡 当前未见 Caffeine 多级缓存配置 |

---

## 四、问题汇总与优先级

> 历史问题汇总（截至 2026-08-07；后续复核见第六、七节）

### 🔴 高优先级

| # | 位置 | 问题 | 建议 | 状态 |
|---|------|------|------|------|
| 1 | 所有插件实现类 | `implements XxxPlugin, Plugin` 冗余声明（14 个文件） | 移除冗余的 `Plugin`，只保留特定接口 | ✅ 已修复 |

### 🟡 中优先级

| # | 位置 | 问题 | 建议 | 状态 |
|---|------|------|------|------|
| 2 | `PluginSelector` | 已设计但未被任何工厂使用，成为死代码 | 删除该类（无调用方、无测试） | ✅ 已删除 |
| 3 | 六个工厂 | 工厂过滤策略不统一（部分过滤部分不过滤） | 全部统一为 `Plugin::isEnabled` 过滤 | ✅ 已修复 |
| 4 | 各插件实现 | `isEnabled()` 实现不一致（`true`/运行时检查/`false`） | 统一策略：`@ConditionalOnProperty` 静态注册 + 工厂 `isEnabled()` 运行时门控 | ✅ 已统一（见 3.2.6） |
| 5 | 四个单插件族工厂 | `getActivePlugin()` 逻辑重复（~15 行 × 4） | 提取 `AbstractSinglePluginFactory<T extends Plugin>` 泛型基类 | ✅ 已修复 |
| 6 | `PluginSearchServiceImpl` | 直接传播 `getActivePlugin()` 的 `IllegalStateException`（无插件时错误信息不统一） | 捕获并转换为 `BusinessException`，同时明确 503/降级策略 | 🟡 部分修复，当前默认业务码仍为 500，`getFacetCounts()` 还需单独处理 |

### 🟢 低优先级（后续迭代考虑）

| # | 位置 | 问题 | 建议 |
|---|------|------|------|
| 7 | `QuartzSchedulerPlugin.QuartzRunnableJob` | `execute()` 方法仅输出日志警告，Runnable 存储机制未实现 | 实现 Runnable 存储（如静态 Map 或 Spring Bean） |
| 8 | `SpringScheduledPlugin.schedule()` | 不支持 Cron 表达式，返回 null | 调用方需检查 null，或抛出不支持异常 |
| 9 | `RabbitMQPlugin.sendDelayed()` | 延迟消息未实现，只是普通发送 | 实现或明确标注不支持 |
| 10 | `DatabaseSearchPlugin` | 索引方法（indexDocument/deleteDocument/bulkIndexDocuments）为空实现 | 添加注释说明数据库搜索不需要索引 |
| 11 | API 路由 | 缺少 API 版本控制 | 考虑添加 `/api/v1/` 前缀 |

---

## 五、总体评价

| 维度 | 评分 | 说明 |
|------|------|------|
| 分层架构 | ⭐⭐⭐⭐ | bootstrap/infrastructure/modules/plugin/shared 边界清晰，但 ops 等运维代码未完全体现在五层图中 |
| 插件化设计 | ⭐⭐⭐⭐ | 六个工厂模式统一，`isEnabled()` 运行时门控语义清晰，冗余声明已清理 |
| 安全防护 | ⭐⭐⭐ | 存在可信代理、JSON body 检查、CSRF profile、CSP 覆盖范围等前置条件 |
| 异常处理 | ⭐⭐⭐⭐ | 异常类型覆盖较全，但多数业务错误未映射为对应 HTTP 状态码 |
| 代码复用 | ⭐⭐⭐ | `StoragePlugin` 已提供 `getFileType()` default 方法，但 `FileServiceImpl` 仍保留规则不同的重复实现 |
| 可扩展性 | ⭐⭐⭐⭐ | 插件实现可扩展，但通过条件 Bean 在启动时选择，新增实现通常需要重启 |
| 前端路由 | ⭐⭐⭐⭐ | 集中式路由配置和动态生成已落地，面包屑仍有少量静态映射 |
| 前端状态管理 | ⭐⭐⭐⭐⭐ | Zustand 简洁高效，状态划分清晰 |
| 部署运维 | ⭐⭐⭐⭐ | Docker 多阶段构建和健康检查完善，但监控、密钥注入、连接池和非 root 运行仍需复核 |

**总结**：前几轮的部分重构已落地，包括工厂基类、接口声明清理、路径匹配和客户端超时；但“全部问题均已修复”“热插拔”“多级缓存”“生产级安全”等表述过强。当前应将插件可扩展性、异常 HTTP 状态、限流可信代理、配置密钥、连接池、监控指标和未完成插件功能分开评估。

---

## 六、第四轮审核：前后端集成、内容安全、部署与监控（2026-08-10）

### 6.1 前端内容渲染与安全

#### 6.1.1 XSS 防护体系

项目具备后端输入清洗和前端渲染清洗等多层防护，但页面级 CSP 尚未形成完整覆盖，不能直接称为完整的“三层 XSS 防护”：

| 层级 | 位置 | 机制 | 评价 |
|------|------|------|------|
| 后端输入 | `HtmlSanitizer`（说说内容） | HTML 白名单清洗 | 🟢 服务端第一道防线 |
| 前端渲染 | [sanitize.ts](blog-web/src/lib/utils/sanitize.ts) | DOMParser 真实 DOM 清洗 + SSR 正则兜底 | 🟡 浏览器端清洗较完整，SSR 分支需补测试 |
| 内容安全策略 | 后端 `SecurityFilter` CSP 头 | 仅覆盖后端过滤器经过的响应，未覆盖 blog-web 页面响应 | 🟡 不能直接作为前端页面的第三道防线 |

**🟡 设计：sanitize.ts 的双模处理**

[sanitize.ts](blog-web/src/lib/utils/sanitize.ts) 实现了浏览器/SSR 双路径清洗：

- **浏览器环境**：使用 `DOMParser` 解析 HTML 为真实 DOM，递归遍历节点树移除 `<script>`、`<iframe>`、`on*` 事件属性、`javascript:` 协议等危险内容
- **SSR 环境**：回退为有限的正则表达式清洗，仅覆盖部分危险标签、事件属性和协议

```typescript
const DANGEROUS_TAGS = new Set([
  'script', 'iframe', 'object', 'embed', 'form', 'base', 'meta', 'link', 'style',
]);

function sanitizeDomContainer(container: HTMLElement) {
  // 递归遍历 DOM，移除危险标签和属性
}
```

**评价**：浏览器端 DOM 清洗流程清晰，但 SSR 正则分支不是完整的 HTML 白名单清洗，覆盖范围明显小于浏览器分支。不能仅凭零依赖和正则兜底宣称完整 XSS 防护；应使用服务端白名单清洗或补充针对 SSR 分支的安全测试。后端 `HtmlSanitizer` 当前主要覆盖说说写入流程。

#### 6.1.2 MarkdownRenderer 安全流程

[MarkdownRenderer](blog-web/src/components/markdown/MarkdownRenderer.tsx) 的渲染后处理流程为：

1. **Vditor 渲染**：Markdown → HTML（支持 KaTeX 数学公式、代码高亮）
2. **enhanceDom()**：增强 DOM（图片添加 data-markdown-preview 属性、外链添加 target="_blank" + rel="noopener noreferrer"）
3. **sanitizeDomContainer()**：XSS 清洗
4. **触发 vditorRendered 事件**：供外部组件（如目录生成）使用

**🟢 亮点：外链离站提示与 rel 处理**

```typescript
// 外链：新标签页打开 + 安全 rel
link.setAttribute('target', '_blank');
const relSet = new Set(existingRel.split(/\s+/).filter(Boolean));
relSet.add('noopener');
relSet.add('noreferrer');
link.setAttribute('rel', Array.from(relSet).join(' '));
link.classList.add('markdown-external-link');
```

外链点击会弹出 `ExternalLinkDialog` 确认对话框，用户确认后才在新标签页打开；该弹窗是离站提示，不是对恶意目标的安全阻断。

**🟡 密码文章 Token 机制**

[PasswordGate](blog-web/src/components/article/PasswordGate.tsx) 使用后端签发的随机 token（带 TTL）替代明文密码存储：

```typescript
const TOKEN_KEY_PREFIX = 'article_unlock_';
// 仅存储后端签发的随机 token（带 TTL），不再保存明文密码；localStorage 中的 token 仍需防范 XSS 窃取
```

#### 6.1.3 前端 API 层

项目实现了**客户端/服务端双通道 API 请求**：

| 通道 | 文件 | 用途 | 超时 |
|------|------|------|------|
| 浏览器端 | [client.ts](blog-web/src/lib/api/client.ts) | 客户端交互（评论、点赞、验证码） | 10s（AbortController） |
| 服务端 | [server.ts](blog-web/src/lib/api/server.ts) | SSR 数据获取（文章列表、配置） | 无显式超时 |

**🟢 亮点：fetchClient 错误分类**

```typescript
if (error instanceof ApiError) throw error;                    // 业务错误，透传
if ((error as Error)?.name === 'AbortError')                   // 超时
  throw new Error('请求超时，请稍后重试');
if (error instanceof TypeError)                                // 网络错误
  throw new Error('网络请求失败，请检查您的网络或服务器状态');
```

错误分类基本清晰，不同类型错误抛出不同中文提示；JSON 解析等非 TypeError 异常仍会落入通用错误分支。

**🟡 发现：fetchServer 缺少超时控制**

[server.ts](blog-web/src/lib/api/server.ts) 的 `fetchServer` 没有实现显式超时或取消机制。在 SSR 场景下，后端不可达或请求长期不返回时可能阻塞页面渲染；应明确设置分层超时，而不是依赖缓存行为。

**建议**：为 `fetchServer` 添加超时控制（例如 SSR 15s）；客户端当前是 10s，应明确两者的分层策略，而不是声称数值一致。

#### 6.1.4 前端错误边界

项目实现了**三层错误边界**：

| 层级 | 文件 | 触发场景 | 用户交互 |
|------|------|---------|---------|
| 全局 | [global-error.tsx](blog-web/src/app/global-error.tsx) | Root Layout 异常 | 重试按钮 |
| 路由级 | [[locale]/error.tsx](blog-web/src/app/[locale]/error.tsx) | 路由内页面异常 | 重试 + 返回首页 |
| 组件级 | [ErrorBoundary.tsx](blog-web/src/components/common/ErrorBoundary.tsx) | 组件渲染异常 | 刷新页面 |

**评价**：覆盖全面，分层合理。`global-error.tsx` 必须包含 `<html>/<body>` 标签（Next.js 要求），实现正确。`[locale]/error.tsx` 继承 Layout 布局，用户体验一致。

#### 6.1.5 首页数据加载

[首页](blog-web/src/app/[locale]/page.tsx) 使用 `Promise.allSettled` 并行加载四个 API：

```typescript
const results = await Promise.allSettled([
  articleApi.getList({ page: currentPage, size: PAGINATION_DEFAULT_SIZE }),
  articleApi.getHot(5),
  categoryApi.getList(),
  tagApi.getList()
]);
```

**🟢 亮点**：使用 `allSettled` 而非 `all`，单个 API 失败不会使整体 Promise 直接 reject；SSR 仍需等待所有请求结束，不能替代 `fetchServer` 的超时控制。

---

### 6.2 数据库架构

#### 6.2.1 表结构设计

[schema.sql](blog-service/src/main/resources/schema.sql) 当前定义了 32 张表，覆盖文章、交互、文件、权限、配置、统计等模块：

| 分类 | 表 | 说明 |
|------|-----|------|
| 用户与权限 | `user`, `role`, `sys_menu`, `role_menu`, `role_api`, `sys_api` | RBAC 权限模型 |
| 文章 | `article`, `article_tag`, `article_directory`, `directory_node` | 文章 + 目录树 + 标签 |
| 交互 | `comment`, `talk`, `guestbook` | 评论、说说、留言 |
| 文件 | `file_meta`, `file_reference` | 文件元数据 + 引用计数 |
| 监控 | `log_operation`, `log_error`, `visitor`, `visitor_session`, `page_view` | 操作日志、异常日志、访客和访问统计 |
| 配置 | `sys_config`, `album`, `picture` | 系统配置、相册和图片 |

**🟢 亮点：无外键约束设计**

```sql
-- 注意：所有外键关系通过应用层代码维护，不使用数据库外键约束
-- 优点：更好的性能、更灵活的数据管理、避免级联删除问题
```

这是有意的架构决策，在个人博客场景下可以接受，但会把引用完整性、删除顺序和并发一致性责任转移到应用层。应用层通过逻辑删除（部分表包含 `deleted` 字段）和 Service 层代码维护数据一致性。

**🟡 注意：DDL 基本幂等，但补列语句依赖容错**

> 以下配置和说明是第四轮修复前的基线片段；当前 profile 已改为 `continue-on-error: false`。

```yaml
# application-docker.yml
sql:
  init:
    mode: always
    schema-locations: classpath:schema.sql
    continue-on-error: true  # ALTER TABLE 重复执行容忍
```

`CREATE TABLE IF NOT EXISTS` 对建表语句有效，但 `ALTER TABLE ... ADD COLUMN` 仍会在重复执行时产生 Duplicate column 错误。当前依赖全局 `continue-on-error: true` 忽略该错误，这也可能掩盖真正的建表或字段变更失败；生产环境应使用条件式迁移或正式迁移工具。

**🟢 亮点：索引策略**

索引覆盖了部分逻辑删除、状态、时间和关联查询，但并非每张表都有 `deleted` 字段或对应索引。应结合实际 SQL 和执行计划逐表验证，不能将索引命名存在等同于查询性能已得到保证。

#### 6.2.2 MyBatis-Plus 配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `map-underscore-to-camel-case` | `true` | 下划线转驼峰 |
| `cache-enabled` | `true` | 二级缓存 |
| `lazy-loading-enabled` | `true` | 延迟加载 |
| `aggressive-lazy-loading` | `false` | 按需延迟加载 |
| `auto-mapping-behavior` | `partial` | 部分自动映射 |

**评价**：配置启用了延迟加载，并将 `aggressive-lazy-loading` 设为 `false`；这只改变延迟属性的加载行为，不能单独证明已经避免 N+1 查询，仍需结合实际 SQL 和测试验证。

**🟢 亮点：自定义 BaseMapper**

```java
// com.blog.shared.model.BaseMapper
// 统一扩展 MyBatis-Plus BaseMapper，所有 Mapper 继承此接口
```

所有 Mapper 继承统一的 `BaseMapper`，便于后续统一添加自定义方法。

---

### 6.3 CI/CD 流水线

#### 6.3.1 工作流结构

[ci.yml](.github/workflows/ci.yml) 定义了 8 个 Job：

```
repo-hygiene (仓库卫生检查)
  ├── test-backend (后端测试，MySQL + Redis Service Containers)
  ├── check-frontend-admin (管理后台 lint)
  ├── check-frontend-web (博客前台 lint)
  ├── build-frontend-admin (管理后台构建)
  │     └── depends: check-frontend-admin
  ├── build-frontend-web (博客前台构建)
  │     └── depends: check-frontend-web
  └── build-backend (后端构建)
        └── depends: test-backend

security-scan (Trivy 漏洞扫描)
  └── depends: build-backend, build-frontend-admin, build-frontend-web
```

**🟢 亮点：repo-hygiene 检查**

[repo-hygiene.sh](scripts/repo-hygiene.sh) 检查：
1. 是否误提交了 `.env` 文件（非 `.env.example`）
2. 是否存在绝对路径引用（防止本地路径泄露）

**🟢 亮点：路径过滤**

```yaml
paths-ignore:
  - '**/*.md'
  - 'docs/**'
  - '.gitignore'
  - 'LICENSE'
```

文档变更不触发 CI，节省资源。

**🟡 发现：部分 Actions 版本过旧（截至 2026-08-10 核查）**

| Action | 当前版本 | 建议版本（核查时） | 说明 |
|--------|---------|---------|------|
| `actions/cache@v3` | v3 | v4 | Node.js 16 已 EOL |
| `actions/upload-artifact@v3` | v3 | v4 | v3 即将弃用 |
| `codecov/codecov-action@v3` | v3 | v5 | 大版本落后 |
| `dorny/test-reporter@v1` | v1 | v2 | 有更新 |

**建议**：升级到最新版本，避免 Node.js 16 运行时弃用导致的 CI 失败。

**🟡 注意：Trivy 安全扫描**

> 以下配置是第四轮修复前的基线片段；当前 workflow 已升级 Action 并设置 HIGH/CRITICAL 阻断策略。

```yaml
security-scan:
  runs-on: ubuntu-latest
  needs: [build-backend, build-frontend-admin, build-frontend-web]
  steps:
    - uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        format: 'sarif'
        output: 'trivy-results.sarif'
    - uses: github/codeql-action/upload-sarif@v2
```

文件系统级别的漏洞扫描，结果上传到 GitHub Code Scanning；当前未设置 `exit-code` 或严重性阈值，漏洞发现不一定会阻断流水线。Action 版本还包括 `pnpm/action-setup@v2`、`github/codeql-action/upload-sarif@v2`，Trivy 使用未固定的 `@master`，应统一升级并固定版本或 commit SHA。

---

### 6.4 Docker 部署架构

#### 6.4.1 多阶段构建

三个前端/后端均使用多阶段构建，镜像固定为 SHA256 digest：

| 服务 | 构建镜像 | 运行镜像 | 优化 |
|------|---------|---------|------|
| blog-service | `gradle:8.5-jdk21-jammy` | `eclipse-temurin:21-jre-jammy` | 构建/运行分离 |
| blog-admin | `node:20-alpine` | `nginx:alpine` | 静态文件由 Nginx 服务 |
| blog-web | `node:20-alpine` | `node:20-alpine` | Next.js standalone 模式 |

**🟡 运行时权限状态**

- `blog-service` 和 `blog-web` 明确使用非 root 用户；`blog-admin` 的 Nginx runtime 未在 Dockerfile 中显式设置 `USER`
- `blog-service` 创建 `blog` 用户组和用户
- `blog-web` 创建 `nextjs` 用户（UID 1001）
- `blog-admin` 的 Nginx 配置使用 `user nginx`，但这主要约束 worker，不能单独证明容器主进程整体以非 root 运行

**🟢 亮点：BuildKit 缓存挂载**

```dockerfile
RUN --mount=type=cache,id=blog-service-gradle-caches,target=/root/.gradle/caches,sharing=locked \
    ./gradlew bootJar --no-daemon --no-watch-fs --parallel --info --stacktrace
```

使用 `--mount=type=cache` 挂载构建缓存目录，加速重复构建。`sharing=locked` 防止并发构建冲突。

**🟢 亮点：Gradle 镜像源配置**

[blog-service Dockerfile](blog-service/Dockerfile) 在容器内配置了阿里云/腾讯云双 Maven 镜像源，避免中国大陆网络问题导致的依赖下载失败。

**🟢 亮点：entrypoint.sh 服务等待**

[entrypoint.sh](blog-service/docker/entrypoint.sh) 会等待 MySQL；Redis 和 RabbitMQ 的等待逻辑读取 `SPRING_REDIS_HOST`/`SPRING_RABBITMQ_HOST`，而完整 Compose 设置的是 `REDIS_HOST`/`RABBITMQ_HOST`，因此这两项主要依赖 Compose 的 `depends_on` 健康检查。

#### 6.4.2 Docker Compose 编排

[docker-compose.yml](docker-compose.yml) 支持两种部署模式：

| 模式 | Profile | 说明 |
|------|---------|------|
| HTTP | `http` | Nginx 反向代理，`localhost` 直接访问 |
| HTTPS | `https` | Nginx Proxy + ACME Companion，自动 Let's Encrypt 证书 |

**🟢 亮点：服务健康检查**

```yaml
healthcheck:
  test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
  interval: 30s
  timeout: 10s
  retries: 3
```

MySQL、Redis 均配置了健康检查，`blog-web` 依赖 `blog-service` 的 `service_healthy` 条件。

**🟡 发现：MySQL 资源限制**

```yaml
command: >
  --performance-schema=off
  --innodb-buffer-pool-size=64M
  --max-connections=20
```

`innodb-buffer-pool-size=64M` 对个人博客合理，但 `max-connections=20` 需注意：Docker profile 已将 HikariCP `maximum-pool-size` 配置为 20，应用池可能占满数据库连接，监控和管理连接没有明确余量。

**建议**：根据实际并发量协调 MySQL `max-connections`、HikariCP 池大小和监控连接；不要在未测量前直接将上限提升到 50。

---

### 6.5 监控体系

#### 6.5.1 指标收集

项目实现了多层指标收集：

| 层级 | 组件 | 说明 |
|------|------|------|
| 框架级 | Spring Boot Actuator + Micrometer | JVM 内存/GC/线程、HTTP 请求指标 |
| 业务级 | [BlogMetrics](blog-service/src/main/java/com/blog/infrastructure/metrics/BlogMetrics.java) | 指标定义覆盖文章创建/浏览、评论创建、登录和两个 Gauge；生产业务调用链尚未完整核实 |
| 数据库级 | [DatabaseMonitoringConfig](blog-service/src/main/java/com/blog/bootstrap/config/DatabaseMonitoringConfig.java) | SQL 执行时间、慢查询（>1s）检测 |
| 方法级 | [MonitoringAspect](blog-service/src/main/java/com/blog/infrastructure/aspect/MonitoringAspect.java) | Service 方法耗时 |

**🟢 亮点：MetricsConfig 的修复历史**

```java
/**
 * JVM/进程指标由 Spring Boot Actuator 自动配置类默认注册，
 * 无需在此重复声明——历史上手动注册的 JvmMemoryMetrics 等
 * 与自动配置的 bean 同名，在 docker profile 下触发
 * BeanDefinitionOverrideException 导致启动失败。
 */
@Configuration
public class MetricsConfig {
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags(
            "application", "blog-service",
            "version", "1.0.0"
        );
    }
}
```

注释清楚记录了历史踩坑和修复原因，避免后人重蹈覆辙。

**指标有效性注意**：`BlogMetrics` 当前定义了 Gauge 的更新方法，但报告不能仅凭 Bean 和方法存在就证明指标已被业务流程持续更新。当前 `MonitoringController` 提供测试接口调用部分计数器，不等同于生产业务链路已经接入。文章更新/删除计数器也未在该类中定义；应补充生产调用点和集成测试后，再将监控覆盖评价为完整。

**🟢 亮点：DatabaseMonitoringConfig 的 MyBatis 拦截器**

[DatabaseMonitoringConfig](blog-service/src/main/java/com/blog/bootstrap/config/DatabaseMonitoringConfig.java) 作为 MyBatis Plugin 拦截器，在 SQL 执行前后记录耗时，自动识别慢查询（>1s），同时记录到业务指标和 Micrometer 指标。

**🟢 Exporter 服务定义已核对**

[prometheus.yml](blog-service/monitoring/prometheus.yml) 配置了 `node-exporter:9100`、`mysql-exporter:9104`、`redis-exporter:9121` 三个抓取目标；当前 [docker-compose-monitoring.yml](blog-service/docker-compose-monitoring.yml) 已定义对应服务，名称和端口能够匹配。

**复核结论**：删除此前“exporter 未定义”的问题记录。后续应通过实际 Prometheus target 状态确认 exporter 是否可达，而不是仅根据静态文件判断。

---

### 6.6 WebSocket 实现

#### 6.6.1 架构分析

[NotificationWebSocketHandler](blog-service/src/main/java/com/blog/infrastructure/websocket/NotificationWebSocketHandler.java) 实现了：

| 功能 | 实现 | 评价 |
|------|------|------|
| 会话管理 | `ConcurrentHashMap<Long, WebSocketSession>` | 🟢 线程安全 |
| 用户映射 | `ConcurrentHashMap<String, Long>`（sessionId → userId） | 🟢 双向查找 |
| 心跳 | `ping`/`pong` 消息处理 | 🟢 保持连接活跃 |
| 单播 | `sendToUser(userId, message)` | 🟢 按用户推送 |
| 广播 | `broadcast(message)` | 🟢 全量推送 |

**🟢 亮点：握手拦截器认证**

[WebSocketHandshakeInterceptor](blog-service/src/main/java/com/blog/infrastructure/interceptor/WebSocketHandshakeInterceptor.java) 在握手阶段验证 Token：

```java
// 1. 从 URL 参数中获取 Token
String token = extractTokenFromQuery(queryString);
// 2. 使用 SaToken 验证 Token 并获取用户 ID
Object loginId = StpUtil.getLoginIdByToken(token);
// 3. 转换为 Long 类型的用户 ID（支持 Long/Integer/String）
// 4. 将用户 ID 存入 WebSocket Session 属性
attributes.put("userId", userId);
```

Token 通过 URL 查询参数传递（`ws://host/ws/notification?token=xxx`），这是浏览器 WebSocket API 的常见兼容方式，但当前握手日志会记录完整 URI，可能导致 Token 进入应用、容器或代理日志；同时 `WebSocketConfig` 当前允许任意 Origin。应避免记录完整 URI，并收紧 Origin 白名单。

**🟡 发现：单实例会话存储，不支持多实例部署**

当前 WebSocket 会话存储在 JVM 内存的 `ConcurrentHashMap` 中。如果后端部署多个实例，用户连接到实例 A，但通知通过实例 B 发送，则无法送达。

**影响**：当前个人博客场景下单实例部署无影响，但若未来需要水平扩展，需引入 Redis Pub/Sub 或消息队列来跨实例广播 WebSocket 消息。

**建议（低优先级）**：通过 `MessageQueuePlugin` 发送 WebSocket 通知时，使用 Redis Pub/Sub 广播到所有实例，每个实例再根据本地 `userSessions` 找到对应 session 发送。

**单实例缺陷**：当前 `userSessions` 是 `userId -> WebSocketSession` 的单值映射。同一用户建立第二个连接时会覆盖第一个连接，旧连接关闭时又可能删除新连接的映射。应改为 `userId -> Set<WebSocketSession>`，或在关闭时仅移除仍对应当前 session 的映射。

---

### 6.7 前后端联动：Revalidate 机制

#### 6.7.1 架构分析

[RevalidateClient](blog-service/src/main/java/com/blog/infrastructure/revalidate/RevalidateClient.java) 在后端数据变更时通知前端刷新缓存：

```java
public void revalidateTags(List<String> tags) {
    if (tags == null || tags.isEmpty() || revalidateUrl.isBlank() || revalidateToken.isBlank()) {
        return;  // 优雅降级：未配置时不报错
    }
    HttpHeaders headers = new HttpHeaders();
    headers.set("x-revalidate-token", revalidateToken);
    HttpEntity<Map<String, Object>> request = new HttpEntity<>(Map.of("tags", tags), headers);
    restTemplate.postForEntity(endpoint, request, String.class);
}
```

前端 [revalidate/route.ts](blog-web/src/app/api/revalidate/route.ts) 验证 Token 后执行 `revalidateTag()`。以下代码为简化示意；实际路由同时实现 `POST`/`GET`，并接受 Header 或 `?secret=`：

```typescript
export async function POST(req: NextRequest) {
  const token = getToken(req);
  const expected = process.env.REVALIDATE_TOKEN || '';
  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  // ... revalidateTag(tag) for each tag
}
```

**🟢 亮点**：
- 事件驱动：通过 `RevalidateEventListener` 监听文章发布/取消发布/删除事件
- 优雅降级：`revalidateUrl` 或 `revalidateToken` 未配置时静默跳过
- 安全认证：POST Header Token 比对可防止未授权触发，但当前路由也接受 GET 和 `?secret=`，且默认 token 为 `change-me`
- 异步执行：`@Async("eventTaskExecutor")` 不阻塞主流程

**部署复核**：完整 `docker-compose.yml` 仅向 `blog-service` 注入 `REVALIDATE_TOKEN`，`blog-web` 未注入同名环境变量；因此默认部署下前端路由的期望 Token 为空，后端请求会返回 401。必须向两个容器注入同一个强随机密钥，并禁止弱默认值。

---

### 6.8 第四轮问题汇总（修复前问题，状态已更新）

> 更新日期：2026-08-10

#### 🔴 高优先级

| # | 位置 | 问题 | 建议 | 状态 |
|---|------|------|------|------|
| 12 | `docker-compose.yml` + `blog-web` revalidate route | 默认部署只向后端注入 `REVALIDATE_TOKEN`，前端期望值为空；后端默认 token 为 `change-me` | 向两个容器注入同一强随机密钥，禁止弱默认值，仅接受 Header Token | ✅ 已修复；Compose 启动未在本机验证 |
| 13 | `IpUtil` + `GlobalRateLimitFilter` | 无条件信任客户端转发头，IP 限流可伪造来源绕过 | 仅在可信代理链下解析 `X-Forwarded-For`/`X-Real-IP`，否则使用连接地址 | ✅ 已修复；IP 单元测试通过 |
| 14 | `WebSocketHandshakeInterceptor` / `WebSocketConfig` | Token 进入 URL 和日志，Origin 允许 `*`；同一用户多连接还可能互相覆盖 | 脱敏日志、收紧 Origin、使用多 session 映射并验证关闭竞态 | ✅ 已修复；session 测试通过 |

#### 🟡 中优先级

| # | 位置 | 问题 | 建议 | 状态 |
|---|------|------|------|------|
| 15 | [ci.yml](.github/workflows/ci.yml) | Actions 版本不完整且存在未固定的 `trivy-action@master`，扫描也未设置失败阈值 | 升级并固定 Action 版本，明确 `exit-code` 和严重性阈值 | ✅ 已更新；GitHub 运行未验证 |
| 16 | [fetchServer](blog-web/src/lib/api/server.ts) | 缺少显式超时和取消机制，SSR 请求可能长期阻塞 | 添加 AbortController，并按 SSR/交互场景定义超时 | ✅ 已实现；lint、tsc、build 通过 |
| 17 | [schema.sql](blog-service/src/main/resources/schema.sql) | `ALTER TABLE` 重复执行依赖全局 `continue-on-error`，可能掩盖真正的初始化失败 | 使用条件式迁移或正式迁移工具 | 🟡 已改为条件迁移；MySQL 启动验证待执行 |
| 18 | [sanitize.ts](blog-web/src/lib/utils/sanitize.ts) / [sanitize.server.ts](blog-web/src/lib/utils/sanitize.server.ts) | SSR 正则分支不是完整白名单清洗，覆盖范围小于浏览器 DOM 分支 | 使用服务端白名单清洗或补充 SSR XSS 测试 | ✅ 已增加服务端白名单清洗 |
| 19 | [docker-compose.yml](docker-compose.yml) | MySQL `max-connections=20`，Docker profile 的 HikariCP 池上限同样为 20，连接余量偏紧 | 根据实测并发协调数据库上限、应用池和监控连接 | ✅ Hikari 池已降为 10 |
| 20 | [BlogMetrics](blog-service/src/main/java/com/blog/infrastructure/metrics/BlogMetrics.java) | 指标定义存在，但文章更新/删除指标缺失，Gauge 和部分计数器的生产调用链未证实 | 区分生产调用与测试接口，补充业务调用点、指标语义和集成测试 | 🟡 生命周期指标已接入；active users 仍待业务来源 |
| 21 | `blog-web` lint | 当前 lint 失败：33 个 error、23 个 warning，CI 的博客前台检查无法通过 | 优先修复 TypeScript `any`、React purity、effect state 更新等错误，再恢复 CI 绿灯 | ✅ 0 errors / 0 warnings |
| 22 | `/api/monitoring` + `SaTokenConfig` | 登录拦截器未覆盖该路径，但权限拦截器覆盖 `/api/**` 并假设 `UserContext` 已设置，未登录请求可能变成 500 而非 401/403 | 明确该路径的认证策略，补充未登录、普通角色和管理员的 HTTP 测试 | ✅ 已补认证链和 null 防护；端到端 HTTP 待验证 |

#### 🟢 低优先级（后续迭代考虑）

| # | 位置 | 问题 | 建议 | 状态 |
|---|------|------|------|------|
| 23 | [NotificationWebSocketHandler](blog-service/src/main/java/com/blog/infrastructure/websocket/NotificationWebSocketHandler.java) | JVM 内存 session 不支持多实例跨节点推送 | 引入 Redis Pub/Sub 或消息队列广播 | ⏳ 本轮按范围暂缓 |
| 24 | [ExternalLinkDialog](blog-web/src/components/markdown/ExternalLinkDialog.tsx) | 外链确认是用户提示，不是安全阻断 | 将文案改为离站提示，保留 `noopener,noreferrer` | ✅ 文案已调整 |

---

### 6.9 第四轮总体评价（修复前基线）

| 维度 | 评分 | 说明 |
|------|------|------|
| 前端内容安全 | ⭐⭐⭐⭐ | 后端/前端清洗和密码 Token 机制存在，但 SSR 清洗覆盖有限，页面 CSP 尚未配置 |
| 前端 API 层 | ⭐⭐⭐⭐ | 双通道设计，错误分类清晰，mock 支持完善；fetchServer 缺超时 |
| 前端错误处理 | ⭐⭐⭐⭐⭐ | 三层错误边界（全局/路由/组件），覆盖全面 |
| 数据库设计 | ⭐⭐⭐⭐ | 表结构覆盖面完整，无外键设计有文档说明；DDL 补列和索引有效性仍需改进 |
| CI/CD | ⭐⭐⭐ | 工作流、测试和安全扫描步骤存在，但当前 blog-web lint 未通过，且扫描未配置明确失败阈值 |
| Docker 部署 | ⭐⭐⭐⭐ | 多阶段构建、镜像 digest、缓存挂载和健康检查完善；密钥注入与 admin 非 root 需复核 |
| 监控体系 | ⭐⭐⭐⭐ | Prometheus + Grafana 和慢查询检测存在；业务指标有效性需补充验证 |
| WebSocket | ⭐⭐⭐ | 支持握手认证和心跳，但 Token 日志、Origin、单用户多连接和多实例问题待处理 |
| 前后端联动 | ⭐⭐⭐ | 事件驱动和异步机制存在，但功能实现存在、默认 Compose wiring 当前不可用 |

**第四轮总结**（修复前基线，修复进展见第六节状态和第八节）：当时默认 Compose 的缓存刷新 wiring 不可用，并确认 3 个高优先级、8 个中优先级和 2 个低优先级问题；此前关于 exporter 未定义的判断已撤销，报告中的本机绝对链接也已改为仓库相对链接。修复完成后的状态请以第八节“第五轮修复复核”为准。

---

## 七、当前架构与功能现状复核（2026-08-10）

### 7.1 架构现状

| 子系统 | 当前实现 | 现状判断 |
|---|---|---|
| 管理后台 | React 18 + Vite + Ant Design + Zustand，SPA 路由和布局分离 | 代码检查通过；主路由已集中配置，但部分动作/父级标题仍有静态映射 |
| 博客前台 | Next.js 16.1 + React 19 + App Router + next-intl + Tailwind 4 | lint、TypeScript 和生产构建通过；SSR 和客户端请求分离，`fetchServer` 已增加超时 |
| 后端服务 | Spring Boot 3.4 + Java 21 + MyBatis-Plus，按 bootstrap/infrastructure/modules/plugin/shared 组织 | 测试通过；插件通过条件 Bean 在启动时选择，不支持动态热插拔 |
| 认证授权 | Sa-Token 登录拦截器 + API 资源/角色权限拦截器 | `/api/monitoring/**` 已纳入登录拦截，权限拦截器增加未登录防护；HTTP 端到端结果待验证 |
| 缓存 | RedisTemplate + RedisCacheManager，多种业务 TTL | 配置存在；当前不是 Caffeine + Redis 两级缓存 |
| 消息与通知 | RabbitMQ、内存插件、邮件、WebSocket | 实现存在、条件可用；RabbitMQ 失败不自动 fallback，单实例 WebSocket 多连接已修复，多实例广播仍未实现 |
| 部署 | Docker 多阶段构建、Compose、Nginx HTTP/HTTPS profile | Token、可信代理和 Origin wiring 已补齐；当前环境没有 Compose CLI，未执行容器启动验证 |
| 监控 | Actuator/Micrometer、Prometheus、Grafana、Alertmanager、Exporter | 静态配置完整；文章生命周期指标已接入，active users Gauge 和告警阻断策略仍需验证 |

### 7.2 功能现状

| 功能 | 当前路径/组件 | 状态 | 说明 |
|---|---|---|---|
| 文章发布与前台展示 | `modules/article`、`blog-web/src/app/[locale]` | 实现存在 | 支持 Markdown、分类、标签、发布和前台 SSR；生产构建通过，但本轮未做端到端发布/浏览验证 |
| 搜索 | `DatabaseSearchPlugin`、可选 `ElasticsearchSearchPlugin` | 实现存在、条件可用 | 默认数据库搜索；ES 需要单独启用和完成索引同步，插件接口中的部分索引方法由同步服务承担或为空实现 |
| 评论、说说、留言 | `modules/comment`、`modules/talk`、`modules/guestbook` | 实现存在 | 说说写入使用后端 HTML 白名单清洗；本轮未执行端到端提交验证，Markdown 前端清洗仍需覆盖 SSR 分支测试 |
| 用户、登录、RBAC | `modules/user`、`modules/system`、Sa-Token | 基于代码基本可用 | 管理接口和资源权限存在；`/api/monitoring/**` 已补认证链，仍应补充未登录、无权限和 HTTP 状态测试 |
| 文件上传与存储 | `FileServiceImpl`、Local/OSS/Qiniu 插件 | 实现存在、条件可用 | 默认本地存储，支持扩展名和大小校验；存储类型分类逻辑仍有重复实现 |
| 密码文章 | `PasswordGate`、后端 Redis Token | 可用但需加固 | 使用 TTL Token 替代明文密码，但 Token 存在 localStorage，XSS 仍可窃取；应限制 Token 暴露面 |
| 实时通知 | `NotificationWebSocketHandler`、MQ、邮件 | 实现存在、条件可用 | Token 仍通过 URL 传递但日志已脱敏，Origin 和单用户多连接已加固；多实例推送仍有风险 |
| 缓存刷新 | `RevalidateEventListener`、`/api/revalidate` | 配置已修复、待运行验证 | 后端和前端现在共享必填 `REVALIDATE_TOKEN`，路由仅接受 Header Token；仍需容器启动后验证文章发布刷新 |
| CI/CD | `.github/workflows/ci.yml` | 本地门禁通过 | 后端测试、两个前端 lint 和两个前端生产构建通过；Trivy 现在配置 HIGH/CRITICAL 阻断，GitHub 实际运行待验证 |
| 监控与告警 | `monitoring/`、Actuator、Micrometer | 静态配置存在 | Exporter 服务已定义，文章指标有生产调用；应通过 Prometheus Targets、active users 样本和告警演练验证有效性 |

### 7.3 历史问题处置状态

| 历史编号 | 当前状态 | 说明 |
|---|---|---|
| #1-#5 | 已处理 | 接口声明、死代码、工厂过滤和重复工厂逻辑已完成对应重构 |
| #6 | 部分处理 | `PluginSearchServiceImpl` 已捕获部分异常，但默认业务码仍为 500，`getFacetCounts()` 仍需单独处理 |
| #7-#10 | 仍存在/待明确 | Quartz Runnable、Spring Cron、RabbitMQ 延迟消息和搜索索引接口仍需实现或明确“不支持/由同步服务负责” |
| #11 | 低优先级待评估 | API 版本控制尚未引入，当前仍使用 `/api/**` 路径 |

### 7.4 当前发布判断

从源码结构、测试和构建结果看，项目具备单实例个人博客运行基础，核心文章、用户、评论、文件、搜索和通知功能均已有实现；本轮未完成 Compose 容器启动和端到端验证，因此不应将其描述为“无条件生产级”。发布前至少需要完成：

1. 使用真实强随机值启动 Compose，验证前后端 Revalidate Token wiring 和文章缓存刷新。
2. 在真实反向代理拓扑下配置 `SECURITY_TRUSTED_PROXIES`，验证 IP 限流和 WebSocket Origin。
3. 在 MySQL 实例上执行一次全新库和已有库启动，验证条件迁移和 `continue-on-error=false`。
4. 补充 HTTP 状态码、RBAC、active users 指标和 Revalidate 的集成测试。
5. 在 GitHub Actions 上验证升级后的 Action、Trivy 阻断策略和构建产物上传。
6. 评估 admin 容器实际运行用户，并保留多实例 WebSocket Pub/Sub 作为后续架构工作。

### 7.5 本次验证结果（2026-08-10；当前工作树）

| 验证项 | 命令 | 结果 |
|---|---|---|
| 后端测试 | `blog-service: ./gradlew test` | 通过，Gradle `BUILD SUCCESSFUL` |
| 管理后台 lint | `blog-admin: pnpm run lint` | 通过 |
| 博客前台 lint | `blog-web: pnpm run lint` | 通过，0 个 error、0 个 warning |
| 博客前台类型检查 | `blog-web: pnpm exec tsc --noEmit` | 通过 |
| 博客前台生产构建 | `blog-web: pnpm run build` | 通过；静态参数生成阶段因后端服务不可达记录 API fetch 警告 |
| 管理后台生产构建 | `blog-admin: pnpm run build` | 通过 |

博客前台 lint 中的 `no-explicit-any`、React purity、effect 中同步 setState、未使用变量和 Hook 依赖问题已修复。生产构建阶段仍尝试访问 `swater-blog-service:8888` 生成静态参数，但当前环境无法解析该服务名；构建最终成功并完成静态页面生成。当前环境没有 Docker Compose CLI，因此未执行容器启动、HTTP 冒烟或 Prometheus target 实测。

---

## 八、第五轮修复复核（2026-08-10）

### 8.1 修复结果

| 范围 | 修复内容 | 结果 |
|---|---|---|
| Revalidate | Compose 同时注入前后端 Token；移除弱默认值；路由仅接受 POST Header Token | 已实现，待真实 Compose 验证 |
| IP 限流 | 默认忽略伪造转发头；仅对配置的可信代理 IP/CIDR 解析；滑动窗口使用唯一请求成员 | 已实现，`IpUtilTest` 通过 |
| WebSocket | 日志不再记录完整 URI；Origin 改为可配置 pattern；同用户支持多个 session | 已实现，`NotificationWebSocketHandlerTest` 通过；多实例广播暂缓 |
| 认证与 HTTP 状态 | `/api/monitoring/**` 纳入登录拦截；缺失用户上下文返回 401；全局异常映射主要 HTTP 状态 | 已实现，端到端 HTTP 验证待补 |
| SSR 与内容安全 | `fetchServer` 默认 15 秒超时并支持外部 AbortSignal；服务端使用 `sanitize-html` 白名单清洗 | lint、tsc 和 build 通过 |
| blog-web 质量 | 修复 `any`、React purity、effect 状态更新、Hook 依赖、未使用变量和图片规则 | 0 errors / 0 warnings |
| 数据库与连接池 | `article.password` 条件迁移；关闭全局 `continue-on-error`；Hikari 上限调整为 10 | 配置已实现，MySQL 运行验证待补 |
| 业务指标 | 增加文章更新/删除计数器，接入创建/更新/删除/发布/下架和文章总数 Gauge | 生命周期指标测试通过；active users 来源仍待定义 |
| CI | 升级 cache、artifact、pnpm、Codecov、测试报告和 CodeQL Action；Trivy 阻断 HIGH/CRITICAL 漏洞 | YAML 已更新，GitHub 实际运行待验证 |

### 8.2 修复后评价

| 维度 | 修复后评分 | 说明 |
|---|---|---|
| 安全与认证 | ⭐⭐⭐⭐ | 转发头、WebSocket Origin/日志、监控路径和 HTTP 状态已加固；真实代理和 HTTP 集成测试待补 |
| 前端质量 | ⭐⭐⭐⭐ | lint、TypeScript 和生产构建通过；构建仍依赖可达的后端静态参数服务 |
| 数据库与部署 | ⭐⭐⭐⭐ | 条件迁移和连接池已修复；缺少真实 MySQL/Compose 启动验证 |
| 监控指标 | ⭐⭐⭐⭐ | 文章生命周期指标已接入；active users Gauge 和告警演练未完成 |
| CI/CD | ⭐⭐⭐⭐ | 本地测试、lint、构建通过，Action 和 Trivy 配置已更新；GitHub 运行结果待验证 |
| WebSocket | ⭐⭐⭐⭐ | 单实例多连接问题已修复；多实例 Pub/Sub 仍是后续工作 |

**第五轮结论**：高优先级安全问题和主要中优先级质量问题已完成代码修复，当前本地后端测试、前端 lint、类型检查和两个前端生产构建均通过。由于环境缺少 Docker Compose CLI、真实 MySQL 和后端静态参数服务，Revalidate、条件迁移、HTTP 权限链、Prometheus Targets 和端到端文章发布链路仍需在部署环境完成最终验收。
