import { defineConfig, presetAttributify, presetMini, presetUno } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

// 刚使用unocss的朋友，可以借助这个工具： https://to-unocss.netlify.app

export default defineConfig({
  presets: [
    presetUno,
    presetAttributify,
    // 为什么要用到这个插件？
    // 模板使用 viewport 作为移动端适配方案，unocss 默认单位为 rem
    // 所以需要转成 px，然后由 postcss 把 px 转成 vw/vh，完成适配
    presetRemToPx({
      // 这里为什么要设置基础字体大小？看下面这篇文章
      // https://juejin.cn/post/7262975395620618298
      baseFontSize: 4,
    }),
    presetMini(),
  ],
  shortcuts: [
  ],
  theme: {
    colors: {
      F9F9F9: {
        DEFAULT: '#F9F9F9',
        dark: '#F9F9F9',
      },
      FFFCEF: {
        DEFAULT: '#FFFCEF',
        dark: '#FFFCEF',
      },
      FFF5F5: {
        DEFAULT: '#FFF5F5',
        dark: '#FFF5F5',
      },
      T333333: {
        DEFAULT: '#333333',
        dark: '#333333',
      },
      T666666: {
        DEFAULT: '#666666',
        dark: '#666666',
      },
      T999999: {
        DEFAULT: '#999999',
        dark: '#999999',
      },
      DFDFDF: {
        DEFAULT: '#DFDFDF',
        dark: '#DFDFDF',
      },
      T4C1E00: {
        DEFAULT: '#4C1E00',
        dark: '#4C1E00',
      },
      F81C3A: {
        DEFAULT: '#F81C3A',
        dark: '#F81C3A',
      },
      FFBE01: {
        DEFAULT: '#FFBE01',
        dark: '#FFBE01',
      },
      T22CC00: {
        DEFAULT: '#22CC00',
        dark: '#22CC00',
      },
    },
  },
})
