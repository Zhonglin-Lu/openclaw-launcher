#!/bin/bash

# OpenClaw 启动器 - 一键发布脚本
# 发布到 npm 和 Docker Hub

set -e

echo "🦞 OpenClaw 启动器 - 发布工具"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查清单
echo "📋 发布前检查..."
echo ""

# 1. 检查 npm 登录
echo -n "检查 npm 登录状态... "
if npm whoami &> /dev/null; then
    NPM_USER=$(npm whoami)
    echo -e "${GREEN}✅ 已登录 ($NPM_USER)${NC}"
    NPM_READY=true
else
    echo -e "${RED}❌ 未登录${NC}"
    NPM_READY=false
fi

# 2. 检查 Docker 登录
echo -n "检查 Docker 登录状态... "
if docker info &> /dev/null; then
    echo -e "${GREEN}✅ Docker 可用${NC}"
    DOCKER_READY=true
else
    echo -e "${YELLOW}⚠️  Docker 不可用${NC}"
    DOCKER_READY=false
fi

# 3. 运行测试
echo -n "运行测试... "
if npm test &> /dev/null; then
    echo -e "${GREEN}✅ 测试通过${NC}"
else
    echo -e "${RED}❌ 测试失败${NC}"
    exit 1
fi

# 4. 验证配置
echo -n "验证配置... "
if npm run validate &> /dev/null; then
    echo -e "${GREEN}✅ 配置有效${NC}"
else
    echo -e "${YELLOW}⚠️  配置警告${NC}"
fi

echo ""

# 选择发布目标
echo "选择发布目标:"
echo "  1. npm 仅"
echo "  2. Docker Hub 仅"
echo "  3. 两者都发布"
echo "  4. 仅打包（不发布）"
echo ""
read -p "请选择 (1-4): " choice

case $choice in
    1)
        PUBLISH_NPM=true
        PUBLISH_DOCKER=false
        ;;
    2)
        PUBLISH_NPM=false
        PUBLISH_DOCKER=true
        ;;
    3)
        PUBLISH_NPM=true
        PUBLISH_DOCKER=true
        ;;
    4)
        PUBLISH_NPM=false
        PUBLISH_DOCKER=false
        PACK_ONLY=true
        ;;
    *)
        echo -e "${RED}无效选择${NC}"
        exit 1
        ;;
esac

echo ""

# npm 发布
if [ "$PUBLISH_NPM" = true ]; then
    if [ "$NPM_READY" = false ]; then
        echo -e "${YELLOW}⚠️  需要先登录 npm${NC}"
        echo ""
        read -p "现在登录 npm? (y/n): " login
        if [ "$login" = "y" ]; then
            npm adduser
            NPM_READY=true
        else
            echo -e "${RED}❌ 跳过 npm 发布${NC}"
            PUBLISH_NPM=false
        fi
    fi

    if [ "$NPM_READY" = true ]; then
        echo ""
        echo "📦 发布到 npm..."
        echo ""
        
        # 显示包信息
        echo "包信息:"
        cat package.json | grep -E '"name"|"version"' | head -2
        echo ""
        
        read -p "确认发布? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            npm publish --access public
            echo -e "${GREEN}✅ npm 发布成功!${NC}"
            echo ""
            echo "查看包: https://www.npmjs.com/package/@1va7/openclaw-launcher"
        else
            echo -e "${YELLOW}⚠️  取消 npm 发布${NC}"
        fi
    fi
fi

# Docker 发布
if [ "$PUBLISH_DOCKER" = true ]; then
    if [ "$DOCKER_READY" = false ]; then
        echo -e "${YELLOW}⚠️  Docker 不可用，跳过 Docker 发布${NC}"
        PUBLISH_DOCKER=false
    else
        echo ""
        echo "🐳 发布到 Docker Hub..."
        echo ""
        
        # 获取版本号
        VERSION=$(cat package.json | grep '"version"' | cut -d'"' -f4)
        
        echo "构建镜像:"
        echo "  - 1va7/openclaw-launcher:latest"
        echo "  - 1va7/openclaw-launcher:$VERSION"
        echo ""
        
        read -p "确认构建并发布? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            # 构建镜像
            echo "构建中..."
            docker build -t 1va7/openclaw-launcher:latest .
            docker build -t 1va7/openclaw-launcher:$VERSION .
            
            # 推送镜像
            echo ""
            echo "推送镜像..."
            docker push 1va7/openclaw-launcher:latest
            docker push 1va7/openclaw-launcher:$VERSION
            
            echo -e "${GREEN}✅ Docker 发布成功!${NC}"
            echo ""
            echo "查看镜像: https://hub.docker.com/r/1va7/openclaw-launcher"
        else
            echo -e "${YELLOW}⚠️  取消 Docker 发布${NC}"
        fi
    fi
fi

# 仅打包
if [ "$PACK_ONLY" = true ]; then
    echo ""
    echo "📦 打包（不发布）..."
    echo ""
    
    npm pack --dry-run
    echo ""
    
    read -p "创建 tarball? (y/n): " confirm
    if [ "$confirm" = "y" ]; then
        npm pack
        echo -e "${GREEN}✅ 打包完成!${NC}"
        ls -lh *.tgz
    fi
fi

echo ""
echo "================================"
echo "✅ 发布流程完成!"
echo ""

# 显示后续步骤
echo "后续步骤:"
if [ "$PUBLISH_NPM" = true ]; then
    echo "  1. 测试安装：npm install -g @1va7/openclaw-launcher"
    echo "  2. 验证命令：openclaw-launcher --version"
fi

if [ "$PUBLISH_DOCKER" = true ]; then
    echo "  3. 测试拉取：docker pull 1va7/openclaw-launcher:latest"
    echo "  4. 运行测试：docker run -d -p 3001:3001 -p 5173:5173 1va7/openclaw-launcher"
fi

echo ""
echo "🎉 恭喜!"
