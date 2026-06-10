import { defineConfig, presetAttributify, presetMini, presetUno } from 'unocss'
import presetRemToPx from '@unocss/preset-rem-to-px'

// 刚使用unocss的朋友，可以借助这个工具： https://to-unocss.netlify.app

export default defineConfig({
  presets: [
    presetUno,
    presetAttributify,
    presetRemToPx({
      baseFontSize: 4,
    }),
    presetMini(),
  ],
  shortcuts: {
    'flex-center': 'flex items-center justify-center',
    ft30: 'text-[30rpx]',
    tc: 'text-center',
  },
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
