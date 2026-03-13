FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json
COPY package*.json ./
COPY web-ui/package*.json ./web-ui/

# 安装依赖
RUN npm install --production
RUN cd web-ui && npm install

# 复制源代码
COPY . .

# 构建前端
RUN cd web-ui && npm run build

# 创建日志目录
RUN mkdir -p logs

# 暴露端口
EXPOSE 3001 5173

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/status || exit 1

# 启动服务
CMD ["npm", "run", "dev:all"]
