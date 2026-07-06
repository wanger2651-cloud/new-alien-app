<template>
	<view class="manage-redirect"></view>
</template>
<script setup>
import { onLoad } from '@dcloudio/uni-app'

onLoad(() => {
	uni.reLaunch({ url: '/pages/storeManage/storeManage?mpTab=1' })
})
</script>

<style>
.manage-redirect {
	min-height: 100vh;
	background: #f5f5f5;
}
</style>
