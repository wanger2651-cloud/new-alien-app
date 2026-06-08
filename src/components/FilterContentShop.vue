<script setup>
	import { onMounted, ref } from 'vue';
const emit = defineEmits(['confirmHandler'])
// 店铺筛选类型 -> 门店订阅类型 0表示全部门店，1表示授权已失效的门店，2表示授权即将到期的门店，3表示从未预定的，4表示订购未到期的
const filterTypes = ref([
  { label: '全部门店', value: 0 },
  { label: '授权已失效门店', value: 3 },
  { label: '即将到期门店', value: 2 },
  { label: '到期或从未订购门店', value: 1 },
  { label: '订购未到期门店', value: 4 },
])

const active = ref(0)
const confirmHandler = () => {
  emit('confirmHandler','storeType', active.value)
}
</script>

<template>
  <view class="flex flex-col pb-15">
    <view class="mb-10 flex flex-row items-center">
      <span class="text-15 text-T333333">选择筛选类型</span>
      <!-- <span class="text-12 text-T999999">（单选）</span> -->
    </view>

    <CheckList v-model:active="active" :list="filterTypes" single />

    <wd-button type="success" class="!rounded-7" @click="confirmHandler">
      确定
    </wd-button>
  </view>
</template>

<style lang="scss" scoped>

</style>
