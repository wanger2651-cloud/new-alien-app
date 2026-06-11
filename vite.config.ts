import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import Components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite'
import { resolve } from 'path';
import fs from 'fs';
// https://vitejs.dev/config/
const isMpWeixin = process.env.UNI_PLATFORM === 'mp-weixin'

/** 编译后修正 project.config.json，避免 touristappid 导致开发者工具报错 */
function fixMpWeixinProjectConfig() {
  const fix = () => {
    if (process.env.UNI_PLATFORM !== 'mp-weixin') return
    for (const sub of ['dist/dev/mp-weixin', 'dist/build/mp-weixin']) {
      const file = resolve(__dirname, sub, 'project.config.json')
      if (!fs.existsSync(file)) continue
      const json = JSON.parse(fs.readFileSync(file, 'utf8'))
      if (json.appid === 'touristappid') {
        json.appid = ''
      }
      json.projectname = json.projectname || '青柠助手'
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
    }
  }
  return {
    name: 'fix-mp-weixin-project-config',
    closeBundle: fix,
    buildEnd: fix,
  }
}

export default defineConfig({
  plugins: [
    UnoCSS({
      ...(isMpWeixin ? { hmrTopLevelAwait: false } : {}),
    }),
    uni(),
    ...(isMpWeixin ? [fixMpWeixinProjectConfig()] : []),
    ...(isMpWeixin ? [] : [Components({})]),
  ],
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

