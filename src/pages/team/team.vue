<template>
	<view class="page-container">
		team
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	
	const systemBarHeight = ref(0)
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	onLoad(() => {
		getSysteminfo()
	})
</script>

<style scoped lang="scss">
</style>