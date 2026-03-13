#!/bin/bash

# OpenClaw 启动器 - Web UI 快速启动脚本
# 支持自动端口检测和环境变量配置
# 兼容各种 Linux 发行版和 macOS

set -e

echo "🦞 OpenClaw 启动器 - Web UI"
echo "================================"
echo ""

# 获取脚本所在目录（兼容不同系统）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📂 工作目录：$SCRIPT_DIR"
echo ""

# 加载环境变量
if [ -f ".env" ]; then
    echo "📄 加载环境变量..."
    set -a
    source .env
    set +a
fi

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本：$(node --version)"

# 检查端口是否被占用（兼容不同系统）
check_port() {
    local port=$1
    
    # 方法 1: lsof (macOS/Linux)
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
        return $?
    fi
    
    # 方法 2: netstat (Linux)
    if command -v netstat &> /dev/null; then
        netstat -tln 2>/dev/null | grep -q ":$port "
        return $?
    fi
    
    # 方法 3: ss (现代 Linux)
    if command -v ss &> /dev/null; then
        ss -tln 2>/dev/null | grep -q ":$port "
        return $?
    fi
    
    # 无法检查，假设端口可用
    echo "⚠️  无法检查端口，假设可用"
    return 1
}

# 自动检测可用端口
find_available_port() {
    local port=$1
    local max_attempts=10
    local attempt=0
    
    while check_port $port && [ $attempt -lt $max_attempts ]; do
        echo "⚠️  端口 $port 被占用，尝试 $((port + 1))..."
        port=$((port + 1))
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ 错误：无法找到可用端口（尝试了 10 个端口）"
        exit 1
    fi
    
    echo $port
}

# 获取端口和主机配置
API_PORT=${API_PORT:-3001}
API_HOST=${API_HOST:-0.0.0.0}
WEB_PORT=${WEB_PORT:-5173}
WEB_HOST=${WEB_HOST:-0.0.0.0}

echo "🔍 检测端口可用性..."
API_PORT=$(find_available_port $API_PORT)
WEB_PORT=$(find_available_port $WEB_PORT)

echo "✅ 监听地址：API=$API_HOST:$API_PORT, Web=$WEB_HOST:$WEB_PORT"

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 安装依赖..."
    npm install --silent
fi

if [ ! -d "web-ui/node_modules" ]; then
    echo ""
    echo "📦 安装 Web UI 依赖..."
    cd web-ui
    npm install --silent
    cd ..
fi

echo ""
echo "🚀 启动 API 服务器和 Web UI..."
echo ""
echo "访问地址："
echo "  📱 本地访问:"
echo "     http://localhost:$WEB_PORT"
echo ""
echo "  🌐 局域网访问:"
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || hostname -i 2>/dev/null | awk '{print $1}' || echo "未知")
if [ "$LOCAL_IP" != "未知" ]; then
    echo "     http://$LOCAL_IP:$WEB_PORT"
fi
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

# 清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务..."
    if [ -n "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
    if [ -n "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
    fi
    echo "✅ 服务已停止"
    exit 0
}

# 注册清理函数
trap cleanup INT TERM

# 启动 API 服务器
echo "📡 启动 API 服务器..."
HOST=$API_HOST PORT=$API_PORT node api-server.js &
API_PID=$!

# 等待 API 服务器启动
sleep 2

# 检查 API 服务器是否启动成功
if ! kill -0 $API_PID 2>/dev/null; then
    echo "❌ API 服务器启动失败"
    exit 1
fi

echo "✅ API 服务器已启动 (PID: $API_PID)"

# 启动 Web UI
echo "🎨 启动 Web UI..."
cd web-ui
HOST=$WEB_HOST npm run dev -- --host $WEB_HOST --port $WEB_PORT &
WEB_PID=$!
cd ..

# 等待 Web UI 启动
sleep 3

# 检查 Web UI 是否启动成功
if ! kill -0 $WEB_PID 2>/dev/null; then
    echo "❌ Web UI 启动失败"
    exit 1
fi

echo "✅ Web UI 已启动 (PID: $WEB_PID)"
echo ""
echo "================================"
echo "✅ 所有服务已启动"
echo "================================"
echo ""

# 等待进程结束
wait
