# 🚨 快速修复：API 连接失败

> 解决"无法连接到 API 服务器"错误

---

## ❌ 问题症状

**浏览器显示**:
```
API 连接失败
无法连接到 API 服务器：请求超时，请检查网络连接
请确保 API 服务器正在运行 (端口 3001)
```

**CLI 显示**:
```
✅ API 服务器已启动 (PID: 3362)
✅ Web UI 已启动 (PID: 3379)
```

**原因**: 前端代码需要更新以支持局域网访问

---

## ✅ 解决方案

### 方法 1: 重启服务（推荐）

```bash
# 1. 停止当前服务（Ctrl+C）

# 2. 拉取最新代码
cd ~/openclaw-launcher
git pull

# 3. 重新启动
./start-web.sh
```

### 方法 2: 手动重启

```bash
# 1. 停止所有进程
pkill -f "node api-server"
pkill -f "vite"

# 2. 拉取更新
cd ~/openclaw-launcher
git pull

# 3. 启动 API 服务器
node api-server.js &

# 4. 启动 Web UI
cd web-ui
npm run dev -- --host 0.0.0.0
```

### 方法 3: 使用修复脚本

```bash
# 创建修复脚本
cat > fix-api.sh << 'EOF'
#!/bin/bash
echo "🔧 修复 API 连接问题..."

# 停止旧进程
pkill -f "node api-server" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# 拉取最新代码
git pull

# 清理端口
lsof -ti:3001,5173 | xargs kill -9 2>/dev/null
sleep 1

# 启动服务
./start-web.sh
EOF

chmod +x fix-api.sh
./fix-api.sh
```

---

## 🔍 验证修复

### 1. 检查 API 服务器

```bash
# 测试 API
curl http://localhost:3001/api/status

# 应该返回 JSON 数据
```

### 2. 检查 Web UI

```bash
# 测试 Web UI
curl http://localhost:5173

# 应该返回 HTML
```

### 3. 从浏览器访问

**本地访问**:
```
http://localhost:5173
```

**局域网访问**:
```
http://192.168.31.137:5173
```

### 4. 检查控制台日志

打开浏览器开发者工具（F12），查看控制台：
```
📡 API 地址：http://192.168.31.137:3001/api
```

---

## 🎯 已修复的问题

### 修复前
- ❌ API 地址硬编码为 `localhost:3001`
- ❌ 从局域网访问时无法连接
- ❌ 没有调试信息

### 修复后
- ✅ 自动检测当前主机地址
- ✅ 支持 localhost 和局域网访问
- ✅ 添加控制台日志便于调试
- ✅ Vite 代理配置
- ✅ 更好的错误信息

---

## 📊 技术改进

### 1. API 地址检测

```javascript
// 自动检测
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : `http://${window.location.hostname}:3001/api`;
```

### 2. Vite 代理

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

### 3. 错误日志

```javascript
console.log('📡 API 地址:', API_BASE);
console.error('API 请求失败:', { endpoint, error, url });
```

---

## 🆘 还是不行？

### 检查清单

- [ ] API 服务器是否运行？
  ```bash
  curl http://localhost:3001/api/status
  ```

- [ ] Web UI 是否运行？
  ```bash
  curl http://localhost:5173
  ```

- [ ] 防火墙是否开放？
  ```bash
  sudo ufw allow 3001/tcp
  sudo ufw allow 5173/tcp
  ```

- [ ] 端口是否被占用？
  ```bash
  lsof -ti:3001 | xargs kill -9
  lsof -ti:5173 | xargs kill -9
  ```

### 完全重置

```bash
# 1. 停止所有进程
pkill -f "node api-server"
pkill -f "vite"

# 2. 清理
rm -rf node_modules web-ui/node_modules

# 3. 重新安装
npm install
cd web-ui && npm install

# 4. 拉取最新代码
cd ..
git pull

# 5. 启动
./start-web.sh
```

---

## 📞 获取帮助

如果以上方法都不行：

1. **查看日志**:
   ```bash
   tail -f api.log
   tail -f web-ui/web.log
   ```

2. **检查 GitHub Issues**:
   https://github.com/Zhonglin-Lu/openclaw-launcher/issues

3. **提交 Issue**:
   包含以下信息：
   - 操作系统版本
   - Node.js 版本
   - 错误截图
   - 日志输出

---

**修复完成后应该可以正常访问了！** 🎉
