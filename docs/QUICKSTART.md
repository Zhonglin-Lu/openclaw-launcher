# 🚀 OpenClaw 启动器 - 5 分钟快速上手

> 从零开始到使用 Web UI，只需 5 分钟！

---

## 📋 前提条件

确保已安装：
- ✅ Node.js 18+
- ✅ OpenClaw

检查命令：
```bash
node --version    # 应该显示 v18.x.x 或更高
openclaw --version # 应该显示 OpenClaw 版本
```

---

## 🎯 第一步：安装启动器 (1 分钟)

```bash
# 进入项目目录
cd /home/thelu/openclaw-launcher

# 安装依赖
npm install
```

---

## 🎨 第二步：启动 Web UI (1 分钟)

```bash
# 启动 Web UI（同时启动 API 服务器和前端）
./start-web.sh
```

看到以下输出表示成功：
```
[API] 🚀 OpenClaw Launcher API 服务器运行在 http://localhost:3001
[WEB]   ➜  Local:   http://localhost:5173/
```

---

## 🌐 第三步：访问界面 (30 秒)

打开浏览器，访问：**http://localhost:5173**

你将看到：
- 🟢 Gateway 状态指示器
- 🎮 控制面板（启动/停止/重启/刷新）
- 📊 系统信息
- 🧩 Skills 列表

---

## ▶️ 第四步：启动 Gateway (30 秒)

在 Web UI 中：
1. 点击 **"▶️ 启动"** 按钮
2. 等待 2 秒
3. 看到 🟢 绿色指示灯表示成功

或者使用 CLI：
```bash
node src/index.js start
```

---

## 🔍 第五步：查看状态 (30 秒)

在 Web UI 概览页面查看：
- **PID**: Gateway 进程 ID
- **端口**: 默认 18789
- **健康状态**: 应该是"健康"
- **运行模式**: local

或者使用 CLI：
```bash
node src/index.js status
```

---

## 🧩 第六步：管理 Skills (1 分钟)

### 查看已安装 Skills

**Web UI**:
- 点击 "🧩 Skills" 标签
- 查看已安装列表

**CLI**:
```bash
node src/index.js skills --list
```

### 搜索 Skills

**Web UI**:
1. 在搜索框输入关键词（如：coding）
2. 点击"搜索"
3. 点击"安装"按钮

**CLI**:
```bash
node src/index.js skills --search coding
node src/index.js skills --install backend
```

---

## 📝 第七步：查看日志 (30 秒)

**Web UI**:
- 点击 "📝 日志" 标签
- 实时查看操作日志
- 日志颜色分类：
  - 🟢 绿色 = 成功
  - 🔴 红色 = 失败
  - 🟡 黄色 = 警告

**CLI**:
```bash
# 查看 Gateway 日志
ls -la ~/.openclaw/logs/
cat ~/.openclaw/logs/*.log | tail -50
```

---

## 🛠️ 常见问题

### Q1: Web UI 打不开？

**检查 API 服务器是否运行**:
```bash
curl http://localhost:3001/api/status
```

应该返回 JSON 数据。如果没有反应，重启服务：
```bash
./start-web.sh
```

### Q2: Gateway 启动失败？

**检查端口是否被占用**:
```bash
lsof -i :18789
```

如果端口被占用，可以：
1. 停止占用端口的进程
2. 或修改配置使用其他端口

**强制启动**:
```bash
node src/index.js start --force
```

### Q3: Skills 安装失败？

**原因**: ClawHub CLI rate limit 限制

**解决方案**:
1. 等待 30 分钟后再试
2. 或使用 CLI 安装：
   ```bash
   clawhub install <skill-name>
   ```

### Q4: 配置错误？

**运行诊断**:
```bash
node src/index.js diagnose
```

**自动修复**:
```bash
# 手动修复配置文件
# 1. 备份
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.backup

# 2. 编辑配置
nano ~/.openclaw/openclaw.json

# 3. 验证
node src/index.js config --validate
```

---

## 🎓 进阶使用

### 自定义端口

**启动时指定端口**:
```bash
node src/index.js start --port 19000
```

### 后台运行

**使用 nohup**:
```bash
nohup ./start-web.sh > launcher.log 2>&1 &
```

### 开机自启

**添加到 ~/.bashrc**:
```bash
echo 'cd /home/thelu/openclaw-launcher && ./start-web.sh &' >> ~/.bashrc
```

---

## 📚 更多资源

- **完整文档**: `docs/PROJECT_SUMMARY.md`
- **Web UI 文档**: `docs/WEBUI.md`
- **项目进度**: `docs/PROGRESS.md`
- **API 文档**: `docs/WEBUI.md#api-端点`

---

## 🎉 恭喜！

你已经完成了 OpenClaw 启动器的快速入门！

**现在你可以**:
- ✅ 使用 Web UI 控制 Gateway
- ✅ 查看实时状态
- ✅ 管理 Skills
- ✅ 查看操作日志

**下一步**:
- 探索配置管理功能
- 安装更多实用 Skills
- 向社区分享你的使用体验

---

**祝你使用愉快！** 🦞

如有问题，请查看文档或提交 Issue。
