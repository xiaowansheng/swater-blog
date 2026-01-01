#!/bin/bash

# ========================================
# Blog服务Docker部署脚本
# 一键部署完整的Blog服务栈
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
COMPOSE_FILE="docker-compose.yml"
MONITORING_COMPOSE_FILE="docker-compose-monitoring.yml"
PROJECT_NAME="blog"
BUILD_ARGS=""
ENVIRONMENT="production"

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    if [ "${DEBUG}" = "true" ]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
Blog服务Docker部署脚本

用法: $0 [选项] [命令]

命令:
    build           构建所有服务镜像
    up              启动所有服务
    down            停止所有服务
    restart         重启所有服务
    logs            查看服务日志
    status          查看服务状态
    clean           清理未使用的镜像和容器
    backup          备份数据
    restore         恢复数据
    monitor         启动监控服务
    health          健康检查
    update          更新服务

选项:
    -e, --env ENV           设置环境 (dev/test/prod，默认: prod)
    -f, --file FILE         指定compose文件 (默认: docker-compose.yml)
    -p, --project NAME      设置项目名称 (默认: blog)
    -d, --detach           后台运行
    -v, --verbose          详细输出
    -h, --help             显示帮助信息

示例:
    $0 up -d                    # 后台启动所有服务
    $0 -e dev up               # 开发环境启动
    $0 logs blog-service       # 查看blog服务日志
    $0 backup                  # 备份数据
    $0 monitor                 # 启动监控服务

EOF
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    # 检查Docker是否运行
    if ! docker info &> /dev/null; then
        log_error "Docker服务未运行，请启动Docker服务"
        exit 1
    fi
    
    log_info "依赖检查完成"
}

# 设置环境变量
setup_environment() {
    log_info "设置环境变量..."
    
    # 创建.env文件（如果不存在）
    if [ ! -f ".env" ]; then
        log_info "创建.env文件..."
        cat > .env << EOF
# Blog服务环境变量配置
COMPOSE_PROJECT_NAME=${PROJECT_NAME}
ENVIRONMENT=${ENVIRONMENT}

# 应用配置
APP_VERSION=1.0.0
SPRING_PROFILES_ACTIVE=docker

# 数据库配置
MYSQL_ROOT_PASSWORD=root123456
MYSQL_DATABASE=blog
MYSQL_USER=blog
MYSQL_PASSWORD=blog123456

# Redis配置
REDIS_PASSWORD=

# RabbitMQ配置
RABBITMQ_DEFAULT_USER=blog
RABBITMQ_DEFAULT_PASS=blog123456

# JVM配置
JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC
JVM_XMS=512m
JVM_XMX=1024m

# 调试配置
ENABLE_DEBUG=false
DEBUG_PORT=5005

# 监控配置
ENABLE_JMX=true
JMX_PORT=9999

# 日志配置
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_BLOG=INFO

# 文件存储配置
FILE_STORAGE_TYPE=local
FILE_LOCAL_PATH=/app/uploads
FILE_LOCAL_URL_PREFIX=/uploads

# 安全配置
SA_TOKEN_JWT_SECRET=blog-secret-key-change-in-production-$(date +%s)
SECURITY_FILE_UPLOAD_MAX_SIZE=10MB

# 功能开关
SPRINGDOC_SWAGGER_UI_ENABLED=true
NOTIFICATION_EMAIL_ENABLED=false
NOTIFICATION_WEBSOCKET_ENABLED=true
EOF
        log_info ".env文件已创建"
    fi
    
    # 加载环境变量
    if [ -f ".env" ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    log_info "环境变量设置完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    local dirs=(
        "docker/mysql"
        "docker/redis"
        "docker/nginx/conf.d"
        "docker/elasticsearch"
        "docker/rabbitmq"
        "logs"
        "uploads"
        "backups"
    )
    
    for dir in "${dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_debug "创建目录: $dir"
        fi
    done
    
    log_info "目录创建完成"
}

