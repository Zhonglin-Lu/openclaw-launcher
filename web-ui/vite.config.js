import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    port: 5173,
    strictPort: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
        ws: false,
        timeout: 5000,  // 5 秒超时
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 代理请求:', req.method, req.url);
            console.log('  → 目标:', proxyReq.path);
            console.log('  → 主机:', proxyReq.getHeader('host'));
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 代理响应:', req.method, req.url, '状态:', proxyRes.statusCode);
          });
          proxy.on('error', (err, req, res) => {
            console.error('❌ 代理错误:', err.message);
            console.error('  请求:', req.method, req.url);
            console.error('  目标:', 'http://127.0.0.1:3001' + req.url);
            res.writeHead(502, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({
              success: false,
              error: 'Proxy error',
              message: err.message,
              code: err.code
            }));
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
