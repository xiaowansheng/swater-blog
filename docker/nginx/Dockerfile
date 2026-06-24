# 镜像固定为 digest，确保可复现构建（标签变动需重新校验并更新 digest）
FROM nginx:alpine@sha256:1a8724a52d432501548a8d8681bb1554c2d09778f8b9ed0882fc3442549980b7

COPY nginx.conf /etc/nginx/nginx.conf
COPY templates /etc/nginx/templates
