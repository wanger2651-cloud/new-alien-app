<template>
	<view class="nodeChild">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-arrow :safeAreaInsetTop="true"
			title="子账号管理"></wd-navbar>
		<view class="list-container" :style="`padding-top: calc(${systemBarHeight}px + 44px);`">
			<view class="step-a" v-if="step === 1">
				<view class="tips">
					*支持创建子账号可产看门店权限
				</view>
				<view class="step-a-main">
					<view class="step-a-item" @click="showUserList(item)" v-for="item in groupList" :key="item.id">
						<view class="item-left">
							{{ item.Member.name }}
						</view>
						<view class="" style="display: flex;align-items: center;">
							<view style="height: 88rpx;width: 90rpx;display: flex;align-items: center;justify-content: center;" @click.stop="openHandle(item)">
								<wd-icon name="more" size="18px" color="#333333" ></wd-icon>
							</view>
							<image src="@/static/icon/icon-arrow-right.png" class="right-arrow"></image>
						</view>
					</view>
				</view>
			</view>
			<view class="step-b" v-if="step === 2" :style="`height: calc(100vh - ${systemBarHeight}px - 44px);`">
				<view class="filter-container">
					<view class="filter-state">
						账号状态：
					</view>
					<view class="filter-select" @click="openSelect">
						<wd-icon name="caret-down" size="14px" class="select-icon"></wd-icon>
						<view class="filter-state-str">
							{{ adminParams.avtag ? '正常' : '停用' }}
						</view>
					</view>
					<view class="filter-input">
						<wd-search v-model="adminParams.word" light placeholder-left placeholder="请输入账号/手机号/邀请码"
							hide-cancel @search="getAdminList" @clear="getAdminList" maxlength="10" />
					</view>
				</view>
				<view class="user-list" :style="`height: calc(100vh - ${systemBarHeight}px - 44px - 140rpx);`">
					<view class="user-item" v-for="item in adminList" :key="item.id">
						<view class="item-title">
							<view class="title-left">
								{{ item.notes }}
							</view>
							<view class="title-right">
								<wd-icon class="right-icon" name="edit-1" size="32rpx"
									@click="editAdmin(item)"></wd-icon>
								<!-- <wd-icon class="right-icon" name="delete" size="32rpx"
									@click="delAdmin(item)"></wd-icon> -->
							</view>
						</view>
						<view class="item-row" style="border-bottom: 1px solid #F2F2F2;">
							<view class="row-item">
								<view class="row-title">账号：</view>
								<view class="row-main">{{ item.user_name || '-' }}</view>
							</view>
							<view class="row-item">
								<view class="row-title">手机号：</view>
								<view class="row-main">{{ item.phone || '-' }}</view>
							</view>
							<!-- <view class="row-item" style="width: 100%;">
								<view class="row-title">账号ID：</view>
								<view class="row-main">{{ item.id || '-' }}</view>
							</view> -->
							<view class="row-item">
								<view class="row-title">团队ID：</view>
								<view class="row-main">{{ item.team_id || '-' }}</view>
							</view>
							<view class="row-item">
								<view class="row-title">邀请码：</view>
								<view class="row-main">{{ item.code || '-' }}</view>
							</view>
							<view class="row-item">
							<view class="row-title">剩余积分：</view>
							<view class="row-main">{{ Number(item.balance || 0).toFixed(1) }}</view>
							</view>
							<view class="row-item">
								<view class="row-title">MT门店：</view>
								<view class="row-main">{{ item.mt_count }}</view>
							</view>
							<view class="row-item" v-if="canEditMemberPassword">
								<view class="row-title">密码：</view>
								<view class="row-main">{{ getMemberPassword(item) }}</view>
							</view>
							<view class="row-item">
								<view class="row-title">ELM门店：</view>
								<view class="row-main">{{ item.ele_count }}</view>
							</view>
						</view>
						<view class="item-row" style="padding-top: 20rpx;padding-bottom: 0;">
							<view class="row-item"
								style="width: 100%;justify-content: space-between;line-height: 60rpx;">
								<view class="row-title">注册时间：</view>
								<view class="row-main">{{ item.crtim || '-' }}</view>
							</view>
							<view class="row-item"
								style="width: 100%;justify-content: space-between;line-height: 60rpx;">
								<view class="row-title" style="width: 200rpx;">上次登录时间：</view>
								<view class="row-main">{{ item.login_time || '-' }}</view>
							</view>
							<view class="row-item"
								style="width: 100%;justify-content: space-between;line-height: 60rpx;">
								<view class="row-title">账号状态：</view>
								<wd-switch size="16px" v-model="item.avtag" active-color="#FACC05" class="switch-item"
									@change="updateAvtagAgency(item)" />
							</view>
							<view class="row-item"
								style="width: 100%;justify-content: space-between;line-height: 60rpx;">
								<view class="row-title" style="width: 240rpx;"></view>
								<!-- <view class="filter-select" >
									<wd-icon name="caret-down" size="14px" class="select-icon"></wd-icon>
									<view class="filter-state-str filter-state-str2">{{ item.group_name || '未选择' }}</view>
								</view> -->
								<view style="display: flex;gap: 16rpx;align-items: center;">
									<!-- 管理员权限才显示这两个按钮 -->
									<view v-if="isAdmin" class="set-group set-group-small" @click="getMemberGoogleAuth(item)">
										获取验证码
									</view>
									<view v-if="isAdmin" class="set-group set-group-small" @click="resetMemberToken(item)">
										重置令牌
									</view>
									<view class="set-group" @click="editBalance(item)">
										分配积分
									</view>
								</view>
							</view>
						</view>
					</view>
					<wd-status-tip image="content" v-if="adminList.length === 0" tip="暂无内容" />
				</view>
				<wd-pagination v-model.async="adminParams.page" :total="adminTotal"
					:page-size.async="adminParams.pagesize" @change="getAdminList" show-icon></wd-pagination>
			</view>
		</view>
		<view class="btn-item-main">
			<!-- <view class="btn-item btn-item-back" @click="backLevel" v-if="step === 2">
				返回上一级
			</view> -->
			<view class="btn-item" @click="addUser" v-if="step === 2">
				添加子账号
			</view>
			<view style="display: flex;align-items: center;justify-content: space-between;" v-if="step === 1">
				<!-- <view class="btn-item" style="width: 46%;" @click="addUser">
					添加成员
				</view> -->
				<view class="btn-item" @click="rootAddGroup" v-if="step === 1">
					添加子账号分组
				</view>
			</view>
		</view>
		<wd-popup v-model="addUserState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="groupAddUserClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					添加成员
				</view>
				<view class="log-main">
					<view class="msg-container">
						<view class="code-input">
							<view class="item-name">
								手机号
							</view>
							<view class="code-input-main">
								<wd-input v-model="userParams.phone" :no-border="true" placeholder="填写手机号" />
							</view>
						</view>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="groupAddUserClose" block>取消</wd-button>
						<wd-button size="large" class="confirm-group" @click="confirmAddUser" block>添加</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>
		<wd-action-sheet v-model="selectStatus" :actions="stateActions" @select="selectState" />
		<wd-action-sheet v-model="selectGroupState" :actions="groupList.filter(item => item.Member.name !== '全部')"
			class="select-group" @select="selectGroup" style="z-index: 700;" />
		<wd-action-sheet v-model="changeHandleState" :actions="handleStateList"
			class="select-group" @select="selectHandle" style="z-index: 700;" />
		<wd-popup v-model="groupState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="groupClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					{{ groupItem.id ? '编辑子账号分组' : '添加子账号分组' }}
				</view>
				<view class="log-main">
					<view class="msg-container">
						<view class="code-input">
							<view class="item-name">
								分组名称
							</view>
							<view class="code-input-main">
								<wd-input v-model="groupItem.name" :no-border="true" placeholder="填写分组名称" />
							</view>
						</view>
						<view class="code-input">
							<view class="item-name">
								角色描述
							</view>
							<view class="code-input-main code-textarea-main">
								<wd-textarea v-model="groupItem.notes" :no-border="true" placeholder="填写描述" class="" />
							</view>
						</view>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="groupClose" block>取消</wd-button>
						<wd-button size="large" class="confirm-group" @click="confirmGroup" block>保存</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>
		<wd-popup v-model="accountState" v-if="accountState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="closeAccount"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					编辑子账号
				</view>
				<view class="log-main-container">
					<view class="msg-main-container">
						<view class="code-input">
							<view class="item-name">
								账户
							</view>
							<view class="code-input-main">
								<wd-input v-model="currentAccount.user_name" :no-border="true" disabled
									placeholder=" " />
							</view>
						</view>
						<view class="code-input">
							<view class="item-name">
								密码
							</view>
							<view class="code-input-main">
								<wd-input v-model="currentAccount.password" :no-border="true"
									:disabled="!canEditMemberPassword" placeholder="填写子账号密码" />
							</view>
						</view>
						<view class="code-input">
							<view class="item-name">
								备注信息
							</view>
							<view class="code-input-main code-textarea-main">
								<wd-textarea v-model="currentAccount.notes" auto-height :no-border="true"
									placeholder="填写备注" class="" />
							</view>
						</view>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="closeAccount" block>取消</wd-button>
						<wd-button size="large" class="confirm-group" @click="confirmAccount" block>保存</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>
		<wd-popup v-model="shopGroupState" v-if="shopGroupState" custom-style="border-radius: 20rpx 20rpx 0 0;" position="bottom"
			class="shop-group-main" @close="handleCloseShopGroup" :safe-area-inset-bottom="true" :z-index="788">
			<view class="shop-group-container">
				<view class="shop-group-title">
					选择门店分组
				</view>
				<view style="max-height: 500rpx;overflow-y: scroll;">
					<Tree :data="treeData" :defaultCheckedIds="defaultCheckedIds" :node-change="getNodeChange" />
				</view>
				<view class="footer">
					<wd-button type="info" size="large" @click="handleCloseShopGroup" block>取消</wd-button>
					<wd-button size="large" class="confirm-group" @click="confirmShopGroup" block>确认</wd-button>
				</view>
			</view>
		</wd-popup>
		<wd-popup v-model="balanceState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="closeBalance"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					分配积分
				</view>
				<view class="log-main-container">
					<view class="msg-main-container" style="height: 240rpx">
						<view class="code-input">
							<view class="item-name">
								账户
							</view>
							<view class="code-input-main">
								<wd-input v-model="currentAccount.user_name" :no-border="true" disabled
									placeholder=" " />
							</view>
						</view>
						<view class="code-input">
							<view class="item-name">
								分配积分
							</view>
							<view class="code-input-main">
								<wd-input type="number" v-model="currentAccount.balance" :no-border="true"
									placeholder=" " />
							</view>
						</view>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="closeBalance" block>取消</wd-button>
						<wd-button size="large" class="confirm-group" @click="confirmBalance" block>确认</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		reactive,
		watch,
		computed
	} from 'vue';
	import {
		GroupApi
	} from '@/api/group'
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		UserApi
	} from '@/api/login'
	import {
		ShopApi
	} from '@/api/shop';
	import {
		logApi
	} from '@/api/log'
	import request from '@/utils/request'

	const step = ref(1)
	const groupList = ref([])
	const groupState = ref(false)
	const balanceState = ref(false)
	const closeBalance = () => {
		balanceState.value = false
		// 重置分配积分对象和表单
		distributionObj = {}
		currentAccount.value = {}
		currentAccountCopy.value = {}
	}
	const shopGroupState = ref(false)
	const handleCloseShopGroup = () => {
		shopGroupState.value = false
		defaultCheckedIds.value = []
	}
	const treeData = ref([])
	const getGroupList = () => {
		GroupApi.getGroupData({
			grouptype: 1,
			recursionchild: true,
		}).then(res => {
			if (res.code === 200) {
				treeData.value = res.data
			}
		})
	}
	const openShopGroup = () => {
		shopGroupState.value = true
	}
	watch(
		() => ({
			treeData
		}), // 返回一个新对象，确保能监听到内部属性的变化
		(newVal, oldVal) => {
			console.log(132456)
			updateTreeData(newVal.treeData.value)
		}, {
			deep: true
		} // 开启深度监听
	);
	const defaultCheckedIds = ref([])
	const selectedGroupStr = ref('')
	const confirmShopGroup = () => {
		selectedGroupStr.value = ''
		if (selectedGroup.value && selectedGroup.value.length) {
			selectedGroup.value.forEach(item => {
				selectedGroupStr.value += ( item.name + ',')
			})
		}
		selectedGroupStr.value = selectedGroupStr.value.slice(0, -1)
		shopGroupState.value = false
	}
	const openHandle = (item) => {
		currentGroup.value = item
		changeHandleState.value = true
	}
	const changeHandleState = ref(false)
	const handleStateList = ref([
		{
			name: '编辑'
		},{
			name: '删除'
		}
	])
	const selectHandle = (val) => {
		console.log(val)
		if (val.item.name === '编辑') {
			groupState.value = true
			const {id, name, notes} = currentGroup.value.Member
			groupItem.id = id
			groupItem.name = name
			groupItem.notes = notes
		} else {
			uni.showModal({
				title: '确认移除该子账号？', // 弹窗的标题
				content: '移除后不再显示该子账号', // 弹窗的内容
				success: (res) => {
					// 用户点击了哪个按钮
					if (res.confirm) {
						uni.showLoading()
						GroupApi.deleteGroup(currentGroup.value.Member.id).then(res => {
							if (res.code === 200) {
								getShopGroupList()
								uni.showToast({
									title: '删除成功',
									icon: 'success',
									duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
									mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
								});
							}
						}).finally(() => {
							uni.hideLoading()
						})
						// 在这里执行确定后的逻辑
					}
				}
			});
		}
	}
	const selectedIds = ref([]);
	const selectedGroup = ref([])
	const updateTreeData = (data) => {
		selectedIds.value = findCheckedMemberIds(data)
		selectedGroup.value = findCheckedMember(data)
	}
	const findCheckedMember = (membersArray, result = []) => {
		membersArray.forEach(memberObj => {
			const {
				Member,
				children
			} = memberObj;
			if (Member.check === true) {
				result.push(Member);
			}
			if (children && children.length) {
				findCheckedMember(children, result);
			}
		});
		return result;
	}
	const findCheckedMemberIds = (membersArray, result = []) => {
		membersArray.forEach(memberObj => {
			const {
				Member,
				children
			} = memberObj;
			if (Member.check === true) {
				result.push(Member.id);
			}
			if (children && children.length) {
				findCheckedMemberIds(children, result);
			}
		});
		return result;
	}
	const getNodeChange = (item) => {
		console.log(item, 'itemitemtiem123123')
	}
	const getCheckData = () => {

	}
	const changeCheck = (data) => {
		console.log(data, 'datadatadatadatadata')
	}
	let groupItem = reactive({
		name: '',
		notes: ''
	})
	const adminList = ref([])
	const adminTotal = ref(0)
	const adminParams = reactive({
		page: 1,
		pageSize: 10,
		avtag: true,
		groupId: '',
		userType: 1,
		word: ''
	})
	const accountState = ref(false)
	let currentGroup = ref({})
	let currentAccount = ref({})
	const groupChangeList = ref([])
	const shopGroupList = ref([])
	const selectItemGroup = ref([])
	const proupValue = ref('')
	const addUserState = ref(false)
	let userParams = reactive({
		phone: '',
		is_boss: false
	})
	const selectStatus = ref(false)
	const selectGroupState = ref(false)
	
	// 判断是否为管理员
	const isAdmin = ref(false)
	const isMainAccount = ref(false)
	const userInfo = ref(null)
	const canEditMemberPassword = computed(() => isAdmin.value && isMainAccount.value)
	
	// 判断角色是否为管理员
	const isAdminRole = (role) => {
		if (!role || !Array.isArray(role) || role.length === 0) return true
		return role.some(r => {
			if (typeof r === 'string') {
				return r.toLowerCase().includes('admin')
			}
			if (typeof r === 'object' && r?.name) {
				return r.name.toLowerCase().includes('admin')
			}
			return false
		})
	}
	
	// 获取用户信息并判断是否为管理员
	const checkAdminPermission = async () => {
		try {
			const res = await UserApi.getUser()
			if (isSuccessResponse(res) && res.data) {
				userInfo.value = res.data
				const role = res.data.admin?.role || []
				isAdmin.value = isAdminRole(role)
				const admin = res.data?.admin || {}
				const parentId = admin.Parent ?? admin.parent ?? ''
				const isTopByParent = !parentId || parentId === '0' || parentId === '00000000-0000-0000-0000-000000000000'
				const userType = admin.user_type
				const userTypeNum =
					typeof userType === 'number'
						? userType
						: Number(userType?.value ?? userType?.Value ?? userType?.id ?? -1)
				isMainAccount.value = isTopByParent || userTypeNum === 2
			}
		} catch (error) {
			console.error('获取用户信息失败:', error)
			isAdmin.value = false
			isMainAccount.value = false
		}
	}

	const getMemberPassword = (item) => {
		return item?.password || item?.pwd || item?.pass || '-'
	}
	
	// 工具函数：获取用户ID
	const getUserId = (item) => {
		if (!item) return ''
		return item.id ? String(item.id) : ''
	}
	
	// 工具函数：获取用户显示名称
	const getUserDisplayName = (item) => {
		return item?.user_name || item?.phone || '未知'
	}
	
	// 工具函数：显示错误提示
	const showErrorToast = (message, duration = 3000) => {
		uni.showToast({
			title: message,
			icon: 'none',
			duration
		})
	}
	
	// 工具函数：显示成功提示
	const showSuccessToast = (message, duration = 2000) => {
		uni.showToast({
			title: message,
			icon: 'success',
			duration
		})
	}
	
	// 工具函数：获取错误信息
	const getErrorMessage = (error, defaultMsg = '操作失败，请重试') => {
		return error?.response?.data?.message || error?.message || defaultMsg
	}
	
	// 工具函数：检查响应是否成功
	const isSuccessResponse = (res) => {
		return res && (res.code === 200 || res.Success)
	}
	
	// 获取成员的谷歌验证码（6位数验证码）
	const getMemberGoogleAuth = async (item) => {
		const userId = getUserId(item)
		if (!userId) {
			showErrorToast('用户ID不存在', 2000)
			return
		}
		
		uni.showLoading({ title: '获取中...', mask: true })
		
		try {
			const res = await request({
				url: 'Admin/GetUserGoogleAuthCode',
				method: 'POST',
				data: { UserId: userId }
			})
			
			if (isSuccessResponse(res) && res.data) {
				const code = res.data.Code || res.data.code || ''
				if (code) {
					uni.showModal({
						title: '谷歌验证码',
						content: `用户：${getUserDisplayName(item)}\n验证码：${code}`,
						showCancel: false,
						confirmText: '确定'
					})
				} else {
					showErrorToast('获取失败，该用户可能未绑定谷歌验证码')
				}
			} else {
				showErrorToast(res?.message || res?.Msg || '获取失败，该用户可能未绑定谷歌验证码')
			}
		} catch (error) {
			console.error('获取成员谷歌验证码失败:', error)
			showErrorToast(getErrorMessage(error, '获取失败，请重试'))
		} finally {
			uni.hideLoading()
		}
	}
	
	// 重置成员令牌
	const resetMemberToken = async (item) => {
		const userId = getUserId(item)
		if (!userId) {
			showErrorToast('用户ID不存在', 2000)
			return
		}
		
		// 二次确认
		const confirmResult = await new Promise((resolve) => {
			uni.showModal({
				title: '确认重置',
				content: `确定要重置"${getUserDisplayName(item)}"的谷歌验证码令牌吗？重置后用户需要重新绑定。`,
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => resolve(res.confirm),
				fail: () => resolve(false)
			})
		})
		
		if (!confirmResult) return
		
		uni.showLoading({ title: '重置中...', mask: true })
		
		try {
			const res = await request({
				url: 'Admin/ResetGoogleAuthenticator',
				method: 'POST',
				data: { UserId: userId }
			})
			
			if (isSuccessResponse(res)) {
				showSuccessToast('重置成功')
				getAdminList()
			} else {
				showErrorToast(res?.message || res?.Msg || '重置失败')
			}
		} catch (error) {
			console.error('重置成员令牌失败:', error)
			showErrorToast(getErrorMessage(error, '重置失败，请重试'))
		} finally {
			uni.hideLoading()
		}
	}

	onMounted(() => {
		getShopGroupList()
		checkAdminPermission()
	})
	const stateActions = ref([{
			name: '正常',
			value: true
		},
		{
			name: '停用',
			value: false
		}
	])
	const currentAccountCopy = ref([])
	let distributionObj = reactive({})
	const editBalance = (item) => {
		currentAccountCopy.value = item
		const {
			balance,
			...body
		} = item
		currentAccount.value = Object.assign(body, {
			balance: 0
		})
		// 初始化分配积分对象，使用子账号的code字段作为userId（code就是用户在用户表中的ID）
		distributionObj.userId = item.code || ''
		distributionObj.giveVal = ''
		balanceState.value = true
	}
	const confirmBalance = () => {
		// 验证输入的积分数量
		const giveVal = Number(currentAccount.value.balance);
		if (!giveVal || giveVal <= 0) {
			uni.showToast({
				title: '请输入有效的积分数量',
				icon: 'error',
				duration: 2000,
				mask: false
			});
			return
		}
		
		// 获取用户ID（使用子账号的code字段作为userId）
		if (!distributionObj.userId) {
			// 如果distributionObj中没有userId，尝试从currentAccount或currentAccountCopy获取code
			distributionObj.userId = currentAccount.value.code || currentAccountCopy.value.code
		}
		
		if (!distributionObj.userId) {
			uni.showToast({
				title: '用户ID不存在',
				icon: 'error',
				duration: 2000,
				mask: false
			});
			return
		}
		
		// 设置分配积分数量
		distributionObj.giveVal = giveVal
		
		// 执行分配积分操作（子账号管理不需要二次确认）
		doGiveIntegral()
	}
	
	const doGiveIntegral = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		logApi.giveIntegral(distributionObj).then(res => {
			// 检查响应格式，可能 res.code 或 res.Success 或 res.data.code
			const isSuccess = (res.code === 200) || (res.Success === true) || (res.data && res.data.code === 200) || (res.data && res.data.Success === true)
			
			if (isSuccess) {
				closeBalance()
				uni.showToast({
					title: '分配成功',
					icon: 'success',
					duration: 2000,
					mask: false
				});
				// 分配成功后刷新列表
				getAdminList()
			} else {
				const errorMsg = res.message || res.msg || res.Msg || 
				                 (res.data && (res.data.message || res.data.msg || res.data.Msg)) || 
				                 '分配失败'
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 2000,
					mask: false
				});
			}
		}).catch(err => {
			console.error('分配积分失败:', err)
			// 从多个可能的位置获取错误信息
			const errorMsg = err.message || err.msg || err.Msg || 
			                 (err.data && (err.data.message || err.data.msg || err.data.Msg)) || 
			                 (err.response && err.response.data && (err.response.data.message || err.response.data.msg || err.response.data.Msg)) ||
			                 '分配失败，请重试'
			uni.showToast({
				title: errorMsg,
				icon: 'none',
				duration: 2000,
				mask: false
			});
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const selectState = ({
		item,
		index
	}) => {
		adminParams.avtag = item.value
		getAdminList()
	}
	const selectGroupItem = ref({})
	const selectGroup = ({
		item,
		index
	}) => {
		console.log(item, index)
		selectGroupItem.value = item
		currentAccount.value.group = item.Member.id
	}
	const openSelectGroup = (item) => {
		selectGroupState.value = true
	}
	const openSelect = () => {
		selectStatus.value = true
	}
	const searchAdmin = () => {
		getAdminList()
	}
	const confirmAddUser = () => {
		UserApi.addUser(userParams).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '添加成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
				addUserState.value = false
				userParams = {
					phone: '',
					is_boss: false
				}
				getAdminList()
			}
		})
	}
	const addUser = () => {
		addUserState.value = true
		userParams = {
			phone: '',
			is_boss: false
		}
	}
	const groupAddUserClose = () => {
		addUserState.value = false
	}
	const selectItem = (item, _item) => {
		_item.check = !_item.check
		let hasCheck = item.children.filter(obj => obj.check === true)
		if (hasCheck.length === item.children.length) {
			item.check = true
		}
	}
	const allSelect = (item) => {
		item.children.forEach(_item => {
			_item.check = item.check
		})
	}
	const stopClick = (e) => {
		e.stopPropagation();
	}
	const editAdmin = (item) => {
		console.log(item, 'item')
		currentAccount.value = JSON.parse(JSON.stringify(item))
		accountState.value = true
		if (item.shop_groups) {
			// defaultCheckedIds.value = JSON.parse(currentAccount.value.shop_groups) // 回显，暂时
			selectedGroup.value = findMembersByIds(treeData.value, JSON.parse(item.shop_groups))
			if (selectedGroup.value && selectedGroup.value.length) {
				confirmShopGroup()
			}
		} else {
			selectedGroupStr.value = ''
		}
	}
	const findMembersByIds = (data, ids) => {
	  const result = [];
	  function searchMembers(node) {
	    if (!node) return;
	    if (ids.includes(node.Member.id)) {
	      result.push(node.Member);
	    }
	    if (node.children && node.children.length > 0) {
	      node.children.forEach(child => searchMembers(child));
	    }
	  }
	  data.forEach(item => searchMembers(item));
	  return result;
	}
	const delAdmin = (item) => {
		// 调用 uni.showModal 方法
		uni.showModal({
			title: '确认移除该子账号？', // 弹窗的标题
			content: '移除后不再显示该子账号', // 弹窗的内容
			success: (res) => {
				// 用户点击了哪个按钮
				if (res.confirm) {
					GroupApi.adminRemoveGroup({
						groupId: currentGroup.value.Member.id,
						adminIds: [item.id]
					}).then(res => {
						if (res.code === 200) {
							getAdminList()
							uni.showToast({
								title: '删除成功',
								icon: 'success',
								duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
								mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
							});
						}
					})
					// 在这里执行确定后的逻辑
				} else if (res.cancel) {
					console.log('用户点击了取消');
					// 在这里执行取消后的逻辑
				}
			},
			fail: function() {
				console.log('调用失败');
			}
		});
	}
	const updateAvtagAgency = (item) => {
		uni.showLoading()
		GroupApi.updateAgency({
			id: item.id,
			avtag: item.avtag
		}).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '修改成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			} else {
				item.avtag = !item.avtag
			}
		}).catch(() => {
			item.avtag = !item.avtag
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const confirmAccount = async () => {
		uni.showLoading()
		const {
			id,
			notes,
			password
		} = currentAccount.value
		try {
			const updatePayload = {
				id: id,
				notes: notes
			}
			// 仅总账号管理员可编辑密码
			if (canEditMemberPassword.value && password !== undefined && password !== null) {
				updatePayload.password = String(password)
			}
			await GroupApi.updateAgency(updatePayload)
			getAdminList()
		} finally {
			uni.hideLoading()
			accountState.value = false
		}
	}
	const closeAccount = () => {
		accountState.value = false
	}
	const confirmGroup = () => {
		if (!groupItem.name) {
			return uni.showToast({
				title: '请填写分组名称',
				icon: 'error',
				duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
				mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
			});
		}
		const {id, name, notes} = groupItem
		if (id) {
			uni.showLoading()
			GroupApi.editGroup({
				id,
				name,
				notes
			}).then(res => {
				if (res.code === 200) {
					getShopGroupList()
					groupClose()
					return uni.showToast({
						title: '修改成功',
						icon: 'success',
						duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
						mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
					});
				}
			}).finally(() => {
				uni.hideLoading({})
			})
		} else {
			uni.showLoading()
			GroupApi.addGroup({
				name,
				notes,
				type: 2
			}).then(res => {
				if (res.code === 200) {
					getShopGroupList()
					groupClose()
					return uni.showToast({
						title: '添加成功',
						icon: 'success',
						duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
						mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
					});
				}
			}).finally(() => {
				uni.hideLoading({})
			})
		}
	}
	const groupClose = () => {
		groupState.value = false
		currentAccount.value = {}
	}
	const rootAdd = () => {}
	const rootAddGroup = () => {
		groupItem = {
			name: '',
			notes: ''
		}
		groupState.value = true
	}
	const groupListCopy = ref([])
	const getShopGroupList = (parent) => {
		uni.showLoading()
		GroupApi.getGroupData({
			grouptype: 2,
			recursionchild: true,
		}).then(res => {
			if (res.code === 200) {
				groupList.value = res.data
				groupListCopy.value = JSON.parse(JSON.stringify(res.data))
				groupList.value.unshift({
					Member: {
						id: null,
						name: '全部'
					},
					children: null
				})
				groupList.value.forEach(item => {
					item.name = item.Member.name
				})
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}

	const handleClickLeft = () => {
		if (step.value === 2) {
			// 如果是在成员详情页，返回成员列表
			step.value = 1
		} else {
			// 直接返回上一页，避免跳转到错误的页面
			uni.navigateBack()
		}
	}
	const getAdminList = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		GroupApi.getAdminList(adminParams).then(res => {
			if (res.code === 200) {
				adminList.value = res.data.rows
				adminTotal.value = res.data.total
				step.value = 2
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const showUserList = (item) => {
		currentGroup.value = item
		adminParams.groupId = item.Member.id
		getAdminList()
	}
	const backLevel = () => {
		step.value = 1
	}
	const systemBarHeight = ref(0)
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const isV2 = ref(false)
	onLoad((options) => {
		getGroupList()
		getSysteminfo()
		if (options && options.isV2) {
			isV2.value = JSON.parse(options.isV2)
		}
	})
</script>

<style scoped lang="scss">
	.list-container {
		width: 100%;
		background-color: #F9F9F9;
		min-height: 100vh;
		box-sizing: border-box;

		.tips {
			width: 100%;
			box-sizing: border-box;
			padding: 0 30rpx;
			font-weight: 400;
			font-size: 26rpx;
			color: #999999;
			line-height: 37rpx;
			text-align: left;
			font-style: normal;
			line-height: 60rpx;
			margin-bottom: 10rpx;
		}

		.step-a-main {
			width: 100%;
			box-sizing: border-box;
			background-color: #ffffff;
			padding: 0 30rpx;

			.step-a-item {
				width: 100%;
				height: 90rpx;
				border-bottom: 1px solid #DFDFDF;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.item-left {
					font-weight: 400;
					font-size: 28rpx;
					color: #333333;
					text-align: left;
					font-style: normal;
				}

				.right-arrow {
					width: 34rpx;
					height: 34rpx;
				}
			}

			.step-a-item:last-child {
				border-bottom: none;
			}
		}

		.step-b {
			width: 100%;
			box-sizing: border-box;
			padding: 20rpx 30rpx;
		}

		.user-list {
			overflow-y: auto;
			padding-bottom: 120rpx;
			box-sizing: border-box;

			.user-item {
				width: 100%;
				box-sizing: border-box;
				background: #FFFFFF;
				border-radius: 14rpx;
				padding: 30rpx;
				margin-bottom: 20rpx;

				.item-title {
					display: flex;
					align-items: center;
					justify-content: space-between;
					border-bottom: 1px solid #F2F2F2;
					padding-bottom: 20rpx;
					margin-bottom: 20rpx;

					.title-left {
						font-weight: 500;
						font-size: 36rpx;
						color: #333333;
						text-align: left;
						font-style: normal;
					}

					.title-right {
						.right-icon {
							margin-left: 40rpx;
						}
					}
				}

				.item-row {
					display: flex;
					align-items: center;
					flex-wrap: wrap;
					justify-content: space-between;
					padding-bottom: 20rpx;

					.row-item {
						display: flex;
						align-items: center;
						width: 48%;
						line-height: 1.4;

						.row-title {
							// width: 135rpx;
							font-size: 26rpx;
							color: #999999;
						}

						.row-main {
							color: #666666;
							font-size: 26rpx;
						}
					}
				}
			}

			.user-item:last-child {
				margin-bottom: 0;
			}
		}
	}

	.btn-item {
		width: 100%;
		height: 80rpx;
		background: #FACC05;
		border-radius: 14rpx;
		border: 1px solid #FACC05;
		text-align: center;
		font-weight: 400;
		font-size: 30rpx;
		color: #333;
		line-height: 80rpx;
		margin-bottom: 30rpx;
	}

	.btn-item-main {
		position: fixed;
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 30rpx env(safe-area-inset-bottom) 30rpx;
		left: 0;
		// bottom: calc(env(safe-area-inset-bottom) + 15px);
		bottom: 0;
		background-color: #f9f9f9;

		.btn-item {
			background: #FACC05;
			color: #333;
		}

		.btn-item-back {
			background-color: #ffffff;
			color: #F81C3A;
		}
	}

	.footer {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 40rpx;
	}

	.log-title {
		font-size: 36rpx;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.code-input {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;

		.item-name {
			width: 140rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #666666;
			text-align: left;
			line-height: 80rpx;
		}

		.code-input-main {
			width: calc(100% - 140rpx);
			height: 80rpx;
			background: #FFFFFF;
			border-radius: 14rpx;
			border: 1px solid #DFDFDF;
			box-sizing: border-box;
			padding-left: 20rpx;
			display: flex;
			align-items: center;
		}

		.code-textarea-main {
			display: block;
			min-height: 80rpx;
			line-height: 80rpx;
			height: auto;

			::v-deep .wd-textarea {
				padding: 14rpx 0;
			}

			.caret-up {
				position: absolute;
				top: 50%;
				transform: translateY(-50%) rotate(360deg);
				right: 10rpx;
				transition: all .3s;
			}

			.is-caret-up {
				transform: translateY(-50%) rotate(180deg);
				transition: all .3s;
			}
		}
	}

	.confirm-group {
		background-color: #FACC05 !important;
		color: #333 !important;
	}

	.msg-main-container {
		height: 380rpx;
		overflow-y: auto;
	}

	.code-input-other {
		display: block;
	}

	::v-deep .wd-collapse-item__body {
		padding-top: 0;
	}

	.filter-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;

		.filter-state {
			font-size: 28rpx;
			color: #333333;
		}

		.filter-input {
			width: calc(100% - 280rpx);
		}
	}

	.filter-select {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		// border: 1px solid #DFDFDF;
		border-radius: 8rpx;
		height: 60rpx;
		line-height: 60rpx;

		.filter-state-str {
			font-size: 28rpx;
			color: #333333;
		}

		.filter-state-str2 {
			font-size: 26rpx;
		}
	}

	::v-deep .wd-search.is-light {
		background: transparent;
	}

	::v-deep .wd-search {
		padding: 0;
	}

	::v-deep .wd-search.is-without-cancel {
		padding: 0;
	}

	.set-group {
		height: 60rpx;
		background: #FACC05;
		border-radius: 8rpx;
		font-size: 26rpx;
		color: #333333;
		text-align: center;
		line-height: 60rpx;
		margin-top: 20rpx;
		width: 140rpx;
	}
	
	.set-group-small {
		width: 120rpx;
		font-size: 24rpx;
	}

	::v-deep .select-group {

		.wd-transition,
		.wd-popup {
			z-index: 701 !important;
		}
	}

	.shop-group-container {
		width: 100%;
		box-sizing: border-box;
		padding: 0 60rpx 100rpx;
	}

	.shop-group-title {
		font-size: 17px;
		font-weight: 500;
		height: 54px;
		line-height: 54px;
		text-align: center;
		color: #333;
	}
</style>