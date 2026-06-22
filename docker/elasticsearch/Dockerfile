# ========================================
# Elasticsearch 8.11.0 + IK 中文分词插件
# 模仿 docker/rabbitmq/Dockerfile 模式，将 IK 插件烘焙进镜像
# 避免每次容器启动时联网下载插件
# ========================================
FROM elasticsearch:8.11.0

# 安装 IK 分词插件（版本必须严格匹配 ES 版本）
RUN elasticsearch-plugin install --batch \
    https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.11.0/elasticsearch-analysis-ik-8.11.0.zip
