<!-- Tree.vue -->
<template>
	<view v-if="treeData && treeData.length" class="tree">
		<view v-for="item in treeData" :key="item.Member.id">
			<view @click="toggleExpanded(item)"
				style="width: 100%;display: flex;align-items: center;line-height: 70rpx;justify-content: space-between;">
				<view @click.stop>
					<wd-checkbox v-model="item.Member.check"
						@change="toggleNode(item)">{{ item.Member.name }}</wd-checkbox>
				</view>
				<text v-if="hasChildren(item)">
					<wd-icon name="caret-left-small" :class="{'icon-ra': item.expanded}" size="26px"></wd-icon>
				</text>
			</view>

			<!-- 根据 expanded 状态显示子节点 -->
			<view v-if="item.children && item.children.length && item.expanded"
				style="width: 100%;box-sizing: border-box;padding-left: 30rpx;">
				<Tree :data="item.children" :default-checked-ids="defaultCheckedIds" :node-change="toggleNode"/>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		watch,
		onMounted
	} from 'vue';

	const props = defineProps({
		data: {
			type: Array,
			required: true
		},
		defaultCheckedIds: {
			type: Array,
			default: () => []
		}
	});

	// Reactive data
	const treeData = ref([]);

	// Helper function to check if an item has children
	const hasChildren = (item) => item.children && item.children.length;

	// Initialize the expansion state of each node based on defaultCheckedIds
	const initializeExpansionState = (data) => {
		return data.map(item => ({
			...item,
			// Member: {
			// 	...item.Member,
			// 	check: props.defaultCheckedIds.includes(item.Member.id)
			// },
			expanded: props.defaultCheckedIds.includes(item.Member.id),
			children: item.children ? initializeExpansionState(item.children) : null
		}));
	};

	// Methods
	const toggleExpanded = (item) => {
		if (hasChildren(item)) {
			item.expanded = !item.expanded;
		}
	};

	const toggleNode = (item) => {
		// Handle node selection state change
		emit('node-change', item);
	};

	const stopCheck = (event) => {
		// event.stopPropagation();
	};

	// Emits
	const emit = defineEmits(['node-change', 'collect-checked']);
	
	// 监听 props 变化并更新节点状态
	// watch(() => props.defaultCheckedIds, (newIds) => {
	// 	console.log(123456,' bianhua')
	//   initializeExpansionState(props.data);
	// }, { immediate: true });
	
	// Lifecycle hooks
	onMounted(() => {
		treeData.value = initializeExpansionState(props.data);
		console.log(treeData.value, 'props.defaultCheckedIds')
	});

</script>
<style lang="scss" scoped>
	.icon-ra {
		transform: rotate(-90deg);
		transition: all .3s;
	}
</style>