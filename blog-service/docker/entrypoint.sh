#!/bin/bash

# ========================================
# Blog服务Docker启动脚本
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# 等待服务可用
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    local timeout=${4:-30}
    
    log_info "等待 ${service_name} 服务 (${host}:${port}) 可用..."
    
    for i in $(seq 1 $timeout); do
        if nc -z "$host" "$port" 2>/dev/null; then
            log_info "${service_name} 服务已就绪"
            return 0
        fi
        log_debug "等待 ${service_name} 服务... ($i/$timeout)"
        sleep 1
    done
    
    log_error "${service_name} 服务在 ${timeout} 秒内未就绪"
    return 1
}

# 检查必需的环境变量
check_required_env() {
    # If SPRING_DATASOURCE_* is not provided, derive it from DB_* defaults.
    if [ -z "$SPRING_DATASOURCE_URL" ]; then
        local db_host=${DB_HOST:-mysql}
        local db_port=${DB_PORT:-3306}
        local db_name=${DB_NAME:-blog}
        export SPRING_DATASOURCE_URL="jdbc:mysql://${db_host}:${db_port}/${db_name}?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Shanghai"
    fi
    if [ -z "$SPRING_DATASOURCE_USERNAME" ]; then
        export SPRING_DATASOURCE_USERNAME=${DB_USER:-blog}
    fi
    if [ -z "$SPRING_DATASOURCE_PASSWORD" ]; then
        export SPRING_DATASOURCE_PASSWORD=${DB_PASSWORD:-change_me_db_password}
    fi

    local required_vars=(
        "SPRING_DATASOURCE_URL"
        "SPRING_DATASOURCE_USERNAME"
        "SPRING_DATASOURCE_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "必需的环境变量 ${var} 未设置"
            exit 1
        fi
    done
}

# 解析数据库连接信息
parse_db_info() {
    if [ -n "$SPRING_DATASOURCE_URL" ]; then
        # 从JDBC URL中提取主机和端口
        # 例如: jdbc:mysql://mysql:3306/blog
        DB_HOST=$(echo "$SPRING_DATASOURCE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
        DB_PORT=$(echo "$SPRING_DATASOURCE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
        
        if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
            log_warn "无法从JDBC URL解析数据库连接信息"
            DB_HOST="mysql"
            DB_PORT="3306"
        fi
    else
        DB_HOST=${DB_HOST:-"mysql"}
        DB_PORT=${DB_PORT:-"3306"}
    fi
}

# 等待依赖服务
wait_for_dependencies() {
    parse_db_info
    
    # 等待数据库
    if [ "$WAIT_FOR_DB" != "false" ]; then
        wait_for_service "$DB_HOST" "$DB_PORT" "MySQL数据库" 60
    fi
    
    # 等待Redis
    if [ -n "$SPRING_REDIS_HOST" ] && [ "$WAIT_FOR_REDIS" != "false" ]; then
        local redis_port=${SPRING_REDIS_PORT:-6379}
        wait_for_service "$SPRING_REDIS_HOST" "$redis_port" "Redis缓存" 30
    fi
    
    # 等待RabbitMQ
    if [ -n "$SPRING_RABBITMQ_HOST" ] && [ "$WAIT_FOR_RABBITMQ" != "false" ]; then
        local rabbitmq_port=${SPRING_RABBITMQ_PORT:-5672}
        wait_for_service "$SPRING_RABBITMQ_HOST" "$rabbitmq_port" "RabbitMQ消息队列" 30
    fi
    
    # 等待Elasticsearch - 暂时禁用
    # if [ -n "$SPRING_ELASTICSEARCH_URIS" ] && [ "$WAIT_FOR_ES" != "false" ]; then
    #     local es_host=$(echo "$SPRING_ELASTICSEARCH_URIS" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    #     local es_port=$(echo "$SPRING_ELASTICSEARCH_URIS" | sed -n 's/.*:\([0-9]*\).*/\1/p')
    #     if [ -n "$es_host" ] && [ -n "$es_port" ]; then
    #         wait_for_service "$es_host" "$es_port" "Elasticsearch搜索引擎" 30
    #     fi
    # fi
}

# 设置JVM参数
setup_jvm_options() {
    # 基础JVM参数
    local base_opts="-server -XX:+UseG1GC -XX:+UseContainerSupport"
    
    # 内存参数
    if [ -n "$JVM_XMS" ]; then
        base_opts="$base_opts -Xms$JVM_XMS"
    fi
    
    if [ -n "$JVM_XMX" ]; then
        base_opts="$base_opts -Xmx$JVM_XMX"
    fi
    
    # GC参数
    if [ "$ENABLE_GC_LOG" = "true" ]; then
        base_opts="$base_opts -Xlog:gc*:logs/gc.log:time,tags"
    fi
    
    # 调试参数
    if [ "$ENABLE_DEBUG" = "true" ]; then
        local debug_port=${DEBUG_PORT:-5005}
        base_opts="$base_opts -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:$debug_port"
        log_info "调试模式已启用，端口: $debug_port"
    fi
    
    # JMX参数
    if [ "$ENABLE_JMX" = "true" ]; then
        local jmx_port=${JMX_PORT:-9999}
        base_opts="$base_opts -Dcom.sun.management.jmxremote"
        base_opts="$base_opts -Dcom.sun.management.jmxremote.port=$jmx_port"
        base_opts="$base_opts -Dcom.sun.management.jmxremote.authenticate=false"
        base_opts="$base_opts -Dcom.sun.management.jmxremote.ssl=false"
        log_info "JMX监控已启用，端口: $jmx_port"
    fi
    
    # 合并用户自定义参数
    JAVA_OPTS="$base_opts $JAVA_OPTS"
    
    log_info "JVM参数: $JAVA_OPTS"
}

# 设置Spring Boot参数
setup_spring_options() {
    # 默认配置
    export SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE:-docker}
    export SERVER_PORT=${SERVER_PORT:-8888}
    
    # 日志配置
    export LOGGING_FILE_NAME=${LOGGING_FILE_NAME:-logs/application.log}
    export LOGGING_LEVEL_ROOT=${LOGGING_LEVEL_ROOT:-INFO}
    
    # 如果是开发模式，启用更详细的日志
    if [ "$SPRING_PROFILES_ACTIVE" = "dev" ]; then
        export LOGGING_LEVEL_COM_BLOG=${LOGGING_LEVEL_COM_BLOG:-DEBUG}
    fi
    
    log_info "Spring配置文件: $SPRING_PROFILES_ACTIVE"
    log_info "服务端口: $SERVER_PORT"
}

# 预启动检查
pre_start_checks() {
    log_info "执行预启动检查..."
    
    # 检查Java版本
    java_version=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2)
    log_info "Java版本: $java_version"
    
    # 检查可用内存
    if command -v free >/dev/null 2>&1; then
        available_memory=$(free -h | awk '/^Mem:/ {print $7}')
        log_info "可用内存: $available_memory"
    fi
    
    # 检查磁盘空间
    if command -v df >/dev/null 2>&1; then
        disk_usage=$(df -h /app | awk 'NR==2 {print $4}')
        log_info "可用磁盘空间: $disk_usage"
    fi
    
    # 检查jar文件
    if [ ! -f "/app/app.jar" ]; then
        log_error "应用jar文件不存在: /app/app.jar"
        exit 1
    fi
    
    log_info "预启动检查完成"
}

# 启动应用
start_application() {
    log_info "启动Blog服务..."
    log_info "工作目录: $(pwd)"
    log_info "用户: $(whoami)"
    
    # 执行Java应用
    exec java $JAVA_OPTS -jar app.jar "$@"
}

# 信号处理
cleanup() {
    log_info "接收到停止信号，正在优雅关闭..."
    # 这里可以添加清理逻辑
    exit 0
}

# 注册信号处理器
trap cleanup SIGTERM SIGINT

# 主函数
main() {
    log_info "========================================="
    log_info "Blog服务容器启动"
    log_info "版本: ${APP_VERSION:-1.0.0}"
    log_info "环境: ${SPRING_PROFILES_ACTIVE:-docker}"
    log_info "========================================="
    
    # 检查环境变量
    if [ "$SKIP_ENV_CHECK" != "true" ]; then
        check_required_env
    fi
    
    # 等待依赖服务
    if [ "$SKIP_WAIT" != "true" ]; then
        wait_for_dependencies
    fi
    
    # 设置JVM参数
    setup_jvm_options
    
    # 设置Spring参数
    setup_spring_options
    
    # 预启动检查
    if [ "$SKIP_CHECKS" != "true" ]; then
        pre_start_checks
    fi
    
    # 启动应用
    start_application "$@"
}

# 如果直接执行此脚本，则运行主函数
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
