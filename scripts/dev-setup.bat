@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM Swater Blog 开发环境快速搭建脚本 (Windows)
REM ========================================

echo 🚀 开始搭建 Swater Blog 开发环境...

if /i "%CD:~0,16%"=="\\wsl.localhost\" (
    echo ❌ 当前目录位于 WSL 文件系统: %CD%
    echo 请改为在 WSL 终端中进入该仓库后运行 docker compose 或 ./scripts/dev-setup.sh
    echo 不要从 Windows 侧对 \\wsl.localhost\... 路径直接启动 Compose，否则文件绑定挂载会失败
    pause
    exit /b 1
)

REM 检查命令是否存在
:check_command
where %1 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ %1 未安装，请先安装 %1
    exit /b 1
) else (
    echo ✅ %1 已安装
)
goto :eof

REM 检查必要的工具
echo 📋 检查必要工具...
call :check_command java
call :check_command node
call :check_command npm
call :check_command docker
docker compose version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose V2 不可用，请确认 docker compose version 可以执行
    exit /b 1
) else (
    echo ✅ Docker Compose V2 已安装
)

REM 检查 Java 版本
echo ☕ 检查 Java 版本...
for /f "tokens=3" %%i in ('java -version 2^>^&1 ^| findstr "version"') do (
    set JAVA_VERSION=%%i
    set JAVA_VERSION=!JAVA_VERSION:"=!
    for /f "tokens=1 delims=." %%j in ("!JAVA_VERSION!") do set JAVA_MAJOR=%%j
)
if !JAVA_MAJOR! lss 21 (
    echo ❌ 需要 Java 21 或更高版本，当前版本: !JAVA_VERSION!
    exit /b 1
) else (
    echo ✅ Java 版本符合要求: !JAVA_VERSION!
)

REM 检查 Node.js 版本
echo 📦 检查 Node.js 版本...
for /f "tokens=1" %%i in ('node -v') do (
    set NODE_VERSION=%%i
    set NODE_VERSION=!NODE_VERSION:v=!
    for /f "tokens=1 delims=." %%j in ("!NODE_VERSION!") do set NODE_MAJOR=%%j
)
if !NODE_MAJOR! lss 18 (
    echo ❌ 需要 Node.js 18 或更高版本，当前版本: v!NODE_VERSION!
    exit /b 1
) else (
    echo ✅ Node.js 版本符合要求: v!NODE_VERSION!
)

REM 创建环境变量文件
echo 📝 创建环境变量文件...
if not exist .env (
    copy .env.example .env >nul
    echo ✅ 已创建 .env 文件，请根据需要修改配置
) else (
    echo ⚠️  .env 文件已存在，跳过创建
)

REM 启动依赖服务
echo 🐳 启动依赖服务 (MySQL, Redis, RabbitMQ)...
docker compose -f docker-compose.env.yml up -d mysql redis rabbitmq

REM 等待服务启动
echo ⏳ 等待服务启动完成...
timeout /t 30 /nobreak >nul

REM 检查服务状态
echo 🔍 检查服务状态...
docker compose ps

REM 安装后端依赖并构建
echo 🔧 构建后端服务...
cd blog-service
gradlew.bat clean build -x test
cd ..

REM 安装前端依赖
echo 📦 安装管理后台依赖...
cd blog-admin
npm install
cd ..

if exist blog-web (
    echo 📦 安装博客前端依赖...
    cd blog-web
    npm install
    cd ..
)

echo 🎉 开发环境搭建完成！
echo 📋 使用说明:
echo   • 启动开发环境: scripts\start-dev.bat
echo   • 停止基础服务: docker compose -f docker-compose.env.yml down
echo   • 查看服务状态: docker compose -f docker-compose.env.yml ps
echo   • 查看服务日志: docker compose -f docker-compose.env.yml logs -f [service-name]
echo.
echo ⚠️  注意事项:
echo   • 首次启动可能需要较长时间下载依赖
echo   • 请确保端口 3000, 3001, 8888, 3306, 6379, 5672 未被占用
echo   • 修改 .env 文件中的配置以适应你的环境
echo.
echo 🚀 现在可以运行 start-dev.bat 启动开发环境！

pause
