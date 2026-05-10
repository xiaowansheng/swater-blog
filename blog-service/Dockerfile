# ========================================
# 多阶段构建Dockerfile
# 第一阶段：构建应用
# 第二阶段：运行应用
# ========================================

# 构建阶段
FROM gradle:8.5-jdk21-jammy AS builder

LABEL stage=builder
LABEL maintainer="blog-team"
LABEL description="Blog service build stage"

# 设置工作目录
WORKDIR /app

# 配置 Gradle 全局镜像源（含插件与依赖）
RUN mkdir -p /root/.gradle/init.d && \
    cat > /root/.gradle/init.d/mirrors.gradle <<'EOF'
def primary = "https://maven.aliyun.com/repository/public"
def fallback = "https://mirrors.cloud.tencent.com/nexus/repository/maven-public/"

settingsEvaluated { settings ->
    settings.pluginManagement {
        repositories {
            maven { url = uri(primary) }
            maven { url = uri(fallback) }
            gradlePluginPortal()
            mavenCentral()
        }
    }
}

allprojects {
    buildscript {
        repositories {
            maven { url = uri(primary) }
            maven { url = uri(fallback) }
            gradlePluginPortal()
            mavenCentral()
        }
    }
    repositories {
        maven { url = uri(primary) }
        maven { url = uri(fallback) }
        mavenCentral()
    }
}
EOF

# 复制构建文件
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle gradle
COPY gradlew ./

# Fix CRLF in gradlew inside Linux container
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# 下载依赖（利用Docker缓存，输出更完整日志）
RUN ./gradlew dependencies --no-daemon --info --stacktrace

# 复制源代码
COPY src src

# 构建应用
RUN ./gradlew bootJar --no-daemon --parallel --info --stacktrace

# 运行阶段
FROM eclipse-temurin:21-jre-jammy

LABEL maintainer="blog-team"
LABEL version="1.0.0"
LABEL description="Blog service runtime"

# 安装必要的工具
RUN apt-get update && apt-get install -y \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# 创建应用用户（安全最佳实践）
RUN groupadd -r blog && useradd -r -g blog blog

# 创建应用目录
WORKDIR /app

# 创建日志目录
RUN mkdir -p /app/logs && chown -R blog:blog /app

# 从构建阶段复制jar文件
COPY --from=builder /app/build/libs/*.jar app.jar

# 复制启动脚本
COPY docker/entrypoint.sh /app/entrypoint.sh
# Normalize line endings in case the script was edited on Windows.
RUN sed -i 's/\r$//' /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh \
    && chown blog:blog /app/entrypoint.sh

# 切换到应用用户
USER blog

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8888/actuator/health || exit 1

# 暴露端口
EXPOSE 8888

ENV SERVER_PORT=8888

# 启动应用
ENTRYPOINT ["/app/entrypoint.sh"]
