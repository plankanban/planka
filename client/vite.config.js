import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
// eslint-disable-next-line import/no-unresolved
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
// eslint-disable-next-line import/no-unresolved
import browserslistToEsbuild from 'browserslist-to-esbuild';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createEjsTemplate = () => ({
  name: 'create-ejs-template',
  closeBundle() {
    if (process.env.INDEX_FORMAT !== 'ejs') return;

    const distPath = path.resolve(__dirname, 'dist');
    const htmlPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(htmlPath)) return;

    const html = fs.readFileSync(htmlPath, 'utf8');

    const ejs = html
      .replace(/(href|src)="\.\/([^"]+)"/g, '$1="<%- basePath %>/$2"')
      .replace('</head>', "  <script>window.BASE_PATH = '<%- basePath %>';</script>\n  </head>");

    fs.writeFileSync(path.join(distPath, 'index.ejs'), ejs);
    fs.unlinkSync(htmlPath);
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    commonjs(),
    nodePolyfills({
      include: ['fs', 'path', 'process', 'url'],
    }),
    react(),
    svgr(),
    createEjsTemplate(),
  ],
  resolve: {
    alias: {
      'source-map-js': 'source-map',
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:1337',
      '/socket.io': { target: 'http://localhost:1337', ws: true },
    },
  },
  build: {
    target: browserslistToEsbuild(['>0.2%', 'not dead', 'not op_mini all']),
  },
});
