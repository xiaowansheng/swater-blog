# Blog API 文档说明

本文档只保留当前仓库内已经实现并且前端正在使用的 API 约定；更细的参数和响应示例以 Swagger 为准。

## 1. 分组

- `/api/public/**`：前台公开接口
- `/api/auth/**`：认证接口
- `/api/admin/**`：管理端接口

## 2. 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1640995200000
}
```

## 3. 认证方式

```http
Authorization: Bearer <token>
```

## 4. 认证接口

### 登录

`POST /api/auth/login`

请求体：

```json
{
  "username": "admin",
  "password": "123456"
}
```

返回 `LoginVO`，包含：

- `token`
- `tokenType`
- `expiresIn`
- `userInfo`

### 当前用户

`GET /api/auth/current`

这是 `blog-admin` 当前使用的接口。

### 登出

`POST /api/auth/logout`

### 刷新 Token

`POST /api/auth/refresh`

这是 `blog-admin` 当前使用的刷新接口。

兼容接口：

- `GET /api/auth/user-info`
- `POST /api/auth/refresh-token?refreshToken=...`

### 邮箱验证码登录与重置

- `POST /api/auth/login/email`
- `POST /api/auth/send-code`
- `POST /api/auth/email/verify`
- `POST /api/auth/reset-password`

## 5. 公开接口示例

- `GET /api/public/post/list`
- `GET /api/public/post/{id}`
- `GET /api/public/search`

## 6. 管理接口示例

- `POST /api/admin/post`
- `PUT /api/admin/post/{id}`
- `DELETE /api/admin/post/{id}`
- `POST /api/admin/file/upload`
- `GET /api/admin/statistics/overview`

## 7. 调试入口

- Swagger：`http://localhost:8888/swagger-ui.html`
- 开发监控：`http://localhost:8081/actuator`
- Docker / 生产 profile：`/actuator` 默认跟随后端主端口

## 8. 维护规则

- 旧文档中不存在的 `docs/api/*` 产物不再作为事实来源
- 如果接口路径发生变化，必须同步更新控制器注解、前端调用和本文档
