<script setup>
import { ref } from 'vue'
const emit = defineEmits(['confirmHandler'])

// 筛选类型
const filterTypes = ref([
  { label: '按店铺筛选', value: 0 },
  { label: '按分组筛选', value: 1 },
  { label: '按城市筛选', value: 2 },
])
const filterTypeActive = ref(0)

// 提交按钮
const confirmHandler = (type,value) => {
  console.log(type,value);
  
  emit('confirmHandler',type,value)
}
</script>

<template>
  <view class="flex flex-col px-15 pb-15">
    <view class="flex flex-1 flex-col">
      <view class="py-14 text-center text-17 text-T333333 font-500">
        <span v-if="filterTypeActive === 0">按店铺筛选</span>
        <span v-else-if="filterTypeActive === 1">按分组筛选</span>
        <span v-else>按城市筛选</span>
      </view>
      <CheckList v-model:active="filterTypeActive" label="筛选类别" :list="filterTypes" single />
    </view>

    <view class="">
      <!-- 店铺 -->
      <FilterContentShop v-if="filterTypeActive === 0" @confirmHandler="confirmHandler"/>
      <!-- 根据分组 -->
      <FilterContentGroup v-else-if="filterTypeActive === 1" @confirmHandler="confirmHandler" />
      <!-- 根据城市筛选 -->
      <FilterContentGroupCity v-else  @confirmHandler="confirmHandler"/>
    </view>
  </view>
</template>

<style lang="scss" scoped>

</style>
