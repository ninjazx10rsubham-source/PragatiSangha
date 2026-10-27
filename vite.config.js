import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'html-dev-entry',
      transformIndexHtml(html, ctx) {
        // In Vite dev server mode, dynamically inject /src/main.jsx for HMR
        if (ctx && ctx.server) {
          return html
            .replace(/<script type="module" crossorigin src=".*?"><\/script>/, '<script type="module" src="/src/main.jsx"></script>')
            .replace(/<link rel="stylesheet" crossorigin href="assets\/.*?">/, '');
        }
        return html;
      }
    }
  ],
  base: './',
  server: {
    port: 3000,
    open: true
  }
});
