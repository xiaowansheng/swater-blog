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
echo 2. 启动基础服务 (MySQL, Redis, RabbitMQ, Elasticsearch)...
cd blog-service
docker-compose up -d mysql redis rabbitmq elasticsearch

echo.
echo 3. 等待服务启动...
timeout /t 30 /nobreak

echo.
echo 4. 检查服务状态...
docker-compose ps

echo.
echo 5. 启动后端服务...
start "后端服务" cmd /k "gradlew bootRun --args='--spring.profiles.active=dev'"

echo.
echo 6. 等待后端服务启动...
timeout /t 20 /nobreak

echo.
echo 7. 启动前端服务...
cd ..\blog-admin
start "前端服务" cmd /k "npm run dev"

echo.
echo ========================================
echo 开发环境启动完成！
echo ========================================
echo.
echo 服务地址:
echo - 后端API: http://localhost:8888
echo - 前端管理: http://localhost:3000
echo - API文档: http://localhost:8888/swagger-ui.html
echo - 监控面板: http://localhost:8888/actuator
echo.
echo 数据库连接:
echo - MySQL: localhost:3306
echo - Redis: localhost:6379
echo - RabbitMQ管理: http://localhost:15672 (guest/guest)
echo - Elasticsearch: http://localhost:9200
echo.
pause