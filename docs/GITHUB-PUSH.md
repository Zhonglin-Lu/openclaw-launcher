# 🚀 GitHub 推送指南

> 将 OpenClaw 启动器推送到 GitHub

---

## ✅ 本地 Git 已初始化

本地仓库状态：
- ✅ Git 仓库已初始化
- ✅ 所有文件已添加 (70 个文件)
- ✅ 首次提交完成 (v1.1.0)
- ✅ 分支：main

---

## 📋 推送步骤

### 方法 1: 使用 GitHub CLI (最简单)

```bash
# 1. 安装 GitHub CLI (如果未安装)
# Ubuntu/Debian:
sudo apt install gh

# macOS:
brew install gh

# 2. 登录 GitHub
gh auth login

# 3. 创建仓库并推送
cd /home/thelu/openclaw-launcher
gh repo create openclaw-launcher --public --source=. --remote=origin --push
```

---

### 方法 2: 手动创建仓库

#### Step 1: 在 GitHub 创建仓库

1. 访问 https://github.com/new
2. 仓库名称：`openclaw-launcher`
3. 描述：`OpenClaw 启动器 - 一键启动、图形配置、自动诊断、Skills 市场`
4. 选择 **Public**
5. **不要** 勾选 "Add a README file"
6. **不要** 添加 .gitignore
7. **不要** 选择许可证
8. 点击 "Create repository"

#### Step 2: 关联远程仓库并推送

```bash
cd /home/thelu/openclaw-launcher

# 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/1va7/openclaw-launcher.git

# 推送到 GitHub
git push -u origin main
```

如果提示需要认证，使用以下方式之一：

**方式 A: 使用 Personal Access Token**
```bash
# 在 GitHub 生成 Token:
# Settings -> Developer settings -> Personal access tokens -> Tokens (classic)
# 勾选：repo, workflow, write:packages

# 然后推送（会提示输入 token）
git push -u origin main
```

**方式 B: 使用 SSH**
```bash
# 生成 SSH key（如果还没有）
ssh-keygen -t ed25519 -C "your-email@example.com"

# 添加 SSH key 到 GitHub
# Settings -> SSH and GPG keys -> New SSH key
# 复制 ~/.ssh/id_ed25519.pub 的内容

# 使用 SSH URL
git remote set-url origin git@github.com:1va7/openclaw-launcher.git
git push -u origin main
```

---

### 方法 3: 使用 Git 凭据管理器

```bash
# 启用凭据管理器
git config --global credential.helper store

# 推送（会弹出浏览器登录）
git push -u origin main
```

---

## 🔐 认证方式

### Personal Access Token (推荐)

1. 访问：https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 填写说明（如：openclaw-launcher）
4. 选择权限：
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)
5. 点击 "Generate token"
6. **复制并保存 token**（只会显示一次！）
7. 推送时使用 token 作为密码

### SSH Key

1. 生成 SSH key：
```bash
ssh-keygen -t ed25519 -C "github-email@example.com"
```

2. 查看公钥：
```bash
cat ~/.ssh/id_ed25519.pub
```

3. 添加到 GitHub：
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥内容
   - 点击 "Add SSH key"

4. 测试连接：
```bash
ssh -T git@github.com
# 应该显示：Hi 1va7! You've successfully authenticated...
```

---

## 📊 推送后验证

### 检查仓库

访问：https://github.com/1va7/openclaw-launcher

应该看到：
- ✅ 代码文件
- ✅ README.md 渲染正常
- ✅ 提交历史
- ✅ 分支：main

### 启用 GitHub Pages (可选)

如果要部署 Web UI 演示：

1. 访问：Settings -> Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Save

等待几分钟后访问：
https://1va7.github.io/openclaw-launcher

---

## 🏷️ 添加版本标签

```bash
# 创建版本标签
git tag -a v1.1.0 -m "Release version 1.1.0"

# 推送标签
git push origin --tags
```

---

## 📝 后续步骤

### 1. 完善 GitHub 仓库

- [ ] 添加仓库描述
- [ ] 添加主题标签（topics）
- [ ] 设置默认分支为 main
- [ ] 启用 Issues
- [ ] 启用 Discussions
- [ ] 添加代码所有者 (CODEOWNERS)

### 2. 添加 GitHub Actions

创建 `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm install
      - run: npm test
```

### 3. 添加 Issue 模板

创建 `.github/ISSUE_TEMPLATE/bug_report.md` 和 `feature_request.md`

### 4. 添加贡献指南

创建 `CONTRIBUTING.md`

---

## 🎯 快速命令总结

```bash
# 进入项目目录
cd /home/thelu/openclaw-launcher

# 添加远程仓库
git remote add origin https://github.com/1va7/openclaw-launcher.git

# 推送到 GitHub
git push -u origin main

# 添加版本标签
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin --tags
```

---

## 🔗 相关链接

- [GitHub 文档](https://docs.github.com/)
- [Git 入门指南](https://git-scm.com/book/zh/v2)
- [Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [SSH Key 配置](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

---

## ⚠️ 注意事项

1. **Token 安全**: 不要将 token 提交到代码库
2. **SSH Key**: 妥善保管私钥，不要分享
3. **仓库可见性**: 确认选择 Public 还是 Private
4. **许可证**: 已使用 MIT License，确保合规

---

**准备好推送了吗？** 🚀

执行以下命令即可：

```bash
cd /home/thelu/openclaw-launcher
git remote add origin https://github.com/1va7/openclaw-launcher.git
git push -u origin main
```

记得替换为你的 GitHub 用户名！
