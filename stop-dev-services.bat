@echo off
echo ========================================
echo 停止开发环境基础服务
echo ========================================

echo 正在停止所有服务...
docker-compose -f docker-compose.dev.yml down

echo.
echo 服务已停止！
echo.
echo 如需完全清理（删除数据卷），请运行：
echo docker-compose -f docker-compose.dev.yml down -v
echo.
pause