#!/bin/bash

# OpenClaw 启动器 - 一键安装脚本
# 使用方法：curl -sL https://... | bash

set -e

echo "🦞 OpenClaw 启动器 - 一键安装"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：Node.js 未安装"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js 版本：$(node --version)"

# 检查 OpenClaw
if ! command -v openclaw &> /dev/null; then
    echo "⚠️  OpenClaw 未安装，正在安装..."
    npm install -g openclaw
fi

echo "✅ OpenClaw 版本：$(openclaw --version | head -1)"

# 创建安装目录
INSTALL_DIR="$HOME/.openclaw-launcher"
echo ""
echo "📁 安装目录：$INSTALL_DIR"

if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  目录已存在，正在更新..."
    cd "$INSTALL_DIR"
    git pull
    npm install
else
    echo "📥 正在下载..."
    git clone https://github.com/1va7/openclaw-launcher.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    npm install
fi

# 创建符号链接
echo ""
echo "🔗 创建全局命令..."
sudo ln -sf "$INSTALL_DIR/src/index.js" /usr/local/bin/openclaw-launcher

# 验证安装
echo ""
echo "✅ 安装完成！"
echo ""
echo "使用方法:"
echo "  openclaw-launcher              # 交互模式"
echo "  openclaw-launcher start        # 启动 Gateway"
echo "  openclaw-launcher diagnose     # 诊断问题"
echo "  openclaw-launcher --help       # 查看帮助"
echo ""

# 自动运行诊断
echo "🔍 正在运行环境诊断..."
openclaw-launcher diagnose
