# 🌍 跨平台兼容性指南

> OpenClaw 启动器支持各种 Linux 发行版、macOS 和 WSL

---

## ✅ 已测试平台

| 平台 | 状态 | 说明 |
|------|------|------|
| Ubuntu 20.04+ | ✅ 完全支持 | 推荐使用 |
| Debian 11+ | ✅ 完全支持 | |
| CentOS 8+ | ✅ 完全支持 | |
| Fedora 35+ | ✅ 完全支持 | |
| macOS 12+ | ✅ 完全支持 | |
| WSL2 (Windows) | ✅ 完全支持 | Windows Subsystem for Linux |
| Alpine Linux | ✅ 支持 | Docker 容器 |
| Arch Linux | ✅ 支持 | |

---

## 🚀 快速开始

### 通用安装方法（所有平台）

```bash
# 1. 克隆项目
git clone https://github.com/Zhonglin-Lu/openclaw-launcher.git
cd openclaw-launcher

# 2. 安装依赖
npm install

# 3. 启动
./start-web.sh
```

### 平台特定说明

#### Ubuntu/Debian

```bash
# 安装 Node.js (如果未安装)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 启动
./start-web.sh
```

#### CentOS/Fedora

```bash
# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo yum install -y nodejs

# 启动
./start-web.sh
```

#### macOS

```bash
# 安装 Node.js (使用 Homebrew)
brew install node@22

# 启动
./start-web.sh
```

#### WSL2 (Windows)

```bash
# 在 WSL2 中安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 启动
./start-web.sh

# Windows 访问地址
# http://localhost:5173
# 或 http://<WSL2-IP>:5173
```

---

## 🔧 兼容性改进

### 1. 路径处理

**改进前**:
```bash
cd $(dirname $0)  # 某些系统不支持
```

**改进后**:
```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"  # 兼容所有系统
```

### 2. 端口检测

**多方法支持**:
- **lsof**: macOS, Linux
- **netstat**: 传统 Linux
- **ss**: 现代 Linux

```bash
check_port() {
    # 方法 1: lsof
    if command -v lsof &> /dev/null; then
        lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
        return $?
    fi
    
    # 方法 2: netstat
    if command -v netstat &> /dev/null; then
        netstat -tln 2>/dev/null | grep -q ":$port "
        return $?
    fi
    
    # 方法 3: ss
    if command -v ss &> /dev/null; then
        ss -tln 2>/dev/null | grep -q ":$port "
        return $?
    fi
    
    return 1
}
```

### 3. 环境变量

**灵活配置**:
```bash
# 支持多种变量名
PORT=$API_PORT
HOST=$API_HOST

# 默认值
API_PORT=${API_PORT:-3001}
API_HOST=${API_HOST:-0.0.0.0}
```

### 4. 进程管理

**优雅退出**:
```bash
# 注册清理函数
trap cleanup INT TERM

cleanup() {
    kill $API_PID 2>/dev/null || true
    kill $WEB_PID 2>/dev/null || true
    exit 0
}
```

---

## 🐛 常见问题

### Q1: `dirname: invalid option`

**错误**:
```
dirname: invalid option -- 'b'
```

**解决**:
已修复！使用标准写法：
```bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
```

### Q2: 端口检测失败

**错误**:
```
无法检查端口
```

**解决**:
脚本会自动尝试多种方法（lsof/netstat/ss），如果都失败会假设端口可用。

### Q3: `command not found: npm`

**解决**:
```bash
# Ubuntu/Debian
sudo apt install npm

# CentOS/Fedora
sudo yum install npm

# macOS
brew install node
```

### Q4: 权限错误

**错误**:
```
Permission denied
```

**解决**:
```bash
chmod +x start-web.sh
./start-web.sh
```

### Q5: 防火墙阻止

**解决**:
```bash
# Ubuntu/Debian
sudo ufw allow 3001/tcp
sudo ufw allow 5173/tcp

# CentOS/Fedora
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
```

---

## 📊 系统要求

### 最低要求

| 组件 | 版本 |
|------|------|
| Node.js | 18+ |
| npm | 8+ |
| Bash | 4.0+ |
| RAM | 512MB |
| 磁盘 | 100MB |

### 推荐配置

