@echo off
REM ========================================
REM Blog服务Docker部署脚本 (Windows版本)
REM 一键部署完整的Blog服务栈
REM ========================================

setlocal enabledelayedexpansion

REM 配置变量
set COMPOSE_FILE=docker-compose.yml
set MONITORING_COMPOSE_FILE=docker-compose-monitoring.yml
set PROJECT_NAME=blog
set ENVIRONMENT=production
set DETACH=false
set VERBOSE=false
set COMMAND=
set SERVICE_NAME=

REM 颜色定义（Windows CMD限制）
set INFO_COLOR=[92m
set WARN_COLOR=[93m
set ERROR_COLOR=[91m
set RESET_COLOR=[0m

REM 日志函数
:log_info
echo %INFO_COLOR%[INFO]%RESET_COLOR% %~1
goto :eof

:log_warn
echo %WARN_COLOR%[WARN]%RESET_COLOR% %~1
goto :eof

:log_error
echo %ERROR_COLOR%[ERROR]%RESET_COLOR% %~1
goto :eof

REM 显示帮助信息
:show_help
echo Blog服务Docker部署脚本 (Windows版本)
echo.
echo 用法: %~nx0 [选项] [命令]
echo.
echo 命令:
echo     build           构建所有服务镜像
echo     up              启动所有服务
echo     down            停止所有服务
echo     restart         重启所有服务
echo     logs            查看服务日志
echo     status          查看服务状态
echo     clean           清理未使用的镜像和容器
echo     backup          备份数据
echo     monitor         启动监控服务
echo     health          健康检查
echo     update          更新服务
echo.
echo 选项:
echo     -e ENV          设置环境 (dev/test/prod，默认: prod)
echo     -f FILE         指定compose文件 (默认: docker-compose.yml)
echo     -p NAME         设置项目名称 (默认: blog)
echo     -d              后台运行
echo     -v              详细输出
echo     -h              显示帮助信息
echo.
echo 示例:
echo     %~nx0 up -d                    # 后台启动所有服务
echo     %~nx0 -e dev up               # 开发环境启动
echo     %~nx0 logs blog-service       # 查看blog服务日志
echo     %~nx0 backup                  # 备份数据
echo     %~nx0 monitor                 # 启动监控服务
echo.
goto :eof

REM 检查依赖
:check_dependencies
call :log_info "检查依赖..."

REM 检查Docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker未安装，请先安装Docker Desktop"
    exit /b 1
)

REM 检查Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        call :log_error "Docker Compose未安装，请先安装Docker Compose"
        exit /b 1
    )
)

REM 检查Docker是否运行
docker info >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker服务未运行，请启动Docker Desktop"
    exit /b 1
)

call :log_info "依赖检查完成"
goto :eof

REM 设置环境变量
:setup_environment
call :log_info "设置环境变量..."

REM 创建.env文件（如果不存在）
if not exist ".env" (
    call :log_info "创建.env文件..."
    (
        echo # Blog服务环境变量配置
        echo COMPOSE_PROJECT_NAME=%PROJECT_NAME%
        echo ENVIRONMENT=%ENVIRONMENT%
        echo.
        echo # 应用配置
        echo APP_VERSION=1.0.0
        echo SPRING_PROFILES_ACTIVE=docker
        echo.
        echo # 数据库配置
        echo MYSQL_ROOT_PASSWORD=root123456
        echo MYSQL_DATABASE=blog
        echo MYSQL_USER=blog
        echo MYSQL_PASSWORD=blog123456
        echo.
        echo # Redis配置
        echo REDIS_PASSWORD=
        echo.
        echo # RabbitMQ配置
        echo RABBITMQ_DEFAULT_USER=blog
        echo RABBITMQ_DEFAULT_PASS=blog123456
        echo.
        echo # JVM配置
        echo JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC
        echo JVM_XMS=512m
        echo JVM_XMX=1024m
        echo.
        echo # 调试配置
        echo ENABLE_DEBUG=false
        echo DEBUG_PORT=5005
        echo.
        echo # 监控配置
        echo ENABLE_JMX=true
        echo JMX_PORT=9999
        echo.
        echo # 日志配置
        echo LOGGING_LEVEL_ROOT=INFO
        echo LOGGING_LEVEL_COM_BLOG=INFO
        echo.
        echo # 安全配置
        echo SA_TOKEN_JWT_SECRET=blog-secret-key-change-in-production
        echo SECURITY_FILE_UPLOAD_MAX_SIZE=10MB
        echo.
        echo # 功能开关
        echo SPRINGDOC_SWAGGER_UI_ENABLED=true
        echo NOTIFICATION_EMAIL_ENABLED=false
        echo NOTIFICATION_WEBSOCKET_ENABLED=true
    ) > .env
    call :log_info ".env文件已创建"
)

