@echo off
echo ========================================
echo Blog数据库优化脚本
echo ========================================

echo.
echo 请确保已备份数据库！
echo 按任意键继续，或Ctrl+C取消...
pause

echo.
echo 1. 检查MySQL连接...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: MySQL客户端未安装或未在PATH中
    pause
    exit /b 1
)

set /p DB_HOST="请输入数据库主机 (默认: localhost): "
if "%DB_HOST%"=="" set DB_HOST=localhost

set /p DB_PORT="请输入数据库端口 (默认: 3306): "
if "%DB_PORT%"=="" set DB_PORT=3306

set /p DB_NAME="请输入数据库名 (默认: blog): "
if "%DB_NAME%"=="" set DB_NAME=blog

set /p DB_USER="请输入数据库用户名 (默认: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_PASS="请输入数据库密码: "

echo.
echo 2. 测试数据库连接...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "SELECT 1;" %DB_NAME% >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 数据库连接失败
    pause
    exit /b 1
)
echo 数据库连接成功！

echo.
echo 3. 执行索引优化...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% %DB_NAME% < src/main/resources/db/optimization/01-index-optimization.sql
if %errorlevel% neq 0 (
    echo 警告: 索引优化执行时出现错误
) else (
    echo 索引优化完成！
)

echo.
echo 4. 执行分区策略（可选）...
set /p ENABLE_PARTITION="是否启用分区策略？(y/N): "
if /i "%ENABLE_PARTITION%"=="y" (
    mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% %DB_NAME% < src/main/resources/db/optimization/02-partition-strategy.sql
    if %errorlevel% neq 0 (
        echo 警告: 分区策略执行时出现错误
    ) else (
        echo 分区策略配置完成！
    )
) else (
    echo 跳过分区策略配置
)

echo.
echo 5. 应用查询优化配置...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% %DB_NAME% < src/main/resources/db/optimization/03-query-optimization.sql
if %errorlevel% neq 0 (
    echo 警告: 查询优化配置时出现错误
) else (
    echo 查询优化配置完成！
)

echo.
echo 6. 分析表统计信息...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "ANALYZE TABLE article, comment, user, category, tag;" %DB_NAME%
if %errorlevel% neq 0 (
    echo 警告: 表分析时出现错误
) else (
    echo 表分析完成！
)

echo.
echo 7. 生成优化报告...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "
SELECT 
    TABLE_NAME as '表名',
    TABLE_ROWS as '行数',
    ROUND(DATA_LENGTH / 1024 / 1024, 2) as '数据大小(MB)',
    ROUND(INDEX_LENGTH / 1024 / 1024, 2) as '索引大小(MB)',
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) as '总大小(MB)'
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = '%DB_NAME%'
    AND TABLE_TYPE = 'BASE TABLE'
ORDER BY 
    (DATA_LENGTH + INDEX_LENGTH) DESC;
" %DB_NAME%

echo.
echo ========================================
echo 数据库优化完成！
echo.
echo 优化内容:
echo - ✓ 添加了复合索引以提高查询性能
echo - ✓ 配置了全文搜索索引
echo - ✓ 更新了表统计信息
if /i "%ENABLE_PARTITION%"=="y" (
    echo - ✓ 配置了分区策略（日志表）
)
echo.
echo 建议:
echo 1. 监控慢查询日志
echo 2. 定期执行 ANALYZE TABLE
echo 3. 关注数据库性能指标
echo 4. 根据实际使用情况调整索引
echo ========================================

pause