<template>
  <view class="gif-render" v-loading="loading">
    <wd-loading v-if="loading" color="#1989fa" />
    <view  class="preview" style="position:relative;width:267px">
      <image :src="bg" ref="bg" style="width:100%;position: relative" alt=""></image>
      <image v-if="cover" :src="cover" alt="" class="postion"></image>
    </view>
    <!-- <img v-show="resImg" :src="resImg" alt="" /> -->
  </view>
</template>
<script>
import GIF from 'gif.js'
import { getGifWorker } from '@/utils/gif.worker'
import { loadGifToCanvas } from "lhh-utils";

export default {
  name: 'CombinedImg',
  props: ['bg', 'cover'],
  data() {
    return {
      resImg: null,
      loading: false
    }
  },
  mounted() {

  },
  watch:{
    cover:{
     handler(val){
       if(val){
          // this.loading = true
          this.resImg = null
        //  this.$nextTick(() => {
        //   if (val.indexOf('.gif')>0) {
        //     this.gifRender()
        //   } else {
        //     this.pngRender()
        //   }
        // })
        }else{
          this.resImg = null
        }
      },
      deep:true,
      immediate:true
    }
  },
  methods: {
    blobToImg(blob) {
      return new Promise((resolve) => {
        let reader = new FileReader()
        reader.addEventListener('load', () => {
          reader.result
          this.resImg = reader.result
          this.loading = false
          this.$emit('imgChange', reader.result)
        })
        reader.readAsDataURL(blob)
      })
    },
    // png生成器
    async pngRender() {
      // 设置默认宽高
      const image = new Image();
      image.crossOrigin = 'anonymous'
      image.src = this.bg.replace('https://zy-gz.oss-cn-shenzhen.aliyuncs.com', '');
      image.onload = () => {
        const target = {
          w: 600, h: 450
        }
        // 设置默认宽高
        let w = image.width
        let h = image.height
        const xRatio = w / target.w
        const yRatio = h / target.h
        // 说明w相对更大，应以高度为最小值
        if (xRatio > yRatio) {
          h = target.h
          w = target.h / image.height * w
        } else {
          // 说明h相对更大，应以w为最小值
          w = target.w
          h = target.w / image.width * h
        }
        const canvas = document.createElement('canvas')
        canvas.setAttribute('id', '__compress__')
        canvas.width = w
        canvas.height = h
        canvas.style.visibility = 'hidden'
        document.body.appendChild(canvas)
        const ctx = canvas.getContext('2d')
        // 绘制背景
        ctx.drawImage(image, 0, 0, w, h);
        const _image = new Image();
        _image.crossOrigin = 'anonymous'
        let src = this.cover.replace('https://zy-gz.oss-cn-shenzhen.aliyuncs.com', '')
        _image.src =src
        _image.onload = () => {
          ctx.drawImage(_image, 0, 0, w, h);
          // 合并图案转image对象
          const imgData = canvas.toDataURL('image/png') // 将 Canvas 内容转换为 base64 编码的 PNG 图片数据
          this.loading = false
          this.resImg = imgData
          this.$emit('imgChange', imgData)
          canvas.remove()
        }
      }
    },
    // gif生成器
    async gifRender() {
      const imgList = await loadGifToCanvas(this.cover.replace('http://file.baidu.com/', '/sypicnew'), true);
      // console.log(imgList,"imgList",this.cover);
      // return ;
      
      const image = new Image();
      image.crossOrigin = 'anonymous'
      image.src = this.bg
      this.clipImgs = []
      image.onload = () => {
        const target = {
          w: 600, h: 450
        }
        // 设置默认宽高
        let w = image.width
        let h = image.height
        const xRatio = w / target.w
        const yRatio = h / target.h
        // 说明w相对更大，应以高度为最小值
        if (xRatio > yRatio) {
          h = target.h
          w = target.h / image.height * w
        } else {
          // 说明h相对更大，应以w为最小值
          w = target.w
          h = target.w / image.width * h
        }
        // GIF实例
        const gif = new GIF({
          workers: 2,
          quality: 8,
          workerScript: getGifWorker(),
          width: w,
          height: h,
        })
        // 遍历gif的各帧
        imgList.forEach((item, index) => {
          const canvas = document.createElement('canvas')
          canvas.setAttribute('id', '__compress__')
          canvas.width = w
          canvas.height = h
          canvas.style.visibility = 'hidden'
          document.body.appendChild(canvas)
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, w, h)
          ctx.drawImage(image, 0, 0, w, h)
          ctx.drawImage(item.img, 0, 0, w, h)
          const compressImage = canvas.toDataURL('image/jpeg', 0.2)
          // gif.addFrame(ctx, { copy: true, delay: item.delay * 10 * 2 });
          gif.addFrame(ctx, { delay: item.delay * 10 });
          canvas.remove()
        })
        gif.on('finished', (blob) => {
          this.blobToImg(blob)
        })
        gif.render()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.preview {
  width: 100%;
}
  .postion{
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

canvas {
  display: none;
}

.gif-render {
  display: flex;
  align-items: center;
  justify-content: center;

}

/deep/.van-loading {
  position: absolute;
  z-index: 9;
}
</style>
