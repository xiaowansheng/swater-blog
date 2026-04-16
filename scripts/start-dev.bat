@echo off
echo ========================================
echo 启动博客系统开发环境
echo ========================================

echo.
echo 1. 检查 Docker 是否运行...
docker --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Docker 未安装或未运行
    echo 请先安装并启动 Docker
    pause
    exit /b 1
)

echo.
echo 2. 启动基础服务 (MySQL, Redis, RabbitMQ)...
docker-compose -f docker-compose.env.yml up -d mysql redis rabbitmq

echo.
echo 3. 等待服务启动...
timeout /t 30 /nobreak

echo.
echo 4. 检查服务状态...
docker-compose ps

echo.
echo 5. 启动后端服务...
cd blog-service
start "后端服务" powershell -NoExit -Command "$envFile = Resolve-Path '..\.env'; Get-Content $envFile | ForEach-Object { if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }; $pair = $_ -split '=', 2; Set-Item -Path Env:$($pair[0]) -Value $pair[1] }; .\gradlew.bat bootRun '--args=--spring.profiles.active=dev'"

echo.
echo 6. 等待后端服务启动...
timeout /t 20 /nobreak

echo.
echo 7. 启动管理后台...
cd ..\blog-admin
start "前端服务" cmd /k "npm run dev"

echo.
echo 8. 启动博客前端...
cd ..\blog-web
start "博客前端" cmd /k "npm run dev"

echo.
echo ========================================
echo 开发环境启动完成！
echo ========================================
echo.
echo 服务地址:
echo - 后端API: http://localhost:8888
echo - 管理后台: http://localhost:3000
echo - 博客前端: http://localhost:3001
echo - API文档: http://localhost:8888/swagger-ui.html
echo - 监控面板: http://localhost:8081/actuator
echo.
echo 数据库连接:
echo - MySQL: localhost:3306
echo - Redis: localhost:6379
echo - RabbitMQ管理: http://localhost:15672 (admin / see RABBITMQ_PASSWORD in .env)
echo.
pause
