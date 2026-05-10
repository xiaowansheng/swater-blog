#!/bin/bash

# ========================================
# Swater Blog 开发环境快速搭建脚本
# ========================================

set -e

echo "🚀 开始搭建 Swater Blog 开发环境..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 未安装，请先安装 $1${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ $1 已安装${NC}"
    fi
}

# 检查必要的工具
echo -e "${BLUE}📋 检查必要工具...${NC}"
check_command "java"
check_command "node"
check_command "npm"
check_command "docker"

if ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose V2 不可用，请确认可以执行 docker compose version${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Docker Compose V2 已安装${NC}"
fi

# 检查 Java 版本
echo -e "${BLUE}☕ 检查 Java 版本...${NC}"
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 21 ]; then
    echo -e "${RED}❌ 需要 Java 21 或更高版本，当前版本: $JAVA_VERSION${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Java 版本符合要求: $JAVA_VERSION${NC}"
fi

# 检查 Node.js 版本
echo -e "${BLUE}📦 检查 Node.js 版本...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ 需要 Node.js 18 或更高版本，当前版本: $NODE_VERSION${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js 版本符合要求: v$NODE_VERSION${NC}"
fi

# 创建环境变量文件
echo -e "${BLUE}📝 创建环境变量文件...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ 已创建 .env 文件，请根据需要修改配置${NC}"
else
    echo -e "${YELLOW}⚠️  .env 文件已存在，跳过创建${NC}"
fi

# 启动依赖服务
echo -e "${BLUE}🐳 启动依赖服务 (MySQL, Redis, RabbitMQ)...${NC}"
docker compose -f docker-compose.env.yml up -d mysql redis rabbitmq

# 等待服务启动
echo -e "${BLUE}⏳ 等待服务启动完成...${NC}"
sleep 30

# 检查服务状态
echo -e "${BLUE}🔍 检查服务状态...${NC}"
docker compose ps

# 安装后端依赖并构建
echo -e "${BLUE}🔧 构建后端服务...${NC}"
cd blog-service
chmod +x gradlew
./gradlew clean build -x test
cd ..

# 安装前端依赖
echo -e "${BLUE}📦 安装管理后台依赖...${NC}"
cd blog-admin
npm install
cd ..

if [ -d "blog-web" ]; then
    echo -e "${BLUE}📦 安装博客前端依赖...${NC}"
    cd blog-web
    npm install
    cd ..
fi

echo -e "${GREEN}🎉 开发环境搭建完成！${NC}"
echo -e "${BLUE}📋 使用说明:${NC}"
echo -e "  • 启动开发环境: ${GREEN}./scripts/start-dev.sh${NC}"
echo -e "  • 停止基础服务: ${GREEN}docker compose -f docker-compose.env.yml down${NC}"
echo -e "  • 查看服务状态: ${GREEN}docker compose -f docker-compose.env.yml ps${NC}"
echo -e "  • 查看服务日志: ${GREEN}docker compose -f docker-compose.env.yml logs -f [service-name]${NC}"
echo ""
echo -e "${YELLOW}⚠️  注意事项:${NC}"
echo -e "  • 首次启动可能需要较长时间下载依赖"
echo -e "  • 请确保端口 3000, 3001, 8888, 3306, 6379, 5672 未被占用"
echo -e "  • 修改 .env 文件中的配置以适应你的环境"
echo ""
echo -e "${GREEN}🚀 现在可以运行 ./start-dev.sh 启动开发环境！${NC}"
