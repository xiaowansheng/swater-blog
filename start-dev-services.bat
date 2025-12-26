@echo off
echo ========================================
echo 启动开发环境基础服务
echo ========================================

echo 正在启动 MySQL、Redis、RabbitMQ、Elasticsearch...
docker-compose -f docker-compose.dev.yml up -d

echo.
echo 等待服务启动完成...
timeout /t 10 /nobreak > nul

echo.
echo ========================================
echo 服务状态检查
echo ========================================
docker-compose -f docker-compose.dev.yml ps

echo.
echo ========================================
echo 服务访问信息
echo ========================================
echo MySQL:
echo   - 地址: localhost:3306
echo   - 数据库: blog
echo   - 用户名: blog
echo   - 密码: blog123456
echo   - Root密码: root123456
echo.
echo Redis:
echo   - 地址: localhost:6379
echo   - 无密码
echo.
echo RabbitMQ:
echo   - AMQP地址: localhost:5672
echo   - 管理界面: http://localhost:15672
echo   - 用户名: admin
echo   - 密码: admin123
echo.
echo Elasticsearch:
echo   - 地址: http://localhost:9200
echo   - 集群健康: http://localhost:9200/_cluster/health
echo.
echo ========================================
echo 常用命令
echo ========================================
echo 查看日志: docker-compose -f docker-compose.dev.yml logs -f [服务名]
echo 停止服务: docker-compose -f docker-compose.dev.yml down
echo 重启服务: docker-compose -f docker-compose.dev.yml restart [服务名]
echo ========================================

pause