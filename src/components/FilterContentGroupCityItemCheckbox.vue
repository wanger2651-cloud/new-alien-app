<script setup lang="ts">
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  item: { label: string, value: number, checked?: boolean }
}>(), {})
const emit=defineEmits(['changeallchexk'])
const key = ref(0)

function onChecked() {
  // eslint-disable-next-line vue/no-mutating-props
  props.item.checked = !props.item.checked
  emit('changeallchexk')
  key.value++
}

</script>

<template>
  <view :key="key" class="check-item rounded-4 px-10 py-4" :class="{ checked: props.item.checked }" @click="onChecked">
    {{ props.item.label }}
  </view>
</template>

<style lang="scss" scoped>
.check-item {
  color: #333333;
  background-color: #F0F0F0;
  border: 1px solid #F0F0F0;
  float: left;
  margin-top: 10px;
  margin-right: 10px;

  &.checked {
    color: #F81C3A;
    background-color: #fff;
    border: 1px solid #F81C3A;
  }
}
</style>
