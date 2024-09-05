import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 使用通配符 /api* 来代理所有以 /api 开头的请求
      '/api': {
        target: 'http://127.0.0.1:5000',  // 你的后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),  // 将前缀 /api 移除
      },
    },
  },
});
