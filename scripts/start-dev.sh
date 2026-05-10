#!/bin/bash

echo "========================================"
echo "启动博客系统开发环境"
echo "========================================"

COMPOSE_CMD=(docker compose)

# 检查 Docker 是否运行
echo ""
echo "1. 检查 Docker 是否运行..."
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    echo "请先安装 Docker"
    exit 1
fi

if ! "${COMPOSE_CMD[@]}" version &> /dev/null; then
    echo "错误: Docker Compose V2 不可用"
    echo "请确认可以执行: docker compose version"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "错误: Docker 未运行"
    echo "请先启动 Docker"
    exit 1
fi

# 启动基础服务
echo ""
echo "2. 启动基础服务 (MySQL, Redis, RabbitMQ)..."
"${COMPOSE_CMD[@]}" -f docker-compose.env.yml up -d mysql redis rabbitmq

# 等待服务启动
echo ""
echo "3. 等待服务启动..."
sleep 30

# 检查服务状态
echo ""
echo "4. 检查服务状态..."
"${COMPOSE_CMD[@]}" ps

# 启动后端服务
echo ""
echo "5. 启动后端服务..."
cd blog-service
BACKEND_CMD="set -a; source ../.env; set +a; ./gradlew bootRun --args='--spring.profiles.active=dev'; exec bash"
gnome-terminal --title="后端服务" -- bash -lc "$BACKEND_CMD" &

# 等待后端服务启动
echo ""
echo "6. 等待后端服务启动..."
sleep 20

# 启动管理后台
echo ""
echo "7. 启动管理后台..."
cd ../blog-admin
gnome-terminal --title="前端服务" -- bash -c "npm run dev; exec bash" &

# 启动博客前端
echo ""
echo "8. 启动博客前端..."
cd ../blog-web
gnome-terminal --title="博客前端" -- bash -c "npm run dev; exec bash" &

echo ""
echo "========================================"
echo "开发环境启动完成！"
echo "========================================"
echo ""
echo "服务地址:"
echo "- 后端API: http://localhost:8888"
echo "- 管理后台: http://localhost:3000"
echo "- 博客前端: http://localhost:3001"
echo "- API文档: http://localhost:8888/swagger-ui.html"
echo "- 监控面板: http://localhost:8081/actuator"
echo ""
echo "数据库连接:"
echo "- MySQL: localhost:3306"
echo "- Redis: localhost:6379"
echo "- RabbitMQ管理: http://localhost:15672 (admin / see RABBITMQ_PASSWORD in .env)"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 等待用户中断
trap 'echo "正在停止服务..."; docker compose down; exit' INT
while true; do
    sleep 1
done
