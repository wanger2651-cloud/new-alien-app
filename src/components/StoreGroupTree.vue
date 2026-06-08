<template>
  <view class="flex flex-col justify-between">
    <wd-radio-group
      v-if="checknum==0"
      v-model="storeGroup"
      shape="dot"
    >
      <view
        class="title-wrapper"
        v-for="(item,index) of treeData"
        :key="index"
        style="margin-bottom:10px"
      >
        <view
          class="text-14 flex flex-row justify-between items-center"
          @click="toggleRowHandler(index)"
        >
          <view class="flex flex-row items-center">
            {{ item.name }}
          </view>
          <wd-radio
            :name="item.id"
            :value="item.id"
            checked-color="#ee0a24"
          ></wd-radio>
        </view>
      </view>
    </wd-radio-group>
    <wd-checkbox-group v-if="checknum==1" v-model="checked" shape="square">
      <wd-checkbox v-for="item of treeData" :key="item.id" :name="item.id">{{ item.name }}</wd-checkbox>
    </wd-checkbox-group>
  </view>
</template>

<script setup>
import { ref,onMounted } from 'vue'
const props = defineProps(['storeGroupId',"objitem",'check','objitem1'])
// 选择分组
const storeGroup = ref(0);
const currentRowIndex = ref(0);
const checknum=ref(0)
const checked=ref([])
// const treeData = shallowRef([])
const treeData = ref([
	{
		name:'代理',
		id:'0'
	},{
		name:'333',
		id:'1'
	}
])
// 查找全部分组


const getCheckValueHandler = () => {
  return storeGroup.value;
}
const getCheckarr = () => {
  return checked.value;
}
const toggleRowHandler =(index)=>{
	
}
onMounted(() => {
  // initStoreGroup();
  // if(props.objitem){
  //   storeGroup.value=props.objitem.tagId
  // }
  // if(props.check){
  //   checknum.value=props.check
  // }else{
  //   checknum.value=0;
  // }
  // if(props.objitem1.length){
  //   checked.value=props.objitem1
  // }
})

defineExpose({
  getCheckValueHandler,
  getCheckarr
});
</script>

<style lang="scss" scoped>

</style>