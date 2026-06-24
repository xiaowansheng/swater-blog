# 镜像固定为 digest，确保可复现构建（标签变动需重新校验并更新 digest）
FROM rabbitmq:3-management-alpine@sha256:606d8c0d6b3c18d1da9afc53bc7cdb2a8d5486df91b5a9830e9e07626c9ae281

COPY rabbitmq.conf /etc/rabbitmq/rabbitmq.conf
