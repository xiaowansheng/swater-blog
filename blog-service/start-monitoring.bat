@echo off
echo ========================================
echo 启动Blog服务监控栈
echo ========================================

echo.
echo 1. 检查Docker是否运行...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: Docker未安装或未运行
    pause
    exit /b 1
)

echo.
echo 2. 启动监控服务...
docker-compose -f docker-compose-monitoring.yml up -d

echo.
echo 3. 等待服务启动...
timeout /t 30 /nobreak

echo.
echo 4. 检查服务状态...
docker-compose -f docker-compose-monitoring.yml ps

echo.
echo ========================================
echo 监控服务已启动！
echo.
echo 访问地址:
echo - Grafana面板: http://localhost:3000 (admin/admin123)
echo - Prometheus: http://localhost:9090
echo - AlertManager: http://localhost:9093
echo - Blog服务健康检查: http://localhost:8080/actuator/health
echo - Blog服务指标: http://localhost:8080/actuator/prometheus
echo ========================================

pause