<script setup>
import { ref } from 'vue';
const emit = defineEmits(['confirmHandler'])
const addressList = ref([{city:'江西',childcity:[{value:'1',label:'南昌'},{value:'2',label:'宜春'}]},{city:'江西',childcity:[{value:'1',label:'南昌'}]}])
const addressList1 = ref([])
const getAllStoreAddressList = async () => {
  
}
// 选中城市
function onChecked(index) {
  addressList.value = addressList.value?.map((item,index1) => {
    if (index1 == index) {
      return {
       ...item,
        checked:!item.checked
      }
    } else {
      return item;
    }
  })
}
// 提交
const confirmHandler = () => {
  
}
</script>

<template>
  <view class="flex flex-col pb-15">
    <view class="mb-10 flex flex-row items-center">
      <span class="text-15 text-T333333">选择筛选类型</span>
      <span class="text-12 text-T999999">（多选）</span>
    </view>
    <div v-for="(item,index) in addressList" :key="index">
        <FilterContentGroupCityItem :cityobj='item' :addressList="addressList"/>
    </div>
    <view class="mt-12 w-full flex-1">
      <wd-button type="success" class="!rounded-7" block @click="confirmHandler">
        确定
      </wd-button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.city-list{
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
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
}
</style>