# 构建镜像
build_images() {
    log_info "构建Docker镜像..."
    
    if [ "$VERBOSE" = "true" ]; then
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build --no-cache
    else
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" build --no-cache > /dev/null 2>&1
    fi
    
    log_info "镜像构建完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    local compose_args="-f $COMPOSE_FILE -p $PROJECT_NAME"
    local up_args=""
    
    if [ "$DETACH" = "true" ]; then
        up_args="$up_args -d"
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        docker-compose $compose_args up $up_args
    else
        docker-compose $compose_args up $up_args > /dev/null 2>&1
    fi
    
    log_info "服务启动完成"
    
    # 等待服务就绪
    wait_for_services
}

# 停止服务
stop_services() {
    log_info "停止服务..."
    
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" down
    
    log_info "服务已停止"
}

# 重启服务
restart_services() {
    log_info "重启服务..."
    
    stop_services
    start_services
    
    log_info "服务重启完成"
}

# 查看日志
show_logs() {
    local service="$1"
    local follow_args=""
    
    if [ "$FOLLOW_LOGS" = "true" ]; then
        follow_args="-f"
    fi
    
    if [ -n "$service" ]; then
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs $follow_args "$service"
    else
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" logs $follow_args
    fi
}

# 查看服务状态
show_status() {
    log_info "服务状态:"
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" ps
    
    echo ""
    log_info "容器资源使用情况:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."
    
    local services=("mysql" "redis" "rabbitmq" "elasticsearch")
    local max_wait=300  # 最大等待时间（秒）
    local wait_time=0
    
    for service in "${services[@]}"; do
        log_info "等待 $service 服务..."
        
        while [ $wait_time -lt $max_wait ]; do
            if docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T "$service" echo "ready" &> /dev/null; then
                log_info "$service 服务已就绪"
                break
            fi
            
            sleep 5
            wait_time=$((wait_time + 5))
            
            if [ $wait_time -ge $max_wait ]; then
                log_warn "$service 服务启动超时"
                break
            fi
        done
    done
    
    # 等待应用服务
    log_info "等待应用服务..."
    wait_time=0
    
    while [ $wait_time -lt $max_wait ]; do
        if curl -f http://localhost:8888/actuator/health &> /dev/null; then
            log_info "应用服务已就绪"
            break
        fi
        
        sleep 10
        wait_time=$((wait_time + 10))
        
        if [ $wait_time -ge $max_wait ]; then
            log_warn "应用服务启动超时"
            break
        fi
    done
    
    log_info "服务就绪检查完成"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    local services=(
        "http://localhost:8888/actuator/health:Blog应用"
        "http://localhost:15672:RabbitMQ管理界面"
        "http://localhost:9200/_cluster/health:Elasticsearch"
    )
    
    for service_info in "${services[@]}"; do
        local url=$(echo "$service_info" | cut -d':' -f1)
        local name=$(echo "$service_info" | cut -d':' -f2)
        
        if curl -f "$url" &> /dev/null; then
            log_info "✓ $name - 健康"
        else
            log_error "✗ $name - 不健康"
        fi
    done
    
    log_info "健康检查完成"
}

# 清理资源
clean_resources() {
    log_info "清理未使用的资源..."
    
    # 清理未使用的镜像
    docker image prune -f
    
    # 清理未使用的容器
    docker container prune -f
    
    # 清理未使用的网络
    docker network prune -f
    
    # 清理未使用的卷（谨慎使用）
    if [ "$CLEAN_VOLUMES" = "true" ]; then
        log_warn "清理未使用的数据卷..."
        docker volume prune -f
    fi
    
    log_info "资源清理完成"
}

# 备份数据
backup_data() {
    log_info "备份数据..."
    
    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # 备份MySQL数据
    log_info "备份MySQL数据..."
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T mysql mysqldump -u blog -pblog123456 blog > "$backup_dir/mysql_backup.sql"
    
    # 备份Redis数据
    log_info "备份Redis数据..."
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T redis redis-cli BGSAVE
    docker cp "${PROJECT_NAME}_redis_1:/data/dump.rdb" "$backup_dir/redis_backup.rdb"
    
    # 备份上传文件
    log_info "备份上传文件..."
    if [ -d "uploads" ]; then
        tar -czf "$backup_dir/uploads_backup.tar.gz" uploads/
    fi
    
    # 备份配置文件
    log_info "备份配置文件..."
    tar -czf "$backup_dir/config_backup.tar.gz" docker/ .env
    
    log_info "数据备份完成: $backup_dir"
}

