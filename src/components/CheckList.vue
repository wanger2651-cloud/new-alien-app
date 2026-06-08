<script setup lang="ts">
import { onMounted, ref } from 'vue';

interface ListItem {
  label: string
  value: number
  checked?: boolean
}

interface Props {
  list: ListItem[]
  single: boolean // 是否单选
  label?: string
  active?: number | number[] // 当前第几个选中
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:active', value: number | number[]): void
}>()

const list = ref<ListItem[]>([])

onMounted(() => {
  const activeArr = typeof props.active === 'number' ? [props.active] : props.active

  list.value = props.list.reduce((acc, item, index) => {
    acc.push({
      ...item,
      checked: activeArr.includes(index),
    })
    return acc
  }, [] as ListItem[])
})

function onChange(index: number) {
	console.log(index,props.active)
  if (props.single) {
    if (index === props.active)
      return
    const indexArr = []
    list.value.forEach((item, i) => {
      if (i === index) {
        item.checked = true
        indexArr.push(i)
      }
      else {
        item.checked = false
      }
    })
    emit('update:active', index)
  }
  else {
    list.value[index].checked = !list.value[index].checked
    emit('update:active', list.value.map((item, index) => item.checked ? index : -1).filter(index => index !== -1))
  }
}
</script>

<template>
  <view class="flex flex-col justify-between pb-15">
    <view v-if="props.label" class="mb-10 text-15 text-T333333">
      {{ props.label }}
    </view>
    <view class="list-wrapper">
      <view v-for="(item, index) in list" :key="item.value" :class="{ checked: item.checked }" class="item px-8 py-4" @click="onChange(index)">
        <span class="text-14">{{ item.label }}</span>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.list-wrapper {
  &::after {
    clear: both;
  }
  .item {
    float: left;
    margin-right: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    background-color: #F0F0F0;
    border: 1px solid #F0F0F0;

    &.checked {
      background-color: #F81C3A;
      background: #fff;
      color: #F81C3A;
      border: 1px solid #F81C3A;
    }
  }
}
</style>