call :log_info "环境变量设置完成"
goto :eof

REM 创建必要的目录
:create_directories
call :log_info "创建必要的目录..."

set DIRS=docker\mysql docker\redis docker\nginx\conf.d docker\elasticsearch docker\rabbitmq logs uploads backups

for %%d in (%DIRS%) do (
    if not exist "%%d" (
        mkdir "%%d" >nul 2>&1
    )
)

call :log_info "目录创建完成"
goto :eof

REM 构建镜像
:build_images
call :log_info "构建Docker镜像..."

if "%VERBOSE%"=="true" (
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% build --no-cache
) else (
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% build --no-cache >nul 2>&1
)

if errorlevel 1 (
    call :log_error "镜像构建失败"
    exit /b 1
)

call :log_info "镜像构建完成"
goto :eof

REM 启动服务
:start_services
call :log_info "启动服务..."

set UP_ARGS=
if "%DETACH%"=="true" (
    set UP_ARGS=-d
)

if "%VERBOSE%"=="true" (
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% up %UP_ARGS%
) else (
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% up %UP_ARGS% >nul 2>&1
)

if errorlevel 1 (
    call :log_error "服务启动失败"
    exit /b 1
)

call :log_info "服务启动完成"
call :wait_for_services
goto :eof

REM 停止服务
:stop_services
call :log_info "停止服务..."

docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% down

call :log_info "服务已停止"
goto :eof

REM 重启服务
:restart_services
call :log_info "重启服务..."

call :stop_services
call :start_services

call :log_info "服务重启完成"
goto :eof

REM 查看日志
:show_logs
if "%SERVICE_NAME%"=="" (
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% logs
) else (
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% logs %SERVICE_NAME%
)
goto :eof

REM 查看服务状态
:show_status
call :log_info "服务状态:"
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% ps

echo.
call :log_info "容器资源使用情况:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
goto :eof

REM 等待服务就绪
:wait_for_services
call :log_info "等待服务就绪..."

REM 等待MySQL
call :log_info "等待MySQL服务..."
:wait_mysql
timeout /t 5 /nobreak >nul
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% exec -T mysql mysqladmin ping -h localhost -u blog -pblog123456 >nul 2>&1
if errorlevel 1 goto wait_mysql

REM 等待Redis
call :log_info "等待Redis服务..."
:wait_redis
timeout /t 5 /nobreak >nul
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% exec -T redis redis-cli ping >nul 2>&1
if errorlevel 1 goto wait_redis

REM 等待应用服务
call :log_info "等待应用服务..."
:wait_app
timeout /t 10 /nobreak >nul
curl -f http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 goto wait_app

call :log_info "服务就绪检查完成"
goto :eof

REM 健康检查
:health_check
call :log_info "执行健康检查..."

call :log_info "检查Blog应用..."
curl -f http://localhost:8080/actuator/health >nul 2>&1
if errorlevel 1 (
    call :log_error "✗ Blog应用 - 不健康"
) else (
    call :log_info "✓ Blog应用 - 健康"
)

call :log_info "检查RabbitMQ管理界面..."
curl -f http://localhost:15672 >nul 2>&1
if errorlevel 1 (
    call :log_error "✗ RabbitMQ管理界面 - 不健康"
) else (
    call :log_info "✓ RabbitMQ管理界面 - 健康"
)

call :log_info "检查Elasticsearch..."
curl -f http://localhost:9200/_cluster/health >nul 2>&1
if errorlevel 1 (
    call :log_error "✗ Elasticsearch - 不健康"
) else (
    call :log_info "✓ Elasticsearch - 健康"
)

call :log_info "健康检查完成"
goto :eof

REM 清理资源
:clean_resources
call :log_info "清理未使用的资源..."

docker image prune -f >nul 2>&1
docker container prune -f >nul 2>&1
docker network prune -f >nul 2>&1

call :log_info "资源清理完成"
goto :eof

REM 备份数据
:backup_data
call :log_info "备份数据..."

REM 创建备份目录
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set BACKUP_DATE=%%d%%b%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set BACKUP_TIME=%%a%%b
set BACKUP_DIR=backups\%BACKUP_DATE%_%BACKUP_TIME%
mkdir "%BACKUP_DIR%" >nul 2>&1

REM 备份MySQL数据
call :log_info "备份MySQL数据..."
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% exec -T mysql mysqladmin ping -h localhost -u blog -pblog123456 >nul 2>&1
if not errorlevel 1 (
    docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% exec -T mysql mysqldump -u blog -pblog123456 blog > "%BACKUP_DIR%\mysql_backup.sql"
)

