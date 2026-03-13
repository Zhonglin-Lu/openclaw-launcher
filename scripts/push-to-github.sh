#!/bin/bash

# OpenClaw 启动器 - 一键推送到 GitHub
# 使用方法：./scripts/push-to-github.sh

set -e

echo "🦞 OpenClaw 启动器 - GitHub 推送工具"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查清单
echo -e "${BLUE}📋 推送前检查...${NC}"
echo ""

# 1. 检查 Git 仓库
echo -n "检查 Git 仓库... "
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Git 仓库存在${NC}"
else
    echo -e "${RED}❌ 不是 Git 仓库${NC}"
    echo "请先运行：git init"
    exit 1
fi

# 2. 检查远程仓库
echo -n "检查远程仓库配置... "
if git remote get-url origin > /dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin)
    echo -e "${GREEN}✅ 已配置 ($REMOTE_URL)${NC}"
else
    echo -e "${YELLOW}⚠️  未配置远程仓库${NC}"
    echo ""
    read -p "请输入 GitHub 用户名: " GITHUB_USER
    if [ -z "$GITHUB_USER" ]; then
        echo -e "${RED}用户名不能为空${NC}"
        exit 1
    fi
    REMOTE_URL="https://github.com/${GITHUB_USER}/openclaw-launcher.git"
    echo ""
    echo -e "${BLUE}添加远程仓库：$REMOTE_URL${NC}"
    git remote add origin $REMOTE_URL
fi

# 3. 检查当前分支
echo -n "检查当前分支... "
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}✅ $CURRENT_BRANCH${NC}"

# 4. 检查未提交的更改
echo -n "检查未提交的更改... "
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✅ 无未提交更改${NC}"
else
    echo -e "${YELLOW}⚠️  有未提交更改${NC}"
    echo ""
    read -p "是否提交并推送？(y/n): " confirm
    if [ "$confirm" = "y" ]; then
        git add -A
        git commit -m "💾 Auto-save before push"
    else
        echo -e "${YELLOW}⚠️  跳过未提交更改${NC}"
    fi
fi

echo ""

# 选择推送方式
echo -e "${BLUE}选择推送方式:${NC}"
echo "  1. HTTPS 推送（需要 Token 或密码）"
echo "  2. SSH 推送（需要配置 SSH Key）"
echo "  3. 仅本地提交（不推送）"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        PUSH_METHOD="https"
        ;;
    2)
        PUSH_METHOD="ssh"
        # 检查 SSH
        if ! ssh -T git@github.com &> /dev/null; then
            echo -e "${YELLOW}⚠️  SSH 连接失败，是否切换到 HTTPS？(y/n): ${NC}"
            read switch_confirm
            if [ "$switch_confirm" = "y" ]; then
                PUSH_METHOD="https"
                # 切换为 HTTPS
                CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
                if [[ $CURRENT_REMOTE == git@github.com:* ]]; then
                    GITHUB_USER_PATH=$(echo $CURRENT_REMOTE | sed 's/git@github.com://')
                    NEW_REMOTE="https://github.com/$GITHUB_USER_PATH"
                    git remote set-url origin $NEW_REMOTE
                    echo -e "${BLUE}已切换为 HTTPS: $NEW_REMOTE${NC}"
                fi
            else
                echo -e "${RED}❌ 请先配置 SSH Key${NC}"
                echo "参考：docs/GITHUB-PUSH.md"
                exit 1
            fi
        fi
        ;;
    3)
        echo -e "${YELLOW}⚠️  仅本地提交，不推送${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选择${NC}"
        exit 1
        ;;
esac

echo ""

# 显示推送信息
echo -e "${BLUE}📊 推送信息:${NC}"
echo "  远程仓库：$(git remote get-url origin)"
echo "  分支：$CURRENT_BRANCH"
echo "  推送方式：$PUSH_METHOD"
echo ""

# 确认推送
read -p "确认推送？(y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo -e "${YELLOW}⚠️  取消推送${NC}"
    exit 0
fi

# 推送
echo ""
echo -e "${BLUE}🚀 开始推送...${NC}"
echo ""

# 尝试推送
if git push -u origin $CURRENT_BRANCH; then
    echo ""
    echo -e "${GREEN}✅ 推送成功!${NC}"
    echo ""
    
    # 获取仓库 URL
    REMOTE_URL=$(git remote get-url origin)
    REPO_URL=$(echo $REMOTE_URL | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')
    
    echo -e "${BLUE}📍 仓库地址:${NC}"
    echo "  $REPO_URL"
    echo ""
    
    # 询问是否添加标签
    read -p "是否添加版本标签 v1.1.0？(y/n): " tag_confirm
    if [ "$tag_confirm" = "y" ]; then
        git tag -a v1.1.0 -m "Release version 1.1.0"
        git push origin --tags
        echo -e "${GREEN}✅ 标签已推送${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 完成!${NC}"
    echo ""
    echo "后续步骤:"
    echo "  1. 访问仓库：$REPO_URL"
    echo "  2. 完善仓库描述和标签"
    echo "  3. 启用 GitHub Actions（可选）"
    echo "  4. 添加 Issue 模板（可选）"
    echo ""
else
    echo ""
    echo -e "${RED}❌ 推送失败${NC}"
    echo ""
    echo "可能的原因:"
    echo "  1. 未认证 - 需要使用 Personal Access Token"
    echo "  2. SSH Key 未配置"
    echo "  3. 仓库不存在 - 请先在 GitHub 创建仓库"
    echo ""
    echo "解决方案:"
    echo "  参考：docs/GITHUB-PUSH.md"
    echo ""
    exit 1
fi
