@echo off
echo ========================================
echo 生成Blog API文档
echo ========================================

echo.
echo 1. 启动应用...
start /b gradlew bootRun

echo 等待应用启动...
timeout /t 30 /nobreak

echo.
echo 2. 检查应用是否启动成功...
curl -s http://localhost:8888/actuator/health >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 应用启动失败或未完全启动
    echo 请检查应用日志
    pause
    exit /b 1
)
echo 应用启动成功！

echo.
echo 3. 生成OpenAPI规范文档...
if not exist "docs\api" mkdir docs\api

curl -s http://localhost:8888/v3/api-docs > docs\api\openapi.json
if %errorlevel% neq 0 (
    echo 错误: 无法获取OpenAPI文档
    pause
    exit /b 1
)
echo OpenAPI规范文档已生成: docs\api\openapi.json

echo.
echo 4. 生成分组API文档...
curl -s http://localhost:8888/v3/api-docs/public > docs\api\public-api.json
curl -s http://localhost:8888/v3/api-docs/admin > docs\api\admin-api.json
curl -s http://localhost:8888/v3/api-docs/auth > docs\api\auth-api.json
curl -s http://localhost:8888/v3/api-docs/monitoring > docs\api\monitoring-api.json

echo.
echo 5. 生成Postman集合...
echo 正在生成Postman集合文件...
powershell -Command "
$json = Get-Content 'docs\api\openapi.json' | ConvertFrom-Json
$postman = @{
    info = @{
        name = 'Blog API'
        description = 'Blog系统API集合'
        schema = 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    }
    item = @()
    variable = @(
        @{
            key = 'baseUrl'
            value = 'http://localhost:8888'
            type = 'string'
        }
        @{
            key = 'token'
            value = ''
            type = 'string'
        }
    )
}
$postman | ConvertTo-Json -Depth 10 | Out-File 'docs\api\Blog-API.postman_collection.json' -Encoding UTF8
"

echo.
echo 6. 创建API文档索引页面...
echo ^<!DOCTYPE html^> > docs\api\index.html
echo ^<html lang="zh-CN"^> >> docs\api\index.html
echo ^<head^> >> docs\api\index.html
echo     ^<meta charset="UTF-8"^> >> docs\api\index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> docs\api\index.html
echo     ^<title^>Blog API 文档^</title^> >> docs\api\index.html
echo     ^<style^> >> docs\api\index.html
echo         body { font-family: Arial, sans-serif; margin: 40px; } >> docs\api\index.html
echo         .container { max-width: 800px; margin: 0 auto; } >> docs\api\index.html
echo         .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; } >> docs\api\index.html
echo         .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; } >> docs\api\index.html
echo         .btn:hover { background: #0056b3; } >> docs\api\index.html
echo     ^</style^> >> docs\api\index.html
echo ^</head^> >> docs\api\index.html
echo ^<body^> >> docs\api\index.html
echo     ^<div class="container"^> >> docs\api\index.html
echo         ^<h1^>Blog API 文档^</h1^> >> docs\api\index.html
echo         ^<p^>欢迎使用Blog系统API文档，以下是可用的文档和工具：^</p^> >> docs\api\index.html
echo         ^<div class="card"^> >> docs\api\index.html
echo             ^<h3^>📖 在线文档^</h3^> >> docs\api\index.html
echo             ^<p^>交互式API文档，可以直接测试API^</p^> >> docs\api\index.html
echo             ^<a href="http://localhost:8888/swagger-ui.html" class="btn" target="_blank"^>打开Swagger UI^</a^> >> docs\api\index.html
echo         ^</div^> >> docs\api\index.html
echo         ^<div class="card"^> >> docs\api\index.html
echo             ^<h3^>📄 OpenAPI规范^</h3^> >> docs\api\index.html
echo             ^<p^>标准的OpenAPI 3.0规范文档^</p^> >> docs\api\index.html
echo             ^<a href="openapi.json" class="btn"^>完整API规范^</a^> >> docs\api\index.html
echo             ^<a href="public-api.json" class="btn"^>公开接口^</a^> >> docs\api\index.html
echo             ^<a href="admin-api.json" class="btn"^>管理接口^</a^> >> docs\api\index.html
echo             ^<a href="auth-api.json" class="btn"^>认证接口^</a^> >> docs\api\index.html
echo         ^</div^> >> docs\api\index.html
echo         ^<div class="card"^> >> docs\api\index.html
echo             ^<h3^>🚀 Postman集合^</h3^> >> docs\api\index.html
echo             ^<p^>导入到Postman中进行API测试^</p^> >> docs\api\index.html
echo             ^<a href="Blog-API.postman_collection.json" class="btn"^>下载Postman集合^</a^> >> docs\api\index.html
echo         ^</div^> >> docs\api\index.html
echo     ^</div^> >> docs\api\index.html
echo ^</body^> >> docs\api\index.html
echo ^</html^> >> docs\api\index.html

echo.
echo ========================================
echo API文档生成完成！
echo.
echo 📖 在线文档: http://localhost:8888/swagger-ui.html
echo 📄 文档索引: docs\api\index.html
echo 📋 OpenAPI规范: docs\api\openapi.json
echo 🚀 Postman集合: docs\api\Blog-API.postman_collection.json
echo.
echo 提示: 应用需要保持运行状态才能访问在线文档
echo ========================================

pause