REM 备份上传文件
call :log_info "备份上传文件..."
if exist "uploads" (
    powershell -command "Compress-Archive -Path 'uploads' -DestinationPath '%BACKUP_DIR%\uploads_backup.zip'"
)

REM 备份配置文件
call :log_info "备份配置文件..."
powershell -command "Compress-Archive -Path 'docker','.env' -DestinationPath '%BACKUP_DIR%\config_backup.zip'"

call :log_info "数据备份完成: %BACKUP_DIR%"
goto :eof

REM 启动监控服务
:start_monitoring
call :log_info "启动监控服务..."

if not exist "%MONITORING_COMPOSE_FILE%" (
    call :log_error "监控配置文件不存在: %MONITORING_COMPOSE_FILE%"
    exit /b 1
)

docker-compose -f %MONITORING_COMPOSE_FILE% -p %PROJECT_NAME%-monitoring up -d

call :log_info "监控服务启动完成"
call :log_info "Grafana: http://localhost:3000 (admin/admin)"
call :log_info "Prometheus: http://localhost:9090"
call :log_info "AlertManager: http://localhost:9093"
goto :eof

REM 更新服务
:update_services
call :log_info "更新服务..."

REM 拉取最新镜像
docker-compose -f %COMPOSE_FILE% -p %PROJECT_NAME% pull

REM 重新构建应用镜像
call :build_images

REM 重启服务
call :restart_services

call :log_info "服务更新完成"
goto :eof

REM 解析命令行参数
:parse_args
:parse_loop
if "%~1"=="" goto parse_done

if "%~1"=="-e" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto parse_loop
)
if "%~1"=="--env" (
    set ENVIRONMENT=%~2
    shift
    shift
    goto parse_loop
)
if "%~1"=="-f" (
    set COMPOSE_FILE=%~2
    shift
    shift
    goto parse_loop
)
if "%~1"=="--file" (
    set COMPOSE_FILE=%~2
    shift
    shift
    goto parse_loop
)
if "%~1"=="-p" (
    set PROJECT_NAME=%~2
    shift
    shift
    goto parse_loop
)
if "%~1"=="--project" (
    set PROJECT_NAME=%~2
    shift
    shift
    goto parse_loop
)
if "%~1"=="-d" (
    set DETACH=true
    shift
    goto parse_loop
)
if "%~1"=="--detach" (
    set DETACH=true
    shift
    goto parse_loop
)
if "%~1"=="-v" (
    set VERBOSE=true
    shift
    goto parse_loop
)
if "%~1"=="--verbose" (
    set VERBOSE=true
    shift
    goto parse_loop
)
if "%~1"=="-h" (
    call :show_help
    exit /b 0
)
if "%~1"=="--help" (
    call :show_help
    exit /b 0
)

REM 检查是否是命令
if "%~1"=="build" set COMMAND=build
if "%~1"=="up" set COMMAND=up
if "%~1"=="down" set COMMAND=down
if "%~1"=="restart" set COMMAND=restart
if "%~1"=="logs" set COMMAND=logs
if "%~1"=="status" set COMMAND=status
if "%~1"=="clean" set COMMAND=clean
if "%~1"=="backup" set COMMAND=backup
if "%~1"=="monitor" set COMMAND=monitor
if "%~1"=="health" set COMMAND=health
if "%~1"=="update" set COMMAND=update

if not "%COMMAND%"=="" (
    shift
    goto parse_loop
)

REM 其他参数作为服务名
set SERVICE_NAME=%~1
shift
goto parse_loop

:parse_done
goto :eof

REM 主函数
:main
call :log_info "========================================="
call :log_info "Blog服务Docker部署脚本 (Windows版本)"
call :log_info "环境: %ENVIRONMENT%"
call :log_info "项目: %PROJECT_NAME%"
call :log_info "========================================="

REM 检查依赖
call :check_dependencies
if errorlevel 1 exit /b 1

REM 设置环境
call :setup_environment

REM 创建目录
call :create_directories

REM 执行命令
if "%COMMAND%"=="build" call :build_images
if "%COMMAND%"=="up" call :start_services
if "%COMMAND%"=="down" call :stop_services
if "%COMMAND%"=="restart" call :restart_services
if "%COMMAND%"=="logs" call :show_logs
if "%COMMAND%"=="status" call :show_status
if "%COMMAND%"=="clean" call :clean_resources
if "%COMMAND%"=="backup" call :backup_data
if "%COMMAND%"=="monitor" call :start_monitoring
if "%COMMAND%"=="health" call :health_check
if "%COMMAND%"=="update" call :update_services

if "%COMMAND%"=="" (
    call :log_error "请指定命令"
    call :show_help
    exit /b 1
)

call :log_info "操作完成"
goto :eof

REM 程序入口
call :parse_args %*
call :main