# OpenClaw 启动器 - Web UI 开发文档

## 📦 Phase 2 - Web UI

**状态**: ✅ 开发完成  
**版本**: v1.0.0  
**日期**: 2026-03-13

---

## 🎯 功能特性

### 1. 实时监控
- ✅ Gateway 状态实时显示
- ✅ 30 秒自动刷新
- ✅ 运行状态可视化（绿色/红色指示器）
- ✅ PID、端口、健康状态一目了然

### 2. 控制面板
- ✅ 一键启动 Gateway
- ✅ 一键停止 Gateway
- ✅ 一键重启 Gateway
- ✅ 手动刷新状态

### 3. 系统信息
- ✅ OpenClaw 版本显示
- ✅ Node.js 版本显示
- ✅ 配置文件状态
- ✅ Workspace 状态
- ✅ Skills 数量统计

### 4. Skills 管理
- ✅ 已安装 Skills 列表
- ✅ Skills 搜索功能
- ✅ 一键安装 Skills
- ✅ 安装进度显示

### 5. 日志查看器
- ✅ 实时操作日志
- ✅ 自动滚动
- ✅ 日志颜色分类（成功/失败/警告）
- ✅ 日志历史记录

---

## 🏗️ 技术架构

### 前端
- **框架**: React 18 + Vite
- **样式**: TailwindCSS
- **状态管理**: React Hooks
- **构建工具**: Vite

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **CORS**: 跨域支持
- **API**: RESTful

### 通信
- **方式**: HTTP REST API
- **端口**: 
  - API 服务器：3001
  - Web UI: 5173 (Vite dev server)

---

## 📁 项目结构

```
openclaw-launcher/
├── api-server.js           # Express API 服务器 (9.4KB)
├── web-ui/                 # React 前端
│   ├── src/
│   │   ├── App.jsx        # 主应用组件 (5.0KB)
│   │   ├── api.js         # API 客户端 (1.8KB)
│   │   ├── index.css      # 全局样式
│   │   └── components/
│   │       ├── StatusCard.jsx      # 状态卡片 (2.2KB)
│   │       ├── ControlPanel.jsx    # 控制面板 (1.7KB)
│   │       ├── SystemInfo.jsx      # 系统信息 (2.1KB)
│   │       ├── SkillsList.jsx      # Skills 列表 (4.0KB)
│   │       └── LogViewer.jsx       # 日志查看器 (1.8KB)
│   ├── package.json
│   └── vite.config.js
├── start-web.sh            # Web UI 启动脚本
├── package.json
└── docs/
    └── WEBUI.md            # 本文档
```

**总代码量**: ~30KB (前端 + 后端)

---

## 🚀 快速开始

### 方法 1: 一键启动（推荐）

```bash
cd /home/thelu/openclaw-launcher
chmod +x start-web.sh
./start-web.sh
```

访问：http://localhost:5173

### 方法 2: 分别启动

**启动 API 服务器**:
```bash
npm run api
```

**启动 Web UI** (新终端):
```bash
npm run web
```

### 方法 3: 生产环境

**构建前端**:
```bash
npm run web:build
```

**部署**:
将 `web-ui/dist` 内容部署到静态服务器

---

## 🔌 API 端点

### Gateway 控制

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/status` | GET | 获取 Gateway 状态 |
| `/api/gateway/start` | POST | 启动 Gateway |
| `/api/gateway/stop` | POST | 停止 Gateway |
| `/api/gateway/restart` | POST | 重启 Gateway |

### 配置管理

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/config` | GET | 获取配置 |
| `/api/config` | POST | 更新配置 |

### 日志

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/logs` | GET | 获取日志 |
| `/api/diagnose` | GET | 获取诊断报告 |

### Skills

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/skills/install` | POST | 安装 Skill |
| `/api/skills/search` | GET | 搜索 Skills |

---

## 📊 响应示例

### GET /api/status

```json
{
  "success": true,
  "data": {
    "gateway": {
      "running": true,
      "pid": "294",
      "port": 18789,
      "healthy": true,
      "mode": "local"
    },
    "system": {
      "openclawVersion": "OpenClaw 2026.3.8",
      "nodeVersion": "v22.22.1",
      "configExists": true,
      "workspaceExists": true
    },
    "skills": {
      "total": 5,
      "list": [
        { "name": "academic-figure-design", "source": "workspace" },
        { "name": "academic-paper-writing", "source": "workspace" }
      ]
    }
  }
}
```

### POST /api/gateway/start

**请求**:
```json
{
  "port": 18789,
  "force": false,
  "verbose": false
}
```

**响应**:
```json
{
  "success": true,
  "message": "Gateway 启动中...",
  "command": "openclaw gateway --port 18789"
}
```

---

## 🎨 UI 设计

### 配色方案
- **主色**: 紫色渐变 (#667eea → #764ba2)
- **成功**: 绿色 (#48bb78)
- **危险**: 红色 (#f56565)
- **警告**: 橙色 (#ed8936)
- **信息**: 蓝色 (#4299e1)

### 组件风格
- **卡片**: 圆角 2xl，阴影 xl
- **按钮**: 渐变色，悬停放大效果
- **状态指示**: 脉冲动画
- **布局**: 响应式 Grid

---

## 🐛 已知问题

1. **ClawHub CLI 不可用**
   - 影响：Skills 搜索和安装功能受限
   - 解决：等待 rate limit 解除

2. **配置编辑器未完成**
   - 状态：开发中
   - 预计：Phase 2.1

3. **WebSocket 实时监控**
   - 状态：计划中
   - 当前：30 秒轮询刷新

---

## 📈 下一步计划

### Phase 2.1 - 配置编辑器
- [ ] 可视化配置表单
- [ ] 模型配置界面
- [ ] Gateway 配置界面
- [ ] 通道配置界面
- [ ] 配置验证和保存

### Phase 2.2 - 诊断中心
- [ ] 一键诊断按钮
- [ ] 可视化诊断报告
- [ ] 自动修复功能
- [ ] 修复历史记录

### Phase 2.3 - 增强功能
- [ ] WebSocket 实时推送
- [ ] 多 Gateway 管理
- [ ] 配置文件版本控制
- [ ] 配置导入/导出

### Phase 3 - 打包发布
- [ ] Electron 桌面应用
- [ ] 一键安装包
- [ ] 自动更新功能

---

## 🧪 测试

### 功能测试
- [x] 状态刷新
- [x] Gateway 启动
- [x] Gateway 停止
- [x] Gateway 重启
- [x] Skills 列表显示
- [x] 日志查看

### 兼容性测试
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 📝 开发日志

**2026-03-13**:
- ✅ 创建 Vite + React 项目
- ✅ 配置 TailwindCSS
- ✅ 实现 API 服务器
- ✅ 实现 5 个核心组件
- ✅ 实现状态监控
- ✅ 实现 Gateway 控制
- ✅ 实现 Skills 管理
- ✅ 实现日志查看器
- ✅ 创建启动脚本

**开发用时**: ~2 小时  
**代码行数**: ~800 行

---

## 🎉 总结

Phase 2 Web UI 核心功能已完成！

**亮点**:
1. ✅ 现代化 UI 设计
2. ✅ 实时监控 Gateway 状态
3. ✅ 一键控制 Gateway
4. ✅ Skills 搜索和安装
5. ✅ 实时日志查看
6. ✅ 响应式布局

**下一步**: 
- 完善配置编辑器
- 添加诊断中心
- 打包成桌面应用

---

**文档作者**: 小麟 📚  
**最后更新**: 2026-03-13 22:55
