<script setup lang="ts">
import { ref } from 'vue';

const checked = ref(false)
const props = defineProps(['cityobj','addressList']);
const isExpand = ref(false)

function onToggle() {
  isExpand.value = !isExpand.value
}

const mockCity = ref([
  { label: '福州市', value: 1, checked: false },
  { label: '福州市', value: 2, checked: false },
  { label: '福州市', value: 3, checked: false },
  { label: '福州市', value: 4, checked: false },
  { label: '福州市', value: 5, checked: false },
])
const changeallchexk=()=>{
  console.log("changeallchexk "+props.cityobj);
  let brr=props.cityobj.childcity.filter(item=>item.checked)
  if(brr&&brr.length==props.cityobj.childcity.length){
   props.cityobj.checked=true;
  }else{
    props.cityobj.checked=false;
  }
  
  
}
const checkchange=(check)=>{
  props.cityobj.childcity=props.cityobj.childcity.map(item=>{
    item.checked=props.cityobj.checked
    return item
  })
  
}
</script>

<template>
  <view class="group-city-item">
    <view class="flex items-center justify-between">
      <view class="flex items-center" @click.stop="onToggle">
		  <image src="../static/shop/arrow.jpg" mode="" :class="{ isExpand }" class="arrow h-5 w-8"></image>
        <!-- <img src="./images/arrow.jpg" :class="{ isExpand }" class="arrow h-5 w-8"> -->
        <span class="ml-4 text-14 text-T333333">{{cityobj.city}}</span>
      </view>
      <wd-checkbox v-model="cityobj.checked" icon-size="16" checked-color="#ee0a24" @click="checkchange">
        <span class="text-13" :class="[cityobj.checked ? 'text-F81C3A' : 'text-T333333']">全选</span>
      </wd-checkbox>
    </view>

    <view class="city-list" :class="{ isExpand }">
      <FilterContentGroupCityItemCheckbox v-for="item in cityobj.childcity" :key="item.value" :item="item" @changeallchexk='changeallchexk' />
    </view>

    <view />
  </view>
</template>

<style lang="scss" scoped>
.arrow {
  transform: rotate(-90deg);
  &.isExpand {
    transform: rotate(0deg);
  }
}

.group-city-item {
  border-bottom: 1px solid #DFDFDF;
  padding-bottom: 10px;
}

.city-list {
  display: none;
  &.isExpand {
    display: block;
  }
}
</style>
