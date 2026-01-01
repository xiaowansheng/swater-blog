@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ========================================
REM Swater Blog 开发环境快速搭建脚本 (Windows)
REM ========================================

echo 🚀 开始搭建 Swater Blog 开发环境...

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
call :check_command docker-compose

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
echo 🐳 启动依赖服务 (MySQL, Redis, RabbitMQ, Elasticsearch)...
docker-compose up -d mysql redis rabbitmq elasticsearch

REM 等待服务启动
echo ⏳ 等待服务启动完成...
timeout /t 30 /nobreak >nul

REM 检查服务状态
echo 🔍 检查服务状态...
docker-compose ps

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

REM 创建启动脚本
echo 📜 创建启动脚本...
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 🚀 启动 Swater Blog 开发环境...
echo.
echo REM 启动后端服务
echo echo 📡 启动后端服务...
echo cd blog-service
echo start "Backend" gradlew.bat bootRun
echo cd ..
echo.
echo REM 等待后端启动
echo timeout /t 10 /nobreak ^>nul
echo.
echo REM 启动管理后台
echo echo 🖥️  启动管理后台...
echo cd blog-admin
echo start "Admin" npm run dev
echo cd ..
echo.
echo REM 启动博客前端（如果存在）
echo if exist blog-web (
echo     echo 🌐 启动博客前端...
echo     cd blog-web
echo     start "Web" npm run dev
echo     cd ..
echo ^)
echo.
echo echo ✅ 所有服务已启动！
echo echo 📡 后端服务: http://localhost:8888
echo echo 📚 API 文档: http://localhost:8888/swagger-ui.html
echo echo 🖥️  管理后台: http://localhost:3001
echo if exist blog-web (
echo     echo 🌐 博客前端: http://localhost:3000
echo ^)
echo.
echo pause
) > start-dev.bat

REM 创建停止脚本
(
echo @echo off
echo chcp 65001 ^>nul
echo echo 🛑 停止 Swater Blog 开发环境...
echo.
echo REM 停止 Docker 服务
echo docker-compose down
echo.
echo REM 停止可能运行的进程
echo taskkill /f /im java.exe 2^>nul ^|^| echo.
echo taskkill /f /im node.exe 2^>nul ^|^| echo.
echo.
echo echo ✅ 开发环境已停止
echo pause
) > stop-dev.bat

echo 🎉 开发环境搭建完成！
echo 📋 使用说明:
echo   • 启动开发环境: start-dev.bat
echo   • 停止开发环境: stop-dev.bat
echo   • 查看服务状态: docker-compose ps
echo   • 查看服务日志: docker-compose logs -f [service-name]
echo.
echo ⚠️  注意事项:
echo   • 首次启动可能需要较长时间下载依赖
echo   • 请确保端口 3000, 3001, 8888, 3306, 6379, 5672, 9200 未被占用
echo   • 修改 .env 文件中的配置以适应你的环境
echo.
echo 🚀 现在可以运行 start-dev.bat 启动开发环境！

pause