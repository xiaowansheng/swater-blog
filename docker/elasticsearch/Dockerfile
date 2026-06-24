# ========================================
# Elasticsearch 8.11.0 + IK 中文分词插件
# 模仿 docker/rabbitmq/Dockerfile 模式，将 IK 插件烘焙进镜像
# 避免每次容器启动时联网下载插件
# ========================================
# 基础镜像固定为 digest，确保可复现构建（标签变动需重新校验并更新 digest）
FROM elasticsearch:8.11.0@sha256:2cadca6c21de5802b085f25532bba11cb893589b64ca8c94d62ac69eec923fad

# 安装 IK 分词插件（版本必须严格匹配 ES 版本）
RUN elasticsearch-plugin install --batch \
    https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v8.11.0/elasticsearch-analysis-ik-8.11.0.zip