# 恢复数据
restore_data() {
    local backup_dir="$1"
    
    if [ -z "$backup_dir" ] || [ ! -d "$backup_dir" ]; then
        log_error "请指定有效的备份目录"
        exit 1
    fi
    
    log_info "从 $backup_dir 恢复数据..."
    
    # 恢复MySQL数据
    if [ -f "$backup_dir/mysql_backup.sql" ]; then
        log_info "恢复MySQL数据..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" exec -T mysql mysql -u blog -pblog123456 blog < "$backup_dir/mysql_backup.sql"
    fi
    
    # 恢复Redis数据
    if [ -f "$backup_dir/redis_backup.rdb" ]; then
        log_info "恢复Redis数据..."
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" stop redis
        docker cp "$backup_dir/redis_backup.rdb" "${PROJECT_NAME}_redis_1:/data/dump.rdb"
        docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" start redis
    fi
    
    # 恢复上传文件
    if [ -f "$backup_dir/uploads_backup.tar.gz" ]; then
        log_info "恢复上传文件..."
        tar -xzf "$backup_dir/uploads_backup.tar.gz"
    fi
    
    log_info "数据恢复完成"
}

# 启动监控服务
start_monitoring() {
    log_info "启动监控服务..."
    
    if [ ! -f "$MONITORING_COMPOSE_FILE" ]; then
        log_error "监控配置文件不存在: $MONITORING_COMPOSE_FILE"
        exit 1
    fi
    
    docker-compose -f "$MONITORING_COMPOSE_FILE" -p "${PROJECT_NAME}-monitoring" up -d
    
    log_info "监控服务启动完成"
    log_info "Grafana: http://localhost:3000 (admin/admin)"
    log_info "Prometheus: http://localhost:9090"
    log_info "AlertManager: http://localhost:9093"
}

# 更新服务
update_services() {
    log_info "更新服务..."
    
    # 拉取最新镜像
    docker-compose -f "$COMPOSE_FILE" -p "$PROJECT_NAME" pull
    
    # 重新构建应用镜像
    build_images
    
    # 重启服务
    restart_services
    
    log_info "服务更新完成"
}

# 解析命令行参数
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--env)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -f|--file)
                COMPOSE_FILE="$2"
                shift 2
                ;;
            -p|--project)
                PROJECT_NAME="$2"
                shift 2
                ;;
            -d|--detach)
                DETACH="true"
                shift
                ;;
            -v|--verbose)
                VERBOSE="true"
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            build|up|down|restart|logs|status|clean|backup|restore|monitor|health|update)
                COMMAND="$1"
                shift
                ;;
            *)
                SERVICE_NAME="$1"
                shift
                ;;
        esac
    done
}

# 主函数
main() {
    log_info "========================================="
    log_info "Blog服务Docker部署脚本"
    log_info "环境: $ENVIRONMENT"
    log_info "项目: $PROJECT_NAME"
    log_info "========================================="
    
    # 检查依赖
    check_dependencies
    
    # 设置环境
    setup_environment
    
    # 创建目录
    create_directories
    
    # 执行命令
    case "$COMMAND" in
        build)
            build_images
            ;;
        up)
            start_services
            ;;
        down)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs "$SERVICE_NAME"
            ;;
        status)
            show_status
            ;;
        clean)
            clean_resources
            ;;
        backup)
            backup_data
            ;;
        restore)
            restore_data "$SERVICE_NAME"
            ;;
        monitor)
            start_monitoring
            ;;
        health)
            health_check
            ;;
        update)
            update_services
            ;;
        *)
            log_error "未知命令: $COMMAND"
            show_help
            exit 1
            ;;
    esac
    
    log_info "操作完成"
}

# 解析参数并执行
parse_args "$@"
main