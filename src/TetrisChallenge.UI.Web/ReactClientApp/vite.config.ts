import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { readFileSync } from 'fs';
import { moduleCertFilePath, moduleKeyFilePath } from './src/aspnetcore-https';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: {
      key: readFileSync(moduleKeyFilePath),
      cert: readFileSync(moduleCertFilePath)
    },
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:5001',
        changeOrigin: true,
        secure: false
      },
      '/hub': {
        target: 'https://127.0.0.1:5001',
        ws: true,
        secure: false
      },
    },
    fs: {
      allow: [
        '..'
      ]
    }
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        // svgr options
      },
    }),
  ],
  resolve: {
    dedupe: [
      "@daniel.neuweiler/ts-lib-module",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material",
      "@mui/icons-material",
      "react",
      "react-dom",
      "react-window"
    ]
  },
  build: {
    outDir: './build',
    // sourcemap: true,
    minify: false,
  },
  assetsInclude: ['png', 'jpg']
})