| 组件 | 版本 |
|------|------|
| Node.js | 22+ |
| npm | 10+ |
| Bash | 5.0+ |
| RAM | 1GB |
| 磁盘 | 500MB |

---

## 🔍 诊断脚本

创建 `diagnose.sh`:

```bash
#!/bin/bash

echo "🔍 系统诊断..."

# 检查 Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    echo "✅ $(node --version)"
else
    echo "❌ 未安装"
fi

# 检查 npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    echo "✅ $(npm --version)"
else
    echo "❌ 未安装"
fi

# 检查 Bash
echo -n "Bash: "
if command -v bash &> /dev/null; then
    echo "✅ $(bash --version | head -1)"
else
    echo "❌ 未安装"
fi

# 检查端口工具
echo -n "端口检测: "
if command -v lsof &> /dev/null; then
    echo "✅ lsof"
elif command -v netstat &> /dev/null; then
    echo "✅ netstat"
elif command -v ss &> /dev/null; then
    echo "✅ ss"
else
    echo "⚠️  无（将使用默认端口）"
fi

# 检查端口占用
echo ""
echo "端口状态:"
for port in 3001 5173; do
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo "  端口 $port: ❌ 被占用"
        else
            echo "  端口 $port: ✅ 可用"
        fi
    else
        echo "  端口 $port: ⚠️  无法检查"
    fi
done

# 检查依赖
echo ""
echo "依赖状态:"
if [ -d "node_modules" ]; then
    echo "  主项目依赖：✅ 已安装"
else
    echo "  主项目依赖：❌ 未安装"
fi

if [ -d "web-ui/node_modules" ]; then
    echo "  Web UI 依赖：✅ 已安装"
else
    echo "  Web UI 依赖：❌ 未安装"
fi

echo ""
echo "诊断完成！"
```

使用：
```bash
chmod +x diagnose.sh
./diagnose.sh
```

---

## 🎯 最佳实践

### 1. 使用 LTS 版本

```bash
# 安装 Node.js LTS
nvm install --lts
nvm use --lts
```

### 2. 使用环境变量

```bash
# .env 文件
API_PORT=3001
API_HOST=0.0.0.0
WEB_PORT=5173
WEB_HOST=0.0.0.0
LOG_LEVEL=info
```

### 3. 后台运行

```bash
# 使用 nohup
nohup ./start-web.sh > launcher.log 2>&1 &

# 或使用 systemd (Linux)
sudo systemctl start openclaw-launcher
```

### 4. 日志轮转

```bash
# 使用 logrotate
cat > /etc/logrotate.d/openclaw-launcher << EOF
/home/thelu/openclaw-launcher/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
}
EOF
```

---

## 📈 性能优化

### 1. 减少依赖安装时间

```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com

# 或使用 yarn
yarn install
```

### 2. 加快启动速度

```bash
# 预加载依赖
node -e "require('./api-server.js')" &

# 使用 PM2
pm2 start api-server.js
pm2 start web-ui/src/main.jsx
```

### 3. 内存优化

```bash
# 限制 Node.js 内存
export NODE_OPTIONS="--max-old-space-size=512"
```

---

## 🆘 故障排查

### 完全无法启动

```bash
# 1. 清理所有进程
pkill -f "node api-server"
pkill -f "vite"
pkill -f "npm run dev"

# 2. 清理端口
lsof -ti:3001,5173 | xargs kill -9

# 3. 重新安装
rm -rf node_modules web-ui/node_modules
npm install
cd web-ui && npm install

# 4. 启动
./start-web.sh
```

### 网络问题

```bash
# 检查防火墙
sudo ufw status

# 检查监听地址
netstat -tlnp | grep -E "3001|5173"

# 测试连接
curl http://localhost:3001/api/status
curl http://localhost:5173
```

---

## 📚 更多资源

- [Node.js 安装指南](https://nodejs.org/en/download/)
- [nvm - Node 版本管理](https://github.com/nvm-sh/nvm)
- [PM2 - 进程管理](https://pm2.keymetrics.io/)
- [GitHub Issues](https://github.com/Zhonglin-Lu/openclaw-launcher/issues)

---

**跨平台兼容性已优化！** 🌍

如有问题，请查看 [故障排查指南](TROUBLESHOOTING.md)。
