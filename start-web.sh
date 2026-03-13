#!/bin/bash

# OpenClaw 启动器 - Web UI 快速启动脚本
# 支持自动端口检测和环境变量配置

set -e

echo "🦞 OpenClaw 启动器 - Web UI"
echo "================================"
echo ""

cd "$(dirname "$0")"

# 加载环境变量
if [ -f ".env" ]; then
    echo "📄 加载环境变量..."
    export $(grep -v '^#' .env | xargs)
fi

# 检查端口是否被占用
check_port() {
    if command -v lsof &> /dev/null; then
        lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
        return $?
    elif command -v netstat &> /dev/null; then
        netstat -tlnp 2>/dev/null | grep -q ":$1 "
        return $?
    else
        # 无法检查，假设端口可用
        return 1
    fi
}

# 自动检测可用端口
find_available_port() {
    local port=$1
    local max_attempts=10
    local attempt=0
    
    while check_port $port && [ $attempt -lt $max_attempts ]; do
        echo "⚠️  端口 $port 被占用，尝试下一个..."
        port=$((port + 1))
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ 错误：无法找到可用端口"
        exit 1
    fi
    
    echo $port
}

# 获取端口和主机配置
API_PORT=${API_PORT:-3001}
API_HOST=${API_HOST:-0.0.0.0}
WEB_PORT=${WEB_PORT:-5173}
WEB_HOST=${WEB_HOST:-0.0.0.0}

export API_HOST
export WEB_HOST

# 检测并调整端口
echo "🔍 检测端口可用性..."
API_PORT=$(find_available_port $API_PORT)
WEB_PORT=$(find_available_port $WEB_PORT)

export API_PORT
export WEB_PORT

echo "✅ 监听地址：API=$API_HOST:$API_PORT, Web=$WEB_HOST:$WEB_PORT"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

if [ ! -d "web-ui/node_modules" ]; then
    echo "📦 安装 Web UI 依赖..."
    cd web-ui
    npm install
    cd ..
fi

echo ""
echo "🚀 启动 API 服务器和 Web UI..."
echo ""
echo "访问地址："
echo "  Web UI: http://localhost:$WEB_PORT (本地)"
echo "  API:    http://localhost:$API_PORT (本地)"
echo ""
echo "局域网访问:"
echo "  Web UI: http://$(hostname -I | awk '{print $1}'):${WEB_PORT}"
echo "  API:    http://$(hostname -I | awk '{print $1}'):${API_PORT}"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 启动 API 服务器和 Web UI
npx concurrently \
  "HOST=$API_HOST node api-server.js" \
  "cd web-ui && npm run dev -- --host $WEB_HOST" \
  --names "API,WEB" \
  --prefix-colors "blue,green" \
  --kill-others
