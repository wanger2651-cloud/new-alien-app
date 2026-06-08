import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import Components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni(),UnoCSS(),Components({})],
  server: {
  		proxy: {
  			'/api': {
  				target: 'https://waimaieapp.meituan.com/',
  				changeOrigin: true,
  				rewrite: path => path.replace(/^\/api/, '')
  			}
  		}
  	},
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'), // 假设你的源码目录是./src
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
});

