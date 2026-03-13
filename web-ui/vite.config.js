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
    cors: true,  // 启用 CORS
    proxy: {
      // 代理 API 请求
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: false,  // 不改变 Origin，保持原样
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('❌ 代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('📤 代理请求:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 代理响应:', req.method, req.url, proxyRes.statusCode);
          });
        },
      },
    },
  },
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
