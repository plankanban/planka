import { defineConfig } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
// eslint-disable-next-line import/no-unresolved
import browserslistToEsbuild from 'browserslist-to-esbuild';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    commonjs(),
    nodePolyfills({
      include: ['fs', 'path', 'process', 'url'],
    }),
    react(),
    svgr(),
  ],
  resolve: {
    alias: {
      'source-map-js': 'source-map',
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: browserslistToEsbuild(['>0.2%', 'not dead', 'not op_mini all']),
  },
});
