import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,  // 允许所有主机访问
    port: 5173,
    strictPort: false,  // 端口被占用时自动尝试下一个
    proxy: {
      // 代理 API 请求到本地 API 服务器
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
