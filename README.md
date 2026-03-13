# 🦞 OpenClaw 启动器

> **让 OpenClaw 更易用 - 一键启动 | 图形配置 | 自动诊断 | Skills 市场 | Docker 部署**

[![npm version](https://img.shields.io/npm/v/@1va7/openclaw-launcher.svg)](https://www.npmjs.com/package/@1va7/openclaw-launcher)
[![Docker Image](https://img.shields.io/docker/v/1va7/openclaw-launcher)](https://hub.docker.com/r/1va7/openclaw-launcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/1va7/openclaw-launcher)](https://github.com/1va7/openclaw-launcher/stargazers)

---

## 🎯 项目简介

OpenClaw 功能强大但配置复杂，80% 的用户只会基本对话和配置。**OpenClaw 启动器** 旨在降低使用门槛，提供：

- 🚀 **一键启动** - 无需记忆复杂命令
- 🎨 **图形化配置** - 鼠标点点点完成配置
- 🔍 **自动诊断** - 检测问题并自动修复
- 🧩 **Skills 市场** - 像手机应用商店一样简单
- 🐳 **Docker 部署** - 生产环境一键部署

---

## ✨ 核心特性

### 🎮 CLI 工具
```bash
openclaw-launcher start        # 启动 Gateway
openclaw-launcher stop         # 停止 Gateway
openclaw-launcher restart      # 重启 Gateway
openclaw-launcher status       # 查看状态
openclaw-launcher diagnose     # 诊断问题
openclaw-launcher config       # 配置管理
openclaw-launcher skills       # Skills 管理
```

### 🌐 Web UI 界面
- 📊 **实时监控** - Gateway 状态、系统信息
- 🎮 **控制面板** - 一键启动/停止/重启
- 🧩 **Skills 管理** - 浏览、搜索、安装
- 📝 **日志查看** - 实时操作日志
- ⚙️ **配置编辑** - 图形化配置管理
- 🔍 **诊断中心** - 自动诊断和修复
- 📈 **用量监控** - Token 使用统计

### 🐳 Docker 支持
```bash
# 一键部署
docker-compose up -d

# 访问 http://localhost:5173
```

---

## 🚀 快速开始

### 方法 1: npm 安装（推荐）

```bash
# 全局安装
npm install -g @1va7/openclaw-launcher

# 使用
openclaw-launcher
```

### 方法 2: 源码安装

```bash
# 克隆项目
git clone https://github.com/1va7/openclaw-launcher.git
cd openclaw-launcher

# 安装依赖
npm install

# 全局链接
npm link

# 使用
openclaw-launcher
```

### 方法 3: Docker 部署（生产环境）

```bash
# 克隆项目
git clone https://github.com/1va7/openclaw-launcher.git
cd openclaw-launcher

# 复制环境变量
cp .env.example .env

# 一键启动
docker-compose up -d

# 访问 http://localhost:5173
```

### 方法 4: Web UI（开发环境）

```bash
# 进入项目目录
cd openclaw-launcher

# 安装依赖
npm install

# 启动 Web UI（同时启动 API 和前端）
./start-web.sh

# 访问 http://localhost:5173
```

---

## 📋 功能模块

### 1️⃣ 环境检测

检测 OpenClaw 安装状态、配置完整性、Gateway 运行状态等。

```bash
openclaw-launcher detect
```

**检测内容**：
- ✅ OpenClaw CLI 是否安装
- ✅ 配置文件是否存在
- ✅ Workspace 是否完整
- ✅ Gateway 是否运行
- ✅ Skills 状态

### 2️⃣ Gateway 控制

控制 OpenClaw Gateway 的启动、停止、重启。

```bash
openclaw-launcher start          # 启动
openclaw-launcher start --force  # 强制启动（释放端口）
openclaw-launcher start -p 19000 # 指定端口
openclaw-launcher stop           # 停止
openclaw-launcher restart        # 重启
```

### 3️⃣ 诊断和修复

自动检测问题并提供修复方案。

```bash
openclaw-launcher diagnose       # 诊断
openclaw-launcher diagnose --fix # 诊断并自动修复
```

**诊断内容**：
- 🔍 OpenClaw 安装状态
- 🔍 配置文件有效性
- 🔍 Workspace 完整性
- 🔍 Gateway 健康状态
- 🔍 Node.js 版本
- 🔍 文件权限
- 🔍 网络连接
- 🔍 Skills 状态

### 4️⃣ 配置管理

读取、修改、验证 OpenClaw 配置。

```bash
openclaw-launcher config --summary        # 配置摘要
openclaw-launcher config --validate       # 验证配置
openclaw-launcher config -g gateway.mode  # 获取配置值
openclaw-launcher config -s gateway.port=19000  # 设置配置值
```

### 5️⃣ Skills 管理

浏览、安装、管理 Skills。

```bash
openclaw-launcher skills --list           # 列出已安装
openclaw-launcher skills --search coding  # 搜索
openclaw-launcher skills --install backend  # 安装
openclaw-launcher skills --uninstall xxx  # 卸载
```

### 6️⃣ 交互模式

适合新手的交互式菜单。

```bash
openclaw-launcher interactive
# 或直接运行
openclaw-launcher
```

---

## 🎨 Web UI 界面

### 概览页面
- Gateway 状态指示器
- 控制面板（启动/停止/重启/刷新）
- 系统信息卡片
- 实时数据展示

### Skills 管理
- 🛠️ **管理页** - 已安装 Skills 列表、搜索、卸载
- 🏪 **市场页** - Skills 浏览、推荐、一键安装

### 配置中心
- 🤖 模型配置
- 🚀 Gateway 配置
- 💬 通道配置
- 👤 Agent 设置
- 🔌 插件管理

### 诊断中心
- 一键诊断
- 可视化报告
- 自动修复
- 修复历史

### 用量监控
- 实时 Token 统计
- 花费统计
- 用量趋势图
- 模型排行
- 优化建议

---

## 🏗️ 项目结构

```
openclaw-launcher/
├── src/                        # CLI 源代码
│   ├── index.js               # 主入口
│   └── core/
│       ├── detector.js        # 环境检测模块
│       ├── gateway.js         # Gateway 控制模块
│       ├── config.js          # 配置管理模块
│       ├── diagnostician.js   # 诊断修复模块
│       ├── config-validator.js # 配置验证工具
│       └── __tests__/         # 单元测试
├── api-server.js              # Web API 服务器
├── web-ui/                    # React 前端
│   ├── src/
│   │   ├── App.jsx           # 主应用
│   │   ├── api.js            # API 客户端
│   │   └── components/       # React 组件
│   └── package.json
├── scripts/
│   ├── install.sh           # 一键安装脚本
│   └── publish.sh           # 发布脚本
├── docs/                    # 文档
│   ├── QUICKSTART.md        # 5 分钟快速上手
│   ├── DOCKER.md            # Docker 部署指南
│   ├── PUBLISH.md           # 发布指南
│   └── ...
├── Dockerfile               # Docker 镜像
├── docker-compose.yml       # Docker 编排
├── .env.example             # 环境变量模板
├── package.json
├── README.md
└── CHANGELOG.md
```

---

## ⚙️ 配置说明

### 环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```bash
# API 服务器配置
API_PORT=3001
API_HOST=localhost

# Web UI 配置
WEB_PORT=5173
WEB_HOST=0.0.0.0

# OpenClaw 配置
OPENCLAW_CONFIG_PATH=~/.openclaw/openclaw.json
OPENCLAW_GATEWAY_PORT=18789

# 功能开关
ENABLE_SKILLS_MARKET=true
ENABLE_USAGE_TRACKING=true

# 日志配置
LOG_LEVEL=info
```

### 端口配置

默认端口：
- **API 服务器**: 3001
- **Web UI**: 5173
- **Gateway**: 18789

可以通过环境变量或命令行参数修改。

---

## 🛠️ 开发指南

### 本地开发

```bash
# 克隆项目
git clone https://github.com/1va7/openclaw-launcher.git
cd openclaw-launcher

# 安装依赖
npm install
cd web-ui && npm install && cd ..

# 启动开发服务
npm run dev:all

# 访问 http://localhost:5173
```

### 运行测试

```bash
# 运行单元测试
npm test

# 验证配置
npm run validate

# 运行所有测试
npm run test:all
```

### 构建生产版本

```bash
# 构建前端
cd web-ui && npm run build

# 构建可执行文件
npm run build
```

---

## 📊 系统要求

### 最低要求
- Node.js 18+
- npm 8+
- 512MB RAM
- 100MB 磁盘空间

### 推荐配置
- Node.js 22+
- npm 10+
- 1GB RAM
- 500MB 磁盘空间

### Docker 要求
- Docker 20.10+
- Docker Compose 2.0+

---

## 🔧 常见问题

### Q1: Web UI 打不开？

**检查 API 服务器是否运行**:
```bash
curl http://localhost:3001/api/status
```

**解决方案**:
```bash
./start-web.sh
```

### Q2: Gateway 启动失败？

**检查端口占用**:
```bash
lsof -i :18789
```

**强制启动**:
```bash
openclaw-launcher start --force
```

### Q3: Skills 安装失败？

**原因**: ClawHub CLI rate limit 限制

**解决方案**:
1. 等待 30 分钟后重试
2. 或使用 CLI 安装：`clawhub install <skill-name>`

### Q4: 配置错误？

**运行诊断**:
```bash
openclaw-launcher diagnose
```

**验证配置**:
```bash
openclaw-launcher config --validate
```

更多问题请查看 [完整文档](docs/)。

---

## 📚 文档

- 📖 [5 分钟快速上手](docs/QUICKSTART.md)
- 🐳 [Docker 部署指南](docs/DOCKER.md)
- 📦 [发布指南](docs/PUBLISH.md)
- 🔧 [改进建议](docs/IMPROVEMENTS.md)
- 📝 [更新日志](CHANGELOG.md)
- 🌐 [Web UI 文档](docs/WEBUI.md)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发环境

```bash
git clone https://github.com/1va7/openclaw-launcher.git
cd openclaw-launcher
npm install
cd web-ui && npm install
```

---

## 📈 路线图

### Phase 1 - CLI 核心功能 ✅
- [x] 环境检测
- [x] Gateway 控制
- [x] 配置管理
- [x] 诊断修复
- [x] Skills 管理
- [x] 交互模式

### Phase 2 - Web UI ✅
- [x] 状态监控
- [x] 控制面板
- [x] Skills 管理
- [x] 日志查看
- [x] 配置编辑
- [x] 诊断中心
- [x] 用量监控

### Phase 3 - Docker 支持 ✅
- [x] Dockerfile
- [x] docker-compose
- [x] 健康检查
- [x] 部署文档

### Phase 4 - 桌面应用 (计划中)
- [ ] Electron 版本
- [ ] 系统托盘
- [ ] 自动更新

### Phase 5 - 增强功能 (计划中)
- [ ] 多 Gateway 管理
- [ ] 配置版本控制
- [ ] 插件系统
- [ ] 主题定制

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👤 作者

**VA7** - 让 AI Agent 更易用

- GitHub: [@1va7](https://github.com/1va7)
- 小红书：VA7

---

## 🙏 致谢

感谢 [OpenClaw](https://github.com/openclaw/openclaw) 社区提供的优秀框架！

---

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 代码行数 | ~2500 行 |
| 核心模块 | 10 个 |
| CLI 命令 | 10+ 个 |
| API 端点 | 12+ 个 |
| React 组件 | 11 个 |
| 文档数量 | 15+ 个 |
| npm 下载量 | 📈 持续增长 |
| Docker 拉取 | 🐳 持续增加 |

---

## 🔗 相关链接

- **npm 包**: https://www.npmjs.com/package/@1va7/openclaw-launcher
- **Docker Hub**: https://hub.docker.com/r/1va7/openclaw-launcher
- **OpenClaw 官方**: https://github.com/openclaw/openclaw
- **OpenClaw 文档**: https://docs.openclaw.ai
- **社区 Discord**: https://discord.com/invite/clawd

---

<div align="center">

**让 OpenClaw 飞入寻常百姓家** 🦞

如果这个项目对你有帮助，请给一个 ⭐ Star！

[![Star History Chart](https://api.star-history.com/svg?repos=1va7/openclaw-launcher&type=Date)](https://star-history.com/#1va7/openclaw-launcher&Date)

</div>
