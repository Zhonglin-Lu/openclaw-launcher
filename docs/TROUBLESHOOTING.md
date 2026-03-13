# 🔧 故障排查指南

> 解决"点击启动没反应"和"Failed to fetch"错误

---

## ❌ 常见问题

### 问题 1: 点击启动按钮没反应

**症状**:
- 点击"启动"按钮后没有任何反应
- 日志显示"启动失败：Failed to fetch"

**原因**: API 服务器没有运行

**解决方案**:

```bash
# 1. 检查 API 服务器是否运行
curl http://localhost:3001/api/status

# 2. 如果没有响应，启动 API 服务器
cd /home/thelu/openclaw-launcher
node api-server.js &

# 3. 或者使用启动脚本（同时启动 API 和 Web UI）
./start-web.sh
```

---

### 问题 2: 迁移到新设备后无法访问

**症状**:
- 在旧设备上正常，新设备无法访问
- 显示"API 连接失败"

**原因**: 
- API 服务器没有在新设备上运行
- 或者监听地址不是 `0.0.0.0`

**解决方案**:

```bash
# 1. 确保 API 服务器监听所有网络接口
cd /home/thelu/openclaw-launcher
node api-server.js &

# 2. 检查监听地址
curl http://0.0.0.0:3001/api/status
curl http://<你的 IP>:3001/api/status

# 3. 从新设备访问
# 浏览器打开：http://<旧设备 IP>:5180
```

---

### 问题 3: 端口被占用

**症状**:
- 启动时显示"Port 3001 is already in use"
- 或者"Port 5180 is already in use"

**解决方案**:

```bash
# 1. 查找占用端口的进程
lsof -ti:3001 | xargs kill -9
lsof -ti:5180 | xargs kill -9

# 2. 或者使用不同端口
API_PORT=3002 WEB_PORT=5181 ./start-web.sh
```

---

## ✅ 正确的启动流程

### 方法 1: 使用启动脚本（推荐）

```bash
cd /home/thelu/openclaw-launcher
./start-web.sh
```

这会自动启动：
- ✅ API 服务器 (端口 3001)
- ✅ Web UI (端口 5180)

### 方法 2: 手动启动

```bash
# 终端 1: 启动 API 服务器
cd /home/thelu/openclaw-launcher
node api-server.js &

# 终端 2: 启动 Web UI
cd /home/thelu/openclaw-launcher/web-ui
npm run dev -- --host 0.0.0.0 --port 5180
```

### 方法 3: 后台运行

```bash
# 后台启动 API 服务器
cd /home/thelu/openclaw-launcher
nohup node api-server.js > api.log 2>&1 &

# 后台启动 Web UI
cd /home/thelu/openclaw-launcher/web-ui
nohup npm run dev -- --host 0.0.0.0 --port 5180 > web.log 2>&1 &

# 查看日志
tail -f api.log
tail -f web.log
```

---

## 🔍 检查服务状态

### 检查 API 服务器

```bash
# 检查进程
ps aux | grep "node api-server" | grep -v grep

# 检查端口
lsof -i:3001

# 测试 API
curl http://localhost:3001/api/status
```

### 检查 Web UI

```bash
# 检查进程
ps aux | grep "vite" | grep -v grep

# 检查端口
lsof -i:5180

# 测试 Web UI
curl http://localhost:5180
```

---

## 🌐 从其他设备访问

### 1. 获取本机 IP 地址

```bash
hostname -I | awk '{print $1}'
# 输出示例：172.23.160.205
```

### 2. 从其他设备访问

在浏览器中打开：
```
http://172.23.160.205:5180
```

### 3. 如果无法访问

**检查防火墙**:
```bash
# 开放端口
sudo ufw allow 3001/tcp
sudo ufw allow 5180/tcp

# 检查防火墙状态
sudo ufw status
```

**检查监听地址**:
```bash
# 应该显示 0.0.0.0 而不是 127.0.0.1
netstat -tlnp | grep 3001
netstat -tlnp | grep 5180
```

---

## 🆘 快速修复脚本

创建 `fix.sh`:

```bash
#!/bin/bash

echo "🔧 修复 OpenClaw 启动器..."

# 1. 停止旧进程
echo "停止旧进程..."
pkill -f "node api-server" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# 2. 清理端口
echo "清理端口..."
lsof -ti:3001,5180 | xargs kill -9 2>/dev/null
sleep 1

# 3. 启动 API 服务器
echo "启动 API 服务器..."
cd /home/thelu/openclaw-launcher
node api-server.js > api.log 2>&1 &
sleep 2

# 4. 启动 Web UI
echo "启动 Web UI..."
cd /home/thelu/openclaw-launcher/web-ui
npm run dev -- --host 0.0.0.0 --port 5180 > web.log 2>&1 &
sleep 3

# 5. 检查状态
echo ""
echo "✅ 服务已启动"
echo ""
echo "访问地址:"
echo "  本地：http://localhost:5180"
echo "  局域网：http://$(hostname -I | awk '{print $1}'):5180"
echo ""
echo "日志:"
echo "  API:  tail -f /home/thelu/openclaw-launcher/api.log"
echo "  Web:  tail -f /home/thelu/openclaw-launcher/web-ui/web.log"
```

使用：
```bash
chmod +x fix.sh
./fix.sh
```

---

## 📊 新增的 UI 反馈

现在 Web UI 会显示：

### 1. API 连接状态
- 🟢 绿色圆点：已连接
- 🔴 红色圆点：API 断开

### 2. 按钮加载状态
- 点击按钮后显示旋转动画
- 防止重复点击

### 3. 错误提示
- 红色警告框显示详细错误信息
- 提供解决方案提示

### 4. 操作日志
- 所有操作记录在"日志"标签页
- 成功/失败都有明确标识

---

## 🎯 常见问题快速诊断

```bash
# 1. API 是否运行？
curl http://localhost:3001/api/status
# 应该返回 JSON 数据

# 2. Web UI 是否运行？
curl http://localhost:5180
# 应该返回 HTML

# 3. 端口是否被占用？
lsof -i:3001
lsof -i:5180

# 4. 进程是否存在？
ps aux | grep -E "node.*api|vite" | grep -v grep

# 5. 防火墙是否开放？
sudo ufw status | grep -E "3001|5180"
```

---

## 📝 日志位置

```bash
# API 日志
tail -f /home/thelu/openclaw-launcher/api.log

# Web UI 日志
tail -f /home/thelu/openclaw-launcher/web-ui/web.log

# 系统日志
journalctl -u openclaw -f
```

---

## 🆘 还是不行？

1. **重启所有服务**:
```bash
pkill -f "node api-server"
pkill -f "vite"
./start-web.sh
```

2. **检查 OpenClaw Gateway**:
```bash
openclaw gateway status
```

3. **查看完整日志**:
```bash
cat ~/.openclaw/logs/*.log | tail -50
```

4. **重新安装启动器**:
```bash
cd /home/thelu/openclaw-launcher
npm install
cd web-ui && npm install
```

---

**希望这能帮助你解决问题！** 🦞
