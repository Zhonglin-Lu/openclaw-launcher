#!/bin/bash

# OpenClaw 启动器 - 快速测试脚本

echo "🦞 OpenClaw 启动器 - 快速测试"
echo "================================"
echo ""

cd "$(dirname "$0")/.."

# 测试环境检测
echo "1️⃣  测试环境检测..."
node src/index.js detect
echo ""

# 测试诊断
echo "2️⃣  测试诊断功能..."
node src/index.js diagnose
echo ""

# 测试配置
echo "3️⃣  测试配置管理..."
node src/index.js config --summary
echo ""

# 测试 Skills
echo "4️⃣  测试 Skills 管理..."
node src/index.js skills --list
echo ""

echo "✅ 所有测试完成！"
echo ""
echo "使用方法:"
echo "  node src/index.js              # 交互模式"
echo "  node src/index.js start        # 启动 Gateway"
echo "  node src/index.js diagnose     # 诊断问题"
echo "  node src/index.js --help       # 查看帮助"
