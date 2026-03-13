import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
    strictPort: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',  // 使用 IP 而不是 localhost
        changeOrigin: true,
        secure: false,
        ws: false,
        // 处理 OPTIONS 预检请求
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 代理请求:', req.method, req.url, '→', proxyReq.path);
            // 添加 CORS 头
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 代理响应:', req.method, req.url, proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ 代理错误:', err.message);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Proxy error', message: err.message}));
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
