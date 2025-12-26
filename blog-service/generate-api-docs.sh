#!/bin/bash

echo "========================================"
echo "生成Blog API文档"
echo "========================================"

echo ""
echo "1. 启动应用..."
./gradlew bootRun &
APP_PID=$!

echo "等待应用启动..."
sleep 30

echo ""
echo "2. 检查应用是否启动成功..."
if ! curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo "错误: 应用启动失败或未完全启动"
    echo "请检查应用日志"
    kill $APP_PID 2>/dev/null
    exit 1
fi
echo "应用启动成功！"

echo ""
echo "3. 生成OpenAPI规范文档..."
mkdir -p docs/api

if ! curl -s http://localhost:8080/v3/api-docs > docs/api/openapi.json; then
    echo "错误: 无法获取OpenAPI文档"
    kill $APP_PID 2>/dev/null
    exit 1
fi
echo "OpenAPI规范文档已生成: docs/api/openapi.json"

echo ""
echo "4. 生成分组API文档..."
curl -s http://localhost:8080/v3/api-docs/public > docs/api/public-api.json
curl -s http://localhost:8080/v3/api-docs/admin > docs/api/admin-api.json
curl -s http://localhost:8080/v3/api-docs/auth > docs/api/auth-api.json
curl -s http://localhost:8080/v3/api-docs/monitoring > docs/api/monitoring-api.json

echo ""
echo "5. 生成Postman集合..."
cat > docs/api/Blog-API.postman_collection.json << 'EOF'
{
  "info": {
    "name": "Blog API",
    "description": "Blog系统API集合",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080",
      "type": "string"
    },
    {
      "key": "token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "认证接口",
      "item": [
        {
          "name": "用户登录",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"admin\",\n  \"password\": \"123456\"\n}"
            },
            "url": {
              "raw": "{{baseUrl}}/api/auth/login",
              "host": ["{{baseUrl}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
EOF

echo ""
echo "6. 创建API文档索引页面..."
cat > docs/api/index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog API 文档</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin: 5px; }
        .btn:hover { background: #0056b3; }
        .feature { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Blog API 文档</h1>
        <p>欢迎使用Blog系统API文档，这是一个功能完整的个人博客系统API。</p>
        
        <div class="card">
            <h3>📖 在线文档</h3>
            <p>交互式API文档，可以直接测试API接口</p>
            <a href="http://localhost:8080/swagger-ui.html" class="btn" target="_blank">打开Swagger UI</a>
        </div>
        
        <div class="card">
            <h3>📄 OpenAPI规范</h3>
            <p>标准的OpenAPI 3.0规范文档，可用于代码生成</p>
            <a href="openapi.json" class="btn">完整API规范</a>
            <a href="public-api.json" class="btn">公开接口</a>
            <a href="admin-api.json" class="btn">管理接口</a>
            <a href="auth-api.json" class="btn">认证接口</a>
        </div>
        
        <div class="card">
            <h3>🚀 Postman集合</h3>
            <p>导入到Postman中进行API测试</p>
            <a href="Blog-API.postman_collection.json" class="btn">下载Postman集合</a>
        </div>
        
        <div class="card">
            <h3>✨ 主要特性</h3>
            <div class="feature">
                <strong>🔒 安全防护:</strong> 限流、SQL注入防护、XSS防护、数据脱敏
            </div>
            <div class="feature">
                <strong>📈 性能监控:</strong> 实时监控、指标收集、健康检查
            </div>
            <div class="feature">
                <strong>💾 缓存优化:</strong> 多级缓存、Redis集群支持
            </div>
            <div class="feature">
                <strong>🔍 全文搜索:</strong> Elasticsearch集成
            </div>
        </div>
        
        <div class="card">
            <h3>🛠️ 快速开始</h3>
            <ol>
                <li>启动应用: <code>./gradlew bootRun</code></li>
                <li>访问文档: <a href="http://localhost:8080/swagger-ui.html">http://localhost:8080/swagger-ui.html</a></li>
                <li>获取token: 调用 <code>/api/auth/login</code> 接口</li>
                <li>测试API: 在请求头中添加 <code>Authorization: Bearer {token}</code></li>
            </ol>
        </div>
    </div>
</body>
</html>
EOF

echo ""
echo "========================================"
echo "API文档生成完成！"
echo ""
echo "📖 在线文档: http://localhost:8080/swagger-ui.html"
echo "📄 文档索引: docs/api/index.html"
echo "📋 OpenAPI规范: docs/api/openapi.json"
echo "🚀 Postman集合: docs/api/Blog-API.postman_collection.json"
echo ""
echo "提示: 应用需要保持运行状态才能访问在线文档"
echo "========================================"

# 可选：停止应用
read -p "是否停止应用? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    kill $APP_PID 2>/dev/null
    echo "应用已停止"
fi