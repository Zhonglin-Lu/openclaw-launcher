# 🐳 Docker 部署指南

> 使用 Docker 一键部署 OpenClaw 启动器

---

## 📋 前提条件

- Docker 20.10+
- Docker Compose 2.0+

检查安装：
```bash
docker --version
docker-compose --version
```

---

## 🚀 快速部署

### 方法 1: Docker Compose (推荐)

```bash
# 克隆项目
cd /home/thelu/openclaw-launcher

# 复制环境变量文件
cp .env.example .env

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

**访问地址**:
- Web UI: http://localhost:5173
- API: http://localhost:3001

---

### 方法 2: Docker 命令

```bash
# 构建镜像
docker build -t openclaw-launcher .

# 运行容器
docker run -d \
  -p 3001:3001 \
  -p 5173:5173 \
  -v ~/.openclaw:/root/.openclaw \
  -e API_PORT=3001 \
  -e WEB_HOST=0.0.0.0 \
  --name openclaw-launcher \
  openclaw-launcher

# 查看日志
docker logs -f openclaw-launcher

# 停止容器
docker stop openclaw-launcher
```

---

## ⚙️ 配置选项

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `API_PORT` | 3001 | API 服务器端口 |
| `API_HOST` | localhost | API 服务器监听地址 |
| `WEB_PORT` | 5173 | Web UI 端口 |
| `WEB_HOST` | 0.0.0.0 | Web UI 监听地址 |
| `LOG_LEVEL` | info | 日志级别 (debug/info/warn/error) |
| `NODE_ENV` | production | 运行环境 (development/production) |
| `ENABLE_SKILLS_MARKET` | true | 启用 Skills 市场 |
| `ENABLE_USAGE_TRACKING` | true | 启用用量追踪 |

### 端口映射

```yaml
ports:
  - "3001:3001"  # API 服务器
  - "5173:5173"  # Web UI
```

可以修改为任意端口：
```yaml
ports:
  - "8080:3001"   # 外部访问 8080，内部 3001
  - "80:5173"     # 外部访问 80，内部 5173
```

### 数据卷

```yaml
volumes:
  - ~/.openclaw:/root/.openclaw  # OpenClaw 配置
  - ./logs:/app/logs             # 日志文件
```

---

## 🔧 高级配置

### 使用 Nginx 反向代理

1. 创建 `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server openclaw-launcher:3001;
    }

    upstream web {
        server openclaw-launcher:5173;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location /api/ {
            proxy_pass http://api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            proxy_pass http://web/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

2. 在 `docker-compose.yml` 中启用 Nginx 服务（取消注释）

3. 启动:
```bash
docker-compose up -d
```

---

## 🛠️ 常用命令

### 查看状态
```bash
docker-compose ps
```

### 重启服务
```bash
docker-compose restart
```

### 查看日志
```bash
# 所有日志
docker-compose logs

# 实时日志
docker-compose logs -f

# 特定服务日志
docker-compose logs api
docker-compose logs web
```

### 进入容器
```bash
docker-compose exec openclaw-launcher sh
```

### 更新镜像
```bash
docker-compose pull
docker-compose up -d --build
```

### 清理资源
```bash
# 停止并删除容器
docker-compose down

# 删除所有资源（包括卷）
docker-compose down -v
```

---

## 📊 健康检查

Docker Compose 配置包含健康检查：

```yaml
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/status || exit 1
```

查看健康状态：
```bash
docker inspect --format='{{.State.Health.Status}}' openclaw-launcher
```

---

## 🔐 安全建议

### 1. 使用 HTTPS

在生产环境中，建议使用 HTTPS：

```bash
# 使用 Let's Encrypt
certbot --nginx -d your-domain.com
```

### 2. 限制访问

使用防火墙限制访问：
```bash
# 只允许本地访问
ufw allow from 127.0.0.1 to any port 3001
ufw allow from 127.0.0.1 to any port 5173
```

### 3. 设置认证

在 `docker-compose.yml` 中添加：
```yaml
environment:
  - API_TOKEN=your-secret-token
```

---

## 🐛 故障排查

### Q1: 容器无法启动

**检查日志**:
```bash
docker-compose logs
```

**常见原因**:
- 端口被占用
- 配置文件路径错误
- 权限问题

### Q2: Web UI 无法访问

**检查端口**:
```bash
docker-compose ps
netstat -tlnp | grep 5173
```

**检查防火墙**:
```bash
ufw status
```

### Q3: 数据丢失

**确保挂载了数据卷**:
```yaml
volumes:
  - ~/.openclaw:/root/.openclaw
```

**检查挂载**:
```bash
docker inspect openclaw-launcher | grep Mounts -A 20
```

---

## 📈 性能优化

### 1. 资源限制

在 `docker-compose.yml` 中添加：
```yaml
services:
  openclaw-launcher:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 2. 日志轮转

创建 `docker-compose.override.yml`:
```yaml
version: '3.8'

services:
  openclaw-launcher:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🎯 生产环境部署

### 1. 使用固定版本

```yaml
image: openclaw-launcher:v1.0.0
```

### 2. 启用自动重启

```yaml
restart: always
```

### 3. 使用外部数据库（未来）

```yaml
services:
  db:
    image: postgres:14
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 📚 更多资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [项目 README](../README.md)

---

**祝你部署成功！** 🦞
