#!/bin/bash

echo "========================================"
echo "启动Blog服务监控栈"
echo "========================================"

echo ""
echo "1. 检查Docker是否运行..."
if ! command -v docker &> /dev/null; then
    echo "错误: Docker未安装"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "错误: Docker未运行"
    exit 1
fi

echo ""
echo "2. 前置检查..."
if [ -z "$GRAFANA_ADMIN_PASSWORD" ]; then
    echo "错误: 未设置 GRAFANA_ADMIN_PASSWORD（Grafana 管理口令，不再允许默认 admin/admin）"
    echo "用法: GRAFANA_ADMIN_PASSWORD=xxx ./start-monitoring.sh"
    exit 1
fi

# 监控栈通过外部网络（主栈 docker-compose.yml 创建）直连 mysql/redis/blog-service
BLOG_NETWORK_NAME=${BLOG_NETWORK_NAME:-swater-blog_blog-network}
if ! docker network inspect "$BLOG_NETWORK_NAME" &> /dev/null; then
    echo "错误: 未找到主栈网络 $BLOG_NETWORK_NAME"
    echo "请先在仓库根目录启动主栈（docker compose up -d），"
    echo "或用 BLOG_NETWORK_NAME=<网络名> 指定已有网络。"
    exit 1
fi

echo "前置检查通过（主栈网络: $BLOG_NETWORK_NAME）"

echo ""
echo "3. 启动监控服务..."
docker compose -f docker-compose-monitoring.yml up -d

echo ""
echo "4. 等待服务启动..."
sleep 30

echo ""
echo "5. 检查服务状态..."
docker compose -f docker-compose-monitoring.yml ps

echo ""
echo "========================================"
echo "监控服务已启动！"
echo ""
echo "访问地址:"
echo "- Grafana面板: http://localhost:3000 (用户 \$GRAFANA_ADMIN_USER / 口令 \$GRAFANA_ADMIN_PASSWORD)"
echo "- Prometheus: http://localhost:9090"
echo "- AlertManager: http://localhost:9093"
echo "- 应用指标由 Prometheus 经容器网络抓取: swater-blog-service:8888/actuator/prometheus"
echo "========================================"
