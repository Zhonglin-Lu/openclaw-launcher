# 📦 发布指南

> 发布 OpenClaw 启动器到 npm 和 Docker Hub

---

## 🔐 前提条件

### npm 发布
- 已注册 npm 账号（https://www.npmjs.com/）
- 已验证邮箱
- 已登录 npm

### Docker Hub 发布
- 已注册 Docker Hub 账号（https://hub.docker.com/）
- 已登录 Docker

---

## 🚀 快速发布

### 方法 1: 一键发布脚本（推荐）

```bash
cd /home/thelu/openclaw-launcher

# 运行发布脚本
./scripts/publish.sh
```

---

### 方法 2: 手动发布

#### Step 1: 登录 npm

```bash
# 登录 npm
npm adduser

# 输入用户名、密码、邮箱
# Username: 1va7
# Password: ********
# Email: your-email@example.com
```

验证登录：
```bash
npm whoami
# 应该显示：1va7
```

#### Step 2: 发布到 npm

```bash
# 确保在正确的目录
cd /home/thelu/openclaw-launcher

# 发布（公开包）
npm publish --access public

# 如果发布成功，会显示：
# + @1va7/openclaw-launcher@1.1.0
```

#### Step 3: 验证发布

访问：https://www.npmjs.com/package/@1va7/openclaw-launcher

或者：
```bash
npm view @1va7/openclaw-launcher
```

---

### 方法 3: Docker 发布

#### Step 1: 登录 Docker Hub

```bash
docker login

# 输入用户名和密码
# Username: 1va7
# Password: ********
```

#### Step 2: 构建并推送镜像

```bash
cd /home/thelu/openclaw-launcher

# 构建镜像
docker build -t 1va7/openclaw-launcher:latest .
docker build -t 1va7/openclaw-launcher:1.1.0 .

# 推送镜像
docker push 1va7/openclaw-launcher:latest
docker push 1va7/openclaw-launcher:1.1.0
```

#### Step 3: 验证发布

访问：https://hub.docker.com/r/1va7/openclaw-launcher

---

## 📋 发布前检查清单

### ✅ 代码检查

```bash
# 1. 运行测试
npm test

# 2. 验证配置
npm run validate

# 3. 检查 package.json
npm pkg fix

# 4. 查看将要发布的文件
npm pack --dry-run
```

### ✅ 文档检查

- [ ] README.md 已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新
- [ ] 文档完整

### ✅ 功能检查

- [ ] Web UI 可以正常启动
- [ ] API 服务器正常工作
- [ ] Docker 构建成功
- [ ] 环境变量支持正常

---

## 🔧 常见问题

### Q1: npm publish 失败 - ENEEDAUTH

**原因**: 未登录 npm

**解决**:
```bash
npm adduser
npm publish --access public
```

### Q2: npm publish 失败 - 包名已存在

**原因**: 包名已被占用

**解决**:
- 使用 scoped package: `@1va7/openclaw-launcher`
- 或更改包名

### Q3: Docker push 失败 - denied

**原因**: 未登录 Docker Hub

**解决**:
```bash
docker login
docker push 1va7/openclaw-launcher:latest
```

### Q4: Docker 构建失败 - 找不到文件

**原因**: .dockerignore 配置问题

**解决**:
```bash
# 检查 .dockerignore
cat .dockerignore

# 确保必要的文件没有被忽略
```

---

## 📊 发布后验证

### npm 验证

```bash
# 全局安装测试
npm install -g @1va7/openclaw-launcher

# 测试命令
openclaw-launcher --version
openclaw-launcher --help
```

### Docker 验证

```bash
# 拉取镜像
docker pull 1va7/openclaw-launcher:latest

# 运行测试
docker run -d \
  -p 3001:3001 \
  -p 5173:5173 \
  1va7/openclaw-launcher:latest

# 访问 http://localhost:5173
```

---

## 🎯 发布流程自动化

### 使用 GitHub Actions (可选)

创建 `.github/workflows/publish.yml`:

```yaml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org/
      - run: npm install
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}

  publish-docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          username: ${{secrets.DOCKER_USERNAME}}
          password: ${{secrets.DOCKER_PASSWORD}}
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: |
            1va7/openclaw-launcher:latest
            1va7/openclaw-launcher:${{ github.ref_name }}
```

---

## 📝 版本更新

### 更新版本号

```bash
# 使用 npm version
npm version patch  # 1.1.0 -> 1.1.1 (bug fixes)
npm version minor  # 1.1.0 -> 1.2.0 (new features)
npm version major  # 1.1.0 -> 2.0.0 (breaking changes)
```

### 更新 CHANGELOG

编辑 `CHANGELOG.md`，添加新版本的更新内容。

---

## 🎉 发布成功标志

### npm
- ✅ 可以在 npmjs.com 查看到包
- ✅ 可以 `npm install` 安装
- ✅ CLI 命令可用

### Docker Hub
- ✅ 可以在 hub.docker.com 查看到镜像
- ✅ 可以 `docker pull` 拉取
- ✅ 容器可以正常运行

---

## 📚 更多资源

- [npm 发布文档](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Docker 最佳实践](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Semantic Versioning](https://semver.org/)

---

**祝你发布成功！** 🦞
