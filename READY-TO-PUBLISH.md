# 🚀 快速发布说明

> OpenClaw 启动器 v1.1.0 已准备就绪，等待发布

---

## ✅ 发布准备完成

### 已完成的改进

- ✅ 环境变量支持
- ✅ Docker 部署支持
- ✅ 配置验证工具
- ✅ 启动脚本增强
- ✅ 错误处理优化
- ✅ 完整文档

### 已更新的文件

- ✅ `package.json` - 版本更新到 1.1.0
- ✅ `CHANGELOG.md` - 更新日志
- ✅ `README.md` - 使用指南
- ✅ 新增 Docker 配置
- ✅ 新增发布脚本

---

## 📦 发布方式

### 方式 1: 使用发布脚本（最简单）

```bash
cd /home/thelu/openclaw-launcher

# 运行发布脚本
./scripts/publish.sh
```

脚本会自动：
1. 检查登录状态
2. 运行测试
3. 验证配置
4. 发布到 npm 和/或 Docker Hub

---

### 方式 2: 手动发布

#### 发布到 npm

```bash
# 1. 登录 npm（首次需要）
npm adduser

# 2. 发布
cd /home/thelu/openclaw-launcher
npm publish --access public
```

#### 发布到 Docker Hub

```bash
# 1. 登录 Docker Hub（首次需要）
docker login

# 2. 构建并推送
cd /home/thelu/openclaw-launcher
docker build -t 1va7/openclaw-launcher:latest .
docker push 1va7/openclaw-launcher:latest
```

---

## 🔐 认证信息

### npm

需要登录到 https://www.npmjs.com/

**注意**: 由于安全原因，我不能代为登录。请手动执行：

```bash
npm adduser
```

然后输入你的：
- 用户名
- 密码
- 邮箱

### Docker Hub

需要登录到 https://hub.docker.com/

```bash
docker login
```

---

## 📊 包信息

### npm 包

- **名称**: `@1va7/openclaw-launcher`
- **版本**: `1.1.0`
- **大小**: ~166 KB (压缩后)
- **文件数**: 64

### Docker 镜像

- **名称**: `1va7/openclaw-launcher`
- **标签**: `latest`, `1.1.0`
- **基础镜像**: Node 22 Alpine
- **大小**: ~200 MB (估计)

---

## 🎯 发布后验证

### npm 验证

```bash
# 全局安装
npm install -g @1va7/openclaw-launcher

# 测试命令
openclaw-launcher --version
openclaw-launcher status
```

### Docker 验证

```bash
# 拉取镜像
docker pull 1va7/openclaw-launcher:latest

# 运行
docker run -d \
  -p 3001:3001 \
  -p 5173:5173 \
  -v ~/.openclaw:/root/.openclaw \
  1va7/openclaw-launcher:latest

# 访问 http://localhost:5173
```

---

## 📝 检查清单

发布前请确认：

- [ ] 已登录 npm (`npm whoami`)
- [ ] 已登录 Docker (`docker info`)
- [ ] 测试通过 (`npm test`)
- [ ] 配置有效 (`npm run validate`)
- [ ] README 已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号正确

---

## 🔗 相关链接

- **npm 包页面**: https://www.npmjs.com/package/@1va7/openclaw-launcher
- **Docker Hub**: https://hub.docker.com/r/1va7/openclaw-launcher
- **GitHub**: https://github.com/1va7/openclaw-launcher
- **发布指南**: docs/PUBLISH.md

---

## 💡 提示

1. **首次发布**: 需要先注册 npm 和 Docker Hub 账号
2. **版本号**: 遵循语义化版本 (Semantic Versioning)
3. **更新**: 每次发布前更新 `CHANGELOG.md`
4. **测试**: 发布前务必测试所有功能

---

## 🎉 准备就绪！

项目已经准备好发布。请执行以下步骤：

```bash
# 1. 进入项目目录
cd /home/thelu/openclaw-launcher

# 2. 运行发布脚本
./scripts/publish.sh

# 3. 按照提示操作
```

或者手动发布：

```bash
# npm
npm adduser
npm publish --access public

# Docker
docker login
docker build -t 1va7/openclaw-launcher:latest .
docker push 1va7/openclaw-launcher:latest
```

---

**祝你发布顺利！** 🦞
