<script setup>
	import {
		ManagementApi
	} from '@/api/management.ts'
	import {
		FunctionPriceApi
	} from '@/api/functionPrice.ts'
	import {
		getRenewQuoteList,
		getRenewChannels,
		createPayOrder,
		queryPayOrderStatus
	} from '@/api/pay'
	import {
		finishOrderAfterCreate,
		openExternalPayLink,
		hasPayLink,
		mapPayQuoteToSpecRow
	} from '@/utils/payRenewFlow'
	const props = defineProps(['currentClickCardId', "isFullPopupPlan", 'authGoodsList', 'shopId', 'priceTitle', 'isV2',
		'shopType', 'isIMKefuRenew', 'currentFuncCode'
	])
	const emits = defineEmits(['closePopup', 'setEndtime', 'success', 'updataShopFunc'])
	import {
		ref,
		computed,
		onMounted,
		watch
	} from 'vue';
	import {
		onShow
	} from "@dcloudio/uni-app";
	const curPlan = ref(0)
	const currentCost = ref(0)
	const currentId = ref('')
	/** Pay 模块支付渠道 */
	const renewChannels = ref([])
	const selectedChannelId = ref('')
	const renewChannelsLoading = ref(false)

	/**
	 * 父组件传入的规格可能是旧结构或 Pay 结构，统一归一化。
	 */
	const normalizeSpecRow = (item) => {
		if (!item) {
			return null
		}
		const fid = item.function_price_id
		const pid = item.price_id
		if (fid && !pid) {
			return {
				...item,
				price_id: fid,
				cost: item.price ?? item.cost ?? 0,
				add_time: item.add_days ?? item.add_time ?? 0,
				func_name: item.title ?? item.func_name,
				pricetitle: item.title ?? item.pricetitle
			}
		}
		return item
	}

	const loadRenewChannels = async () => {
		renewChannelsLoading.value = true
		try {
			const list = await getRenewChannels()
			renewChannels.value = Array.isArray(list) ? list : []
			if (!selectedChannelId.value && renewChannels.value.length > 0) {
				selectedChannelId.value = renewChannels.value[0].channel_id
			} else if (
				selectedChannelId.value &&
				!renewChannels.value.some((c) => c.channel_id === selectedChannelId.value)
			) {
				selectedChannelId.value = renewChannels.value[0]?.channel_id || ''
			}
		} catch (e) {
			renewChannels.value = []
		} finally {
			renewChannelsLoading.value = false
		}
	}

	const selectRenewChannel = (c) => {
		selectedChannelId.value = c.channel_id
	}

	/**
	 * 支付成功后拉取店铺详情，向父组件同步功能到期（结构接近旧 PayForShopFunc 的 FuncInfo）。
	 */
	const emitShopFuncRefresh = async () => {
		const res = await ManagementApi.getShopDetail(props.shopId)
		const d = res.data || res.Data
		if (!d || typeof d !== 'object') {
			return
		}
		const shop = d
		const raw = shop.func_enable || shop.FuncEnable
		if (!Array.isArray(raw) || raw.length === 0) {
			return
		}
		const funcInfo = raw.map((f) => ({
			code: f.code || f.Code,
			NewEndTime: f.end_time || f.EndTime || f.endTime,
			enable: f.enable !== false,
			FuncName: f.name || f.func_name || f.FuncName || ''
		}))
		emits('updataShopFunc', funcInfo)
		const firstEnd = funcInfo[0]?.NewEndTime
		if (firstEnd) {
			emits('setEndtime', firstEnd)
		}
	}
	// 获取商品信息
	// TODO 月度高级版（8个功能）·30天·30积分  积分需要改成点数
	
	// 激活类型：'single' 单功能激活，'full' 全功能激活
	// 默认使用单功能激活；是否切换为全功能由后续 watch(props.isFullPopupPlan) 决定
	const activateType = ref('single')
	
	// 选中的功能代码（单功能激活时使用），默认选中多开功能
	const selectedFuncCode = ref('MULTIOPEN')
	
	// 功能列表（根据店铺类型获取支持的功能）
	const funcList = ref([])
	
	// 功能映射表（功能代码 -> 显示信息）
	// 注意：功能代码需要与后端返回的code匹配（如ZDCC、IMZDHF、ZDHP、ZDTG、PJSS等）
	const funcInfoMap = {
		// 多开功能（前端自定义功能代码，不依赖后端code）
		'MULTIOPEN': { code: 'MULTIOPEN', name: '多开功能', desc: '店铺多开管理，授权店铺数据有效期内不会被系统定时清除，并显示实时营业收入和订单。', icon: '../static/shop/icon_032a.png' },
		'ZDCC': { code: 'ZDCC', name: '出餐', desc: '提高出餐及时率', icon: '../static/shop/setting10.png' },
		'IMZDHF': { code: 'IMZDHF', name: '回复', desc: '消息自动回复', icon: '../static/shop/setting11.png' },
		'ZDHP': { code: 'ZDHP', name: '回评', desc: '自动回复好评差评', icon: '../static/shop/setting12.png' },
		'ZDTG': { code: 'ZDTG', name: '点金', desc: 'AI智能推广', icon: '../static/shop/setting13.png' },
		'PJSS': { code: 'PJSS', name: '评价申诉', desc: '评价申诉功能', icon: '../static/shop/setting13.png' },
		'CHATPUSH': { code: 'CHATPUSH', name: '微信推送', desc: '微信推送服务', icon: '../static/shop/icon_051a.png' },
		'KEFU': { code: 'KEFU', name: 'IM聚合客服', desc: 'IM聚合客服功能', icon: '../static/shop/setting11.png' },
		// 兼容其他可能的代码格式
		'CC': { code: 'CC', name: '出餐', desc: '提高出餐及时率', icon: '../static/shop/setting10.png' },
		'IM': { code: 'IM', name: '回复', desc: '消息自动回复', icon: '../static/shop/setting11.png' },
		'HP': { code: 'HP', name: '回评', desc: '自动回复好评差评', icon: '../static/shop/setting12.png' },
		'ZDJ': { code: 'ZDJ', name: '点金', desc: 'AI智能推广', icon: '../static/shop/setting13.png' }
	}
	
	// 根据店铺类型获取功能列表
	const getFuncList = async () => {
		if (!props.shopType) return
		
		const shopTypeNum = Number(props.shopType)
		// 京东团购（10 或 1001）和美团团购（9 或 1000）不调用后端接口，直接返回
		if (shopTypeNum === 9 || shopTypeNum === 10 || shopTypeNum === 1000 || shopTypeNum === 1001) {
			return
		}
		
		try {
			const res = await FunctionPriceApi.getFuncList(props.shopType)
			if (res.code === 200 || res.Success) {
				// 获取功能列表，并根据功能代码过滤显示的功能
				const allFuncs = res.data || res.Data || []
				funcList.value = allFuncs
			}
		} catch (err) {
			// 获取功能列表失败
		}
	}
	
	// 功能显示顺序（从左到右），多开功能放在第一个
	const funcDisplayOrder = ['MULTIOPEN', 'ZDCC', 'IMZDHF', 'ZDHP', 'ZDTG', 'PJSS']
	const isTbTakeout = computed(() => Number(props.shopType) === 2)
	
	// 部分平台（美团闪购3、美团医药4、淘宝闪购零售5、京东秒送6、抖音即时零售7）单功能选项宽度改为一半
	const isHalfWidthFuncOption = computed(() => {
		const shopTypeNum = Number(props.shopType)
		return [3, 4, 5, 6, 7].includes(shopTypeNum)
	})
	
	// 获取支持的功能显示信息（根据功能代码匹配，并按指定顺序排序）
	const getSupportedFuncs = computed(() => {
		let supportedFuncs = []
		
		const shopTypeNum = Number(props.shopType)
		// 京东团购（10 或 1001）：仅展示“开通团购服务”和“关联餐饮商品”两个选项
		if (shopTypeNum === 10 || shopTypeNum === 1001) {
			return [
				{ code: 'JD_GROUP_OPEN', name: '开通团购服务' },
				{ code: 'JD_GROUP_BIND', name: '关联餐饮商品' }
			]
		}
		
		// 根据店铺类型选择对应的功能显示顺序
		// 淘宝闪购外卖：移除“自动回评(ZDHP)”
		const baseDisplayOrder = funcDisplayOrder
		const displayOrder = isTbTakeout.value ? baseDisplayOrder.filter(code => code !== 'ZDHP') : baseDisplayOrder
		
		if (!funcList.value || funcList.value.length === 0) {
			// 如果没有获取到功能列表，返回默认功能（兼容旧逻辑）
			supportedFuncs = Object.values(funcInfoMap).filter(item => displayOrder.includes(item.code))
		} else {
			// 根据功能列表中的代码匹配功能信息
			funcList.value.forEach(func => {
				// 通过功能代码匹配
				const funcCode = func.code || ''
				
				// 直接通过代码匹配（只保留在 displayOrder 中的功能，
				// 避免在店铺管理里显示 IM 聚合客服、微信推送等其他功能）
				if (funcInfoMap[funcCode] && displayOrder.includes(funcInfoMap[funcCode].code)) {
					supportedFuncs.push(funcInfoMap[funcCode])
				} else {
					// 如果直接匹配失败，尝试通过名称匹配
					const funcName = func.name || ''
					for (const [code, info] of Object.entries(funcInfoMap)) {
						// 只匹配需要在店铺管理中展示的功能
						if (displayOrder.includes(info.code) && (funcName.includes(info.name) || info.name.includes(funcName))) {
							if (!supportedFuncs.find(f => f.code === info.code)) {
								supportedFuncs.push(info)
							}
							break
						}
					}
				}
			})
		}
		
		// 确保多开功能始终在列表中且排在第一个
		const multiInfo = funcInfoMap['MULTIOPEN']
		if (multiInfo && !supportedFuncs.find(f => f.code === 'MULTIOPEN')) {
			supportedFuncs.unshift(multiInfo)
		}
		
		supportedFuncs.sort((a, b) => {
			const indexA = displayOrder.indexOf(a.code)
			const indexB = displayOrder.indexOf(b.code)
			// 如果不在顺序列表中，排在后面
			if (indexA === -1) return 1
			if (indexB === -1) return -1
			return indexA - indexB
		})
		
		return supportedFuncs
	})
	
	// 第一行的四个功能：多开、出餐、回复、回评
	const firstRowFuncs = computed(() => {
		return getSupportedFuncs.value.filter(func => 
			['MULTIOPEN', 'ZDCC', 'IMZDHF', 'ZDHP'].includes(func.code)
		)
	})
	
	// 其他功能（除了第一行的四个）
	const otherFuncs = computed(() => {
		return getSupportedFuncs.value.filter(func => 
			!['MULTIOPEN', 'ZDCC', 'IMZDHF', 'ZDHP'].includes(func.code)
		)
	})
	
	// 功能代码到功能名称的映射（用于API查询）
	const funcCodeToNameMap = {
		// 多开功能使用全功能多开规格名称
		'MULTIOPEN': '全功能|店铺多开',
		'ZDCC': '自动出餐',
		'IMZDHF': 'IM自动回复',
		'ZDHP': '自动回评',
		'ZDTG': '智能推广',
		'PJSS': '评价申诉',
		'CHATPUSH': '微信推送',
		'KEFU': 'IM客服',
	}
	
	// 功能服务介绍数据（每个功能对应的服务介绍卡片）
	const funcServiceIntroMap = {
		'MULTIOPEN': [
			{  desc: '有效期内不会被系统定时清除，并显示实时营业收入和订单。' },
		],
		'ZDCC': [
			{  desc: '实时订单状态,定时自动出餐避免漏单,提升出餐效率。' },
		],
		'IMZDHF': [
		{  desc: '自定义回复话术,24小时在线自动回复,提升回复率。' },
		],
		'ZDHP': [
		{ desc: '顾客评价智能回复，内置多种回复模板灵活应对。' },
		],
		'ZDTG': [
			{ desc: '自定义设置点金推广策略，高峰期提高出价，抢占流量。' },
		],
		'PJSS': [
		{  desc: '自动向平台申诉不合理的中评和差评，帮助店铺维护评分。' },
		],
		'CHATPUSH': [
		{  desc:'将店铺经营数据推送到微信，方便查看店铺运营情况。' },
		],
		'KEFU': [
		{  desc:'不同平台店铺的顾客消息，聚合客服工作台显示并统一进行回复' },
		],
	}
	
	// 全功能激活时需要展示的功能代码（不包含评价申诉）
	const fullFuncCodes = ['ZDCC', 'IMZDHF', 'ZDHP', 'ZDTG']
	// 全功能激活时展示的功能列表（用于还原旧样式的卡片）
	const fullFuncsForIntro = computed(() => {
		const shopTypeNum = Number(props.shopType)
		// 京东秒送（shopType=6）不展示点金卡片；淘宝闪购外卖（shopType=2）移除回评
		let codesForThisShop = shopTypeNum === 6 ? ['ZDCC', 'IMZDHF', 'ZDHP'] : [...fullFuncCodes]
		if (shopTypeNum === 2) {
			codesForThisShop = codesForThisShop.filter(code => code !== 'ZDHP')
		}
		return getSupportedFuncs.value.filter(func =>
			codesForThisShop.includes(func.code)
		)
	})
	
	// 获取当前选中功能的服务介绍（仅单功能激活时使用）
	const getCurrentFuncServiceIntro = computed(() => {
		// 只在单功能激活时显示功能介绍
		if (activateType.value !== 'single') {
			return []
		}
		
		// 如果没有选中功能，不显示介绍
		if (!selectedFuncCode.value) {
			return []
		}
		
		// 单功能激活时，显示选中功能的服务介绍
		const introList = funcServiceIntroMap[selectedFuncCode.value] || []
		if (introList.length > 0) {
			// 如果有服务介绍数据，使用服务介绍数据
			return introList.map(item => ({
				title: item.title,
				desc: item.desc
			}))
		} else {
			// 如果没有服务介绍数据，显示功能基本信息
			const funcInfo = funcInfoMap[selectedFuncCode.value]
			if (funcInfo) {
				return [{
					title: funcInfo.name,
					desc: funcInfo.desc
				}]
			}
		}
		
		return []
	})
	
	// 根据店铺类型获取默认选中的功能代码
	const getDefaultFuncCode = () => {
		const shopTypeNum = Number(props.shopType)
		// 京东团购：默认选中"开通团购服务"
		if (shopTypeNum === 10 || shopTypeNum === 1001) {
			return 'JD_GROUP_OPEN'
		}
		// 其他店铺类型：默认选中多开功能
		return 'MULTIOPEN'
	}
	
	// 选择激活类型
	const selectActivateType = (type) => {
		activateType.value = type
		
		// 如果是全功能激活，立即获取规格
		if (type === 'full') {
			selectedFuncCode.value = ''
			loadSpecs('full')
		} else {
			// 如果是单功能激活，根据店铺类型设置默认选中的功能并加载规格
			const defaultFuncCode = getDefaultFuncCode()
			selectedFuncCode.value = defaultFuncCode
			loadSpecs('single', defaultFuncCode)
		}
	}
	
	// 选择功能（单功能激活时）
	const selectFunc = async (funcCode) => {
		if (activateType.value !== 'single') return
		
		selectedFuncCode.value = funcCode
		
		// 获取该功能的规格
		await loadSpecs('single', funcCode)
	}
	
	// 内部规格列表
	const internalPayList = ref([])
	// 规格加载状态（用于避免高度闪烁）
	const isSpecLoading = ref(false)
	const loadSpecs = async (type, funcCode = '') => {
		if (!props.shopType) return
		
		try {
			isSpecLoading.value = true
			let priceTitle = ''
			let isKeyWord = false
			
			// 将前端 shopType（可能是 9/10）映射为后端 API 需要的类型（1000/1001）
			const rawShopType = Number(props.shopType)
			const apiShopType = rawShopType === 9 ? 1000 : (rawShopType === 10 ? 1001 : rawShopType)
			
			// 京东团购（1001）特殊处理：按选择的功能加载对应规格
			if (apiShopType === 1001) {
				if (type === 'single' && funcCode) {
					let title = ''
					if (funcCode === 'JD_GROUP_OPEN') {
						title = '开通团购服务'
					} else if (funcCode === 'JD_GROUP_BIND') {
						title = '关联餐饮商品'
					} else {
						internalPayList.value = []
						return
					}
					
					const quotes = await getRenewQuoteList(apiShopType, title, true)
					if (quotes && quotes.length > 0) {
						internalPayList.value = quotes.map(mapPayQuoteToSpecRow)
					} else {
						internalPayList.value = []
					}
					if (internalPayList.value.length > 0) {
						curPlan.value = 0
						const firstItem = internalPayList.value[0]
						currentCost.value = firstItem.cost || 0
						currentId.value = firstItem.price_id || ''
					} else {
						curPlan.value = 0
						currentCost.value = 0
						currentId.value = ''
						uni.showToast({
							title: '未获取到可用规格',
							icon: 'none'
						})
					}
					return
				}
				
				// 其他情况暂不加载规格
				internalPayList.value = []
				return
			}
			
			// 其他平台按原逻辑处理
			if (type === 'full') {
				// 全功能激活：仍然使用全功能多开规格名称（关键词模式）
				priceTitle = '全功能|店铺多开_月'
				isKeyWord = true
			} else if (type === 'single' && funcCode) {
				// 单功能激活
				if (funcCode === 'MULTIOPEN') {
					// 多开功能：使用与以前全功能多开相同的规格名称，并开启关键词模式，保证能匹配到原有规格
					priceTitle = '全功能|店铺多开_月'
					isKeyWord = true
				} else {
					// 使用功能名称+_月，不使用关键词模式
					const funcName = funcCodeToNameMap[funcCode] || funcCode
					priceTitle = funcName + '_月'
					isKeyWord = false
				}
			} else {
				uni.hideLoading()
				return
			}
			
			const quotes = await getRenewQuoteList(apiShopType, priceTitle, isKeyWord)
			if (!quotes || quotes.length === 0) {
				internalPayList.value = []
			} else {
				internalPayList.value = quotes.map(mapPayQuoteToSpecRow)
			}

			// 需要在全功能激活时去除多开规格的店铺类型：1=美团餐饮, 2=淘宝闪购外卖, 6=京东秒送
			const needRemoveMultiOpenInFull = [1, 2, 6].includes(apiShopType)

			// 全功能激活：去除多开相关规格
			if (type === 'full' && needRemoveMultiOpenInFull) {
				internalPayList.value = internalPayList.value.filter(item => {
					const name = item.func_name || item.name || item.pricetitle || ''
					return !(name && name.indexOf('店铺多开') !== -1)
				})
			}

			// 单功能多开：只保留多开相关规格（避免把"全功能"续费也带出来）
			if (type === 'single' && funcCode === 'MULTIOPEN') {
				internalPayList.value = internalPayList.value.filter(item => {
					const name = item.func_name || item.name || item.pricetitle || ''
					return name && name.indexOf('店铺多开') !== -1
				})
			}

			if (internalPayList.value.length > 0) {
				curPlan.value = 0
				const firstItem = internalPayList.value[0]
				currentCost.value = firstItem.cost || 0
				currentId.value = firstItem.price_id || ''
			} else {
				uni.showToast({
					title: '未获取到可用规格',
					icon: 'none'
				})
			}
		} catch (err) {
			console.error('加载规格失败:', err)
			internalPayList.value = []
			uni.showToast({
				title: err.message || '获取规格失败，请重试',
				icon: 'none'
			})
		} finally {
			isSpecLoading.value = false
			uni.hideLoading()
		}
	}

	// 判断是否为推送服务
	const isPushService = computed(() => {
		return props.priceTitle && (props.priceTitle.includes('推送') || props.priceTitle.includes('推送服务'))
	})
	
	// 判断是否为特殊续费类型（微信推送或IM聚合客服）
	const isSpecialRenew = computed(() => {
		return isPushService.value || props.isIMKefuRenew
	})
	
	// 获取特殊续费类型的功能代码
	const getSpecialRenewFuncCode = () => {
		if (isPushService.value) return 'CHATPUSH'
		if (props.isIMKefuRenew) return 'KEFU'
		return ''
	}
	
	// 初始化特殊续费类型的规格数据（公共方法）
	const initSpecialRenewSpecs = (funcCode) => {
		activateType.value = 'single'
		selectedFuncCode.value = funcCode
		
		// 直接使用传入的规格数据
		if (props.authGoodsList && Array.isArray(props.authGoodsList) && props.authGoodsList.length > 0) {
			internalPayList.value = props.authGoodsList.map((x) => normalizeSpecRow(x)).filter(Boolean)
			curPlan.value = 0
			const firstItem = internalPayList.value[0]
			currentCost.value = firstItem.cost || 0
			currentId.value = firstItem.price_id || ''
		} else if (funcCode === 'CHATPUSH') {
			// 微信推送如果没有传入数据，则调用 API 加载
			loadSpecs('single', 'CHATPUSH')
		}
	}
	
	// 处理规格列表（使用内部 internalPayList；价格以 Pay 报价为准）
	const processedGoodsList = computed(() => {
		if (!internalPayList.value || internalPayList.value.length === 0) {
			return []
		}
		return internalPayList.value
	})

	const currentItem = computed(() => {
		if (!processedGoodsList.value || processedGoodsList.value.length === 0) {
			return null
		}
		// 确保索引有效
		const index = (curPlan.value >= 0 && curPlan.value < processedGoodsList.value.length) ? curPlan.value : 0
		return processedGoodsList.value[index] || processedGoodsList.value[0] || null
	})
	
	// 监听店铺类型变化，重新获取功能列表
	watch(() => props.shopType, (newType) => {
		if (newType) {
			const shopTypeNum = Number(newType)
			// 京东团购（10 或 1001）和美团团购（9 或 1000）不调用后端接口
			if (shopTypeNum === 9 || shopTypeNum === 10 || shopTypeNum === 1000 || shopTypeNum === 1001) {
				return
			}
			getFuncList()
		}
	}, { immediate: true })
	
	// 监听 priceTitle 变化，如果是特殊续费类型，使用传入的规格数据
	watch(() => props.priceTitle, (newTitle) => {
		if (newTitle && isSpecialRenew.value) {
			const funcCode = getSpecialRenewFuncCode()
			if (funcCode) {
				initSpecialRenewSpecs(funcCode)
			}
		}
	})
	
	// 监听 authGoodsList 变化，如果是特殊续费类型，更新规格列表
	watch(() => props.authGoodsList, (newList) => {
		if (isSpecialRenew.value && newList && Array.isArray(newList) && newList.length > 0) {
			internalPayList.value = newList.map((x) => normalizeSpecRow(x)).filter(Boolean)
			if (curPlan.value >= internalPayList.value.length) {
				curPlan.value = 0
			}
			const cur = internalPayList.value[curPlan.value] || internalPayList.value[0]
			if (cur) {
				currentCost.value = cur.cost || 0
				currentId.value = cur.price_id || ''
			}
		}
	}, { immediate: true })
	
	// 监听 currentFuncCode 变化，如果是续费操作，重新初始化规格
	watch(() => props.currentFuncCode, (newCode) => {
		if (newCode) {
			// 续费操作：设置为单功能激活，只显示当前功能的规格
			activateType.value = 'single'
			selectedFuncCode.value = newCode
			loadSpecs('single', newCode)
		}
	}, { immediate: false })
	
	// 监听激活类型变化（不再 immediate，初始化走 onMounted，避免首次打开状态异常）
	watch(() => props.isFullPopupPlan, (newVal) => {
		if (newVal === undefined) return
		// 如果是特殊续费类型，不处理 isFullPopupPlan 的变化
		if (isSpecialRenew.value) return
		// 如果是从外部指定了当前续费功能，保持该功能，不被默认激活逻辑覆盖（避免闪烁到多开）
		if (props.currentFuncCode) return
		
		const shopTypeNum = Number(props.shopType)
		const supportFull = [1, 2, 6].includes(shopTypeNum)
		
		// 京东团购：只支持单功能激活，固定为“开通团购服务”
		if (shopTypeNum === 10 || shopTypeNum === 1001) {
			activateType.value = 'single'
			selectedFuncCode.value = 'JD_GROUP_OPEN'
			loadSpecs('single', 'JD_GROUP_OPEN')
			return
		}
		
		if (!supportFull) {
			activateType.value = 'single'
			const defaultFuncCode = getDefaultFuncCode()
			selectedFuncCode.value = defaultFuncCode
			loadSpecs('single', defaultFuncCode)
			return
		}
		
		activateType.value = newVal ? 'full' : 'single'
		if (newVal) {
			selectedFuncCode.value = ''
			loadSpecs('full')
		} else {
			const defaultFuncCode = getDefaultFuncCode()
			selectedFuncCode.value = defaultFuncCode
			loadSpecs('single', defaultFuncCode)
		}
	}, { immediate: false })
	
	// 初始化规格（根据店铺类型和激活类型）
	const initSpecs = () => {
		if (!props.shopType) return
		
		// 如果传入了 currentFuncCode，说明是续费操作，只显示当前功能的规格
		if (props.currentFuncCode) {
			activateType.value = 'single'
			selectedFuncCode.value = props.currentFuncCode
			loadSpecs('single', props.currentFuncCode)
			return
		}
		
		// 如果是特殊续费类型（微信推送或IM聚合客服），使用统一的初始化方法
		if (isSpecialRenew.value) {
			const funcCode = getSpecialRenewFuncCode()
			if (funcCode) {
				initSpecialRenewSpecs(funcCode)
				return
			}
		}
		
		// 普通续费类型的初始化逻辑
		const shopTypeNum = Number(props.shopType)
		const supportFull = [1, 2, 6].includes(shopTypeNum)
		
		// 京东团购：仅支持单功能激活，默认选中"开通团购服务"
		if (shopTypeNum === 10 || shopTypeNum === 1001) {
			activateType.value = 'single'
			selectedFuncCode.value = 'JD_GROUP_OPEN'
			loadSpecs('single', 'JD_GROUP_OPEN')
		} else if (props.isFullPopupPlan === true && supportFull) {
			activateType.value = 'full'
			selectedFuncCode.value = ''
			loadSpecs('full')
		} else {
			// 默认单功能激活，根据店铺类型设置默认选中的功能并加载规格
			activateType.value = 'single'
			const defaultFuncCode = getDefaultFuncCode()
			selectedFuncCode.value = defaultFuncCode
			loadSpecs('single', defaultFuncCode)
		}
	}
	
	onMounted(() => {
		loadRenewChannels()
		if (props.shopType) {
			const shopTypeNum = Number(props.shopType)
			// 京东团购（10 或 1001）和美团团购（9 或 1000）不调用后端接口
			if (shopTypeNum !== 9 && shopTypeNum !== 10 && shopTypeNum !== 1000 && shopTypeNum !== 1001) {
				getFuncList()
			}
		}
		
		initSpecs()
	})
	
	// 监听店铺类型变化，重新初始化规格
	watch(() => props.shopType, (newShopType, oldShopType) => {
		// 如果店铺类型发生变化，重新初始化
		if (newShopType !== oldShopType) {
			// 重新获取功能列表
			if (newShopType) {
				const shopTypeNum = Number(newShopType)
				if (shopTypeNum !== 9 && shopTypeNum !== 10 && shopTypeNum !== 1000 && shopTypeNum !== 1001) {
					getFuncList()
				}
			}
			// 重新初始化规格
			initSpecs()
		}
	})

	// 获取选中的规格
	const getSelectedItem = () => {
		// 优先使用 currentItem
		if (currentItem.value) {
			return currentItem.value
		}
		
		// 如果 currentItem 为空，尝试从 processedGoodsList 获取
		if (processedGoodsList.value && processedGoodsList.value.length > 0) {
			// 全功能激活时，强制使用第一个规格
			if (props.isFullPopupPlan) {
				return processedGoodsList.value[0]
			}
			
			// 尝试使用 currentId 匹配
			if (currentId.value) {
				const found = processedGoodsList.value.find(item => item.price_id === currentId.value)
				if (found) return found
			}
			
			// 使用当前索引或默认第一个
			const index = curPlan.value >= 0 && curPlan.value < processedGoodsList.value.length ? curPlan.value : 0
			return processedGoodsList.value[index] || processedGoodsList.value[0]
		}
		
		return null
	}
	
	/** 底部按钮入口：统一捕获未处理的异步异常，避免静默失败 */
	const onTapBuy = () => {
		buyHandler().catch((err) => {
			const msg = err instanceof Error ? err.message : String(err || '操作失败')
			uni.showToast({ title: msg, icon: 'none', duration: 2500 })
		})
	}

	// 下单操作（不在 wd-popup/wd-action-sheet 内再套 uni.showModal，避免原生弹窗被盖住表现为「点了没反应」）
	const buyHandler = async () => {
		if (renewChannelsLoading.value) {
			uni.showToast({ title: '支付方式加载中', icon: 'none' })
			return
		}
		if (!renewChannels.value.length) {
			await loadRenewChannels()
		}

		const selectedItem = getSelectedItem()

		if (!selectedItem || !selectedItem.price_id) {
			if (!internalPayList.value || internalPayList.value.length === 0) {
				uni.showToast({
					title: '请先选择功能并加载规格',
					icon: 'none',
					duration: 2000
				})
			} else {
				uni.showToast({
					title: '请选择规格',
					icon: 'none',
					duration: 2000
				})
			}
			return
		}

		if (!props.shopId) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none',
				duration: 2000
			})
			return
		}

		const channel = renewChannels.value.find((c) => c.channel_id === selectedChannelId.value)
		if (!channel || !selectedChannelId.value) {
			uni.showToast({
				title: '请选择支付方式（若列表为空请稍后重试）',
				icon: 'none',
				duration: 2500
			})
			return
		}

		const functionPriceId = selectedItem.function_price_id || selectedItem.price_id

		uni.showLoading({ title: '处理中...' })
		try {
			const result = await createPayOrder({
				shop_id: props.shopId,
				function_price_id: functionPriceId,
				channel_id: selectedChannelId.value
			})
			const payLinkRaw = !channel.is_balance ? result.pay_link : ''
			const opened = hasPayLink(payLinkRaw)
			if (opened) {
				openExternalPayLink(String(payLinkRaw))
			}
			uni.hideLoading()
			await finishOrderAfterCreate(result.order_no, opened, {
				queryStatus: queryPayOrderStatus,
				onPaid: async () => {
					currentId.value = ''
					uni.showToast({ title: '续费成功', icon: 'success', duration: 2000 })
					await emitShopFuncRefresh()
					setTimeout(() => emits('success', 'success'), 500)
				},
				onClosed: () => {
					uni.showToast({ title: '订单已关闭', icon: 'none' })
				},
				onFailed: (msg) => {
					uni.showToast({ title: msg, icon: 'none' })
				},
				onPending: (msg) => {
					uni.showToast({ title: msg, icon: 'none' })
				}
			})
		} catch (err) {
			const msg = err instanceof Error ? err.message : '操作失败，请重试'
			uni.showToast({ title: msg, icon: 'none' })
		} finally {
			uni.hideLoading()
		}
	}

	// 获取时间描述
	const getTimeDesc = (addTime) => {
		const timeMap = {
			30: '一个月',
			90: '三个月',
			182: '六个月',
			365: '十二个月'
		}
		return timeMap[addTime] || ''
	}
	
	const getPlanStr = (item) => {
		const timeDesc = getTimeDesc(item.add_time)
		const cost = getPlanCost(item)
		const funcName = item.func_name || item.name || '规格'
		
		if (timeDesc) {
			return `${timeDesc}（${funcName}） · ${item.add_time}天 · ${cost}元`
		}
		return `${funcName} · ${item.add_time}天 · ${cost}元`
	}

	const selectPlan = (item, index) => {
		currentCost.value = getPlanCost(item)
		currentId.value = item.price_id
		curPlan.value = index
	}
	
	// 计算规格展示价格（与 Pay 下单金额一致）
	const getPlanCost = (item) => {
		return item.cost || 0
	}

	// 监听 processedGoodsList 的变化，自动选择第一个规格
	watch(processedGoodsList, (newList) => {
		if (newList && newList.length > 0 && curPlan.value === 0 && !currentId.value) {
			const firstItem = newList[0]
			if (firstItem) {
				currentCost.value = firstItem.cost || 0
				currentId.value = firstItem.price_id || ''
			}
		}
	}, { immediate: true })
	
	// 处理图片加载错误
	const handleImageError = (e) => {
		console.error('推送提示图片加载失败:', e)
	}
	
	// 机器人在线状态图片预览弹窗相关
	const robotOnlineImageVisible = ref(false)
	const imageZoomed = ref(false)
	
	// 显示机器人在线状态图片
	const showRobotOnlineImage = () => {
		robotOnlineImageVisible.value = true
		imageZoomed.value = false // 重置放大状态
	}
	
	// 关闭机器人在线状态图片预览
	const closeRobotOnlineImage = () => {
		robotOnlineImageVisible.value = false
		imageZoomed.value = false // 重置放大状态
	}
	
	// 切换图片放大状态
	const toggleImageZoom = () => {
		imageZoomed.value = !imageZoomed.value
	}
	
	// 图片加载错误处理
	const handleRobotImageError = (e) => {
		console.error('机器人在线状态图片加载失败:', e)
		uni.showToast({
			title: '图片加载失败',
			icon: 'none'
		})
	}
</script>

<template>
	<view class="popup-wrap">
	<!-- scroll-view 在 App 端若不限制高度，flex:1 易产生透明层盖住底部按钮导致点击无响应 -->
	<scroll-view class="popup-scroll" scroll-y :show-scrollbar="true">
	<view class="px-15">
		<h1 class="h-54 flex items-center justify-center text-17 text-T333333 font-500">
			青柠助手
		</h1>

		<!-- 激活类型选择（特殊续费类型时不显示，续费时不显示） -->
		<view class="activate-type-section" v-if="!isSpecialRenew && !props.currentFuncCode">
			<view class="activate-type-title text-14 text-T666666 mb-10">激活类型</view>
			<view class="activate-type-options flex flex-row">
				<view 
					class="activate-type-item"
					:class="[
						[1, 2, 6].includes(Number(shopType)) ? 'flex-1' : (isHalfWidthFuncOption ? 'activate-type-item-half-width' : 'flex-1'),
						activateType === 'single' ? (shopType == 2 ? 'is-elm-active' : 'is-mt-active') : ''
					]"
					@click="selectActivateType('single')">
					<text>单功能激活</text>
				</view>
				<view 
					v-if="[1, 2, 6].includes(Number(shopType))"
					class="activate-type-item flex-1"
					:class="[activateType === 'full' ? (shopType == 2 ? 'is-elm-active' : 'is-mt-active') : '']"
					@click="selectActivateType('full')">
					<text>全功能激活</text>
				</view>
			</view>
		</view>

		<!-- 全功能激活下的功能说明栏（仅支持全功能的平台显示） -->
		<view v-if="activateType === 'full' && [1, 2, 6].includes(Number(shopType))" class="full-func-line">
			<text class="full-func-text">
				功能包含：{{
					Number(shopType) === 6
						? '自动出餐 + 回复 + 回评 + 店铺多开(防清除)'
						: Number(shopType) === 2
							? '自动出餐 + 回复 + 点金 + 店铺多开(防清除)'
							: '自动出餐 + 回复 + 回评 + 点金 + 店铺多开(防清除)'
				}}
			</text>
		</view>

		<!-- 功能选择（仅在单功能激活时显示，特殊续费类型时不显示，续费时不显示） -->
		<view class="func-select-section" v-if="activateType === 'single' && !isSpecialRenew && !props.currentFuncCode">
			<view class="func-select-title text-14 text-T666666 mb-10">选择功能</view>
			<view class="func-select-list">
				<!-- 第一行：多开、出餐、回复、回评四个功能显示在一行 -->
				<view class="func-select-row flex gap-10 mb-10" v-if="firstRowFuncs.length > 0">
					<view 
						v-for="(func, index) in firstRowFuncs" 
						:key="func.code || index"
						:class="[
							'func-select-item',
							'func-select-item-row',
							selectedFuncCode === func.code ? (shopType == 2 ? 'is-elm-selected' : 'is-mt-selected') : ''
						]"
						@click="selectFunc(func.code)">
						<text>{{ func.name }}</text>
					</view>
				</view>
				<!-- 其他功能：保持原有布局 -->
				<view class="func-select-list-others flex flex-wrap gap-10" v-if="otherFuncs.length > 0">
					<view 
						v-for="(func, index) in otherFuncs" 
						:key="func.code || index"
						:class="[
							'func-select-item',
							isHalfWidthFuncOption ? 'func-select-item-half' : '',
							(Number(shopType) === 10 || Number(shopType) === 1001) ? 'func-select-item-jd-group' : '',
							selectedFuncCode === func.code ? (shopType == 2 ? 'is-elm-selected' : 'is-mt-selected') : ''
						]"
						@click="selectFunc(func.code)">
						<text>{{ func.name }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 服务介绍 - IM聚合客服续费 -->
		<view class="mt-10 service-intro-section" v-if="isIMKefuRenew">
			<view class="text-14 text-T666666 mb-8">
				功能介绍
			</view>
			<view class="flex flex-wrap gap-8 pb-10 pt-8">
				<view class="service-intro-card flex flex-col rounded-7 bg-#F7F7F7">
					<view class="flex flex-col">
						<span class="service-intro-desc">开启后，不同平台店铺的顾客消息，都会在聚合客服工作台显示并统一进行回复，无需来回切换店铺。</span>
					</view>
				</view>
			</view>
		</view>

		<!-- 服务介绍 - 全功能激活（还原旧样式卡片），不包含评价申诉 -->
		<view class="service-intro-section" v-else-if="activateType === 'full' && fullFuncsForIntro.length">
			<view class="text-14 text-T666666 mb-8">
				功能介绍
			</view>
			<view class="flex flex-wrap gap-8 pb-10 pt-8">
				<!-- 只展示出餐、回复、回评、点金 4个功能 -->
				<view 
					v-for="(func, index) in fullFuncsForIntro" 
					:key="index"
					:class="[
						'flex flex-1 flex-row items-center rounded-7 bg-#F7F7F7',
						fullFuncsForIntro.length === 3 ? 'full-func-card-3' : 'min-w-40%'
					]">
					<image :src="func.icon" class="w-[120rpx] h-[120rpx]" mode=""></image>
					<view class="flex flex-col">
						<span class="service-intro-desc">{{ func.desc }}</span>
					</view>
				</view>
			</view>
		</view>

		<!-- 服务介绍 - 单功能激活（根据选中的功能显示对应的介绍） -->
		<view class="service-intro-section" v-else-if="activateType === 'single' && getCurrentFuncServiceIntro.length > 0">
			<view class="text-14 text-T666666 mb-8">
				功能介绍
			</view>
			<view class="flex flex-wrap gap-8 pb-10 pt-8">
				<!-- 根据激活类型显示对应的服务介绍 -->
				<view 
					v-for="(intro, index) in getCurrentFuncServiceIntro" 
					:key="index"
					class="service-intro-card flex flex-col rounded-7 bg-#F7F7F7">
					<view class="flex flex-col">
						<span class="service-intro-desc">{{ intro.desc }}</span>
					</view>
				</view>
			</view>
		</view>

		<!-- 推送功能提示（仅在推送服务激活时显示） -->
		<view v-if="isPushService" class="push-tip-text">
			<view class="push-tip-content">
				<text>推送功能请先在电脑端参考教程添加微信机器人并保持在线状态，手机端才可设置推送，请确认后再激活。</text>
			</view>
			<view class="push-tip-image-btn" @click="showRobotOnlineImage">
				<image src="@/static/img/robotonline.png" mode="aspectFit" class="push-tip-icon" @error="handleImageError"></image>
			</view>
		</view>

		<!-- 支付方式（Pay 渠道） -->
		<view class="spec-section" v-show="renewChannels.length > 0 || renewChannelsLoading">
			<view class="spec-title text-14 text-T666666 mb-10">支付方式</view>
			<view v-if="renewChannelsLoading" class="spec-loading-text">加载中...</view>
			<view v-else class="spec-list">
				<view
					v-for="(c, cidx) in renewChannels"
					:key="c.channel_id || cidx"
					class="mb-15 pay-btn"
					:class="[selectedChannelId === c.channel_id ? (shopType == 2 ? 'is-elm-btn-selected' : 'is-mt-btn') : '']"
					@click="selectRenewChannel(c)"
				>
					{{ c.channel_name }}{{ c.is_balance ? '（余额）' : '' }}
				</view>
			</view>
		</view>

		<!-- 规格列表：保持区域存在，避免切换时高度闪烁 -->
		<view class="spec-section" v-show="processedGoodsList.length > 0 || isSpecLoading">
			<view class="spec-title text-14 text-T666666 mb-10">规格</view>
			<view class="spec-list">
				<view v-if="isSpecLoading && processedGoodsList.length === 0" class="spec-loading-text">
					加载中...
				</view>
				<view 
					v-for="(item, index) in processedGoodsList" 
					:key="item.price_id || index" 
					class="mb-15 pay-btn"
					:class="[curPlan === index ? (shopType == 2 ? 'is-elm-btn-selected' : 'is-mt-btn') : '']" 
					@click="selectPlan(item, index)">
					{{ getPlanStr(item) }}
				</view>
			</view>
		</view>
	</view>
	</scroll-view>
	<!-- 固定底部按钮：使用原生 button，避免 view 在 action-sheet 内不触发点击 -->
	<view class="popup-footer">
		<button
			type="button"
			class="sure-pay-native sure-pay"
			:class="[shopType == 2 ? 'is-elm-btn': '']"
			hover-class="sure-pay-hover"
			@tap.stop.prevent="onTapBuy"
		>
			立即订购
		</button>
	</view>
	</view>
	
	<!-- 机器人在线状态图片预览弹窗 -->
	<wd-popup v-model="robotOnlineImageVisible" position="center"
		custom-style="width: 90%;max-height: 85vh;border-radius: 20rpx;padding: 0;overflow: hidden;" @close="closeRobotOnlineImage"
		:z-index="603">
		<view class="template-preview-container">
			<view class="template-preview-header">
				<view class="template-preview-title">机器人在线状态说明</view>
				<view class="template-preview-close" @click="closeRobotOnlineImage">✕</view>
			</view>
			<view class="template-preview-content" @click="toggleImageZoom">
				<image 
					src="@/static/img/robotonline.png"
					:mode="imageZoomed ? 'aspectFit' : 'widthFix'" 
					:class="['template-image', {'template-image-zoomed': imageZoomed}]"
					@click.stop="toggleImageZoom"
					@error="handleRobotImageError"
				></image>
			</view>
			<view class="template-preview-footer" v-if="!imageZoomed">
				<text class="zoom-hint">点击图片可放大查看</text>
			</view>
		</view>
	</wd-popup>
</template>

<style lang="scss" scoped>
	/* 弹窗根容器：scroll-view 使用固定 max-height，避免与底部按钮重叠吞掉触摸 */
	.popup-wrap {
		max-height: 70vh;
		border-radius: inherit;
		overflow: hidden;
		position: relative;
	}

	/* 必须限制高度，否则 App 上 scroll-view 透明层会盖住下方「立即订购」 */
	.popup-scroll {
		max-height: 56vh;
		min-height: 0;
		overflow: hidden;
	}

	/* 底部按钮区：不参与滚动，置于文档流底部并抬高触摸层级 */
	.popup-footer {
		position: relative;
		z-index: 20;
		padding: 0rpx 30rpx;
		padding-bottom: calc(10rpx + 70rpx + env(safe-area-inset-bottom));
		background: #fff;
		border-top: 1px solid #F5F5F5;
	}

	/* 重置 uni-app / 小程序 button 默认样式，保持与原 view 按钮一致 */
	.sure-pay-native {
		display: block;
		width: 100%;
		border: none !important;
		margin: 0;
		padding: 0;
		line-height: 80rpx;
		outline: none;
		box-sizing: border-box;
	}

	.sure-pay-native::after {
		border: none !important;
	}

	.sure-pay-hover {
		opacity: 0.88;
	}
	
	.isv2 {
		background-color: rgb(226, 61, 65) !important;
	}
	.pay-btn {
		width: 100%;
		height: 80rpx;
		background: linear-gradient(135deg, #E0E0E0 0%, #C0C0C0 100%);
		border-radius: 14rpx;
		line-height: 80rpx;
		text-align: center;
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
	}
	.is-mt-btn {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		color: #333333;
		font-weight: 500;
	}
	.is-elm-btn-selected {
		background: linear-gradient(135deg, #0492FA 0%, #5BA8F5 100%);
		color: #fff;
		font-weight: 500;
	}
	.sure-pay {
		width: 100%;
		height: 80rpx;
		background: #FACC05;
		border-radius: 14rpx;
		line-height: 80rpx;
		font-weight: 500;
		font-size: 34rpx;
		color: #333333;
		letter-spacing: 1px;
		text-align: center;
	}
	.sure-pay.is-elm-btn {
		background: #0492FA;
		color: #fff;
	}
	.push-tip-text {
		margin-top: 20rpx;
		margin-bottom: 20rpx;
		padding: 20rpx;
		background-color: #fff7e6;
		border: 1px solid #ffd591;
		border-radius: 12rpx;
		line-height: 1.6;
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
	}
	
	.push-tip-content {
		flex: 1;
		padding-right: 100rpx; /* 为按钮留出空间 */
	}
	
	.push-tip-content text {
		font-size: 24rpx;
		color: #d46b08;
		line-height: 1.6;
		display: block;
	}
	
	.spec-desc-text {
		color: #666666;
		font-size: 24rpx;
	}
	
	.push-tip-image-btn {
		flex-shrink: 0;
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid #ffd591;
		border-radius: 12rpx;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.push-tip-image-btn:active {
		opacity: 0.7;
		transform: scale(0.95);
	}
	
	.push-tip-icon {
		width: 60rpx;
		height: 60rpx;
	}
	
	.template-preview-container {
		width: 100%;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background: #fff;
	}
	
	.template-preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #e0e0e0;
	}
	
	.template-preview-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		flex: 1;
	}
	
	.template-preview-close {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		color: #999999;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.template-preview-close:active {
		opacity: 0.7;
		transform: scale(0.95);
	}
	
	.template-preview-content {
		flex: 1;
		overflow: auto;
		padding: 20rpx;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		cursor: pointer;
	}
	
	.template-image {
		width: 100%;
		max-width: 100%;
		height: auto;
		border-radius: 8rpx;
		transition: transform 0.3s ease;
	}
	
	.template-image-zoomed {
		width: auto;
		max-width: none;
		height: auto;
		max-height: 80vh;
		cursor: zoom-out;
	}
	
	.template-preview-footer {
		padding: 16rpx 30rpx;
		border-top: 1px solid #e0e0e0;
		text-align: center;
		background: #fafafa;
	}
	
	.zoom-hint {
		font-size: 24rpx;
		color: #999999;
	}
	
	.activate-type-section {
		margin-top: 10rpx;
		margin-bottom: 14rpx;
	}
	
	.activate-type-title {
		margin-bottom: 10rpx;
	}
	
	.activate-type-options {
		gap: 16rpx;
	}
	
	.activate-type-item {
		height: 70rpx;
		line-height: 70rpx;
		text-align: center;
		border-radius: 14rpx;
		background: #F5F5F5;
		color: #666666;
		font-size: 28rpx;
		transition: all 0.3s;
	}
	
	.activate-type-item.is-mt-active {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		color: #333333;
		font-weight: 500;
	}
	
	.activate-type-item.is-elm-active {
		background: linear-gradient(135deg, #0492FA 0%, #5BA8F5 100%);
		color: #fff;
		font-weight: 500;
	}
	
	/* 特定店铺类型（美团闪购3、美团医药4、淘宝闪购零售5、京东秒送6、抖音即时零售7）单功能激活按钮宽度改为48%，与功能选择项宽度一致 */
	.activate-type-item-half-width {
		flex: 0 0 48%;
		max-width: 48%;
	}
	
	.func-select-section {
		margin-bottom: 14rpx;
	}
	
	.func-select-title {
		margin-bottom: 10rpx;
	}
	
	.func-select-list {
		display: flex;
		flex-direction: column;
	}
	
	.func-select-row {
		display: flex;
		justify-content: space-between;
		width: 100%;
		gap: 8rpx;
		margin-bottom: 16rpx;
	}
	
	.func-select-list-others {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		justify-content: flex-start;
	}
	
	.func-select-item {
		padding: 16rpx 32rpx;
		border-radius: 14rpx;
		background: #F5F5F5;
		color: #666666;
		font-size: 26rpx;
		text-align: center;
		box-sizing: border-box;
		transition: background-color 0.3s, color 0.3s;
	}
	
	.func-select-item-row {
		flex: 1;
		min-width: 0;
		padding: 16rpx 20rpx;
	}
	
	.func-select-item-row text {
		white-space: nowrap;
		display: inline-block;
	}
	
	/* 特定平台单功能激活选项宽度改为一半 */
	.func-select-item-half {
		flex: 0 0 48%;
		max-width: 48%;
	}
	
	/* 京东团购的两个选项：宽度更宽，确保一行显示 */
	.func-select-item-jd-group {
		flex: 0 0 48%;
		max-width: 48%;
		min-width: 48%;
	}
	
	.func-select-item.is-mt-selected {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		color: #333333;
		font-weight: 500;
	}
	
	.func-select-item.is-elm-selected {
		background: linear-gradient(135deg, #0492FA 0%, #5BA8F5 100%);
		color: #fff;
		font-weight: 500;
	}
	
	.spec-section {
		margin-top: 20rpx;
		margin-bottom: 14rpx;
		min-height: 90rpx; /* 保留一定高度，避免切换时窗口高度变化过大 */
		position: relative;
		z-index: 0;
	}
	
	.spec-loading-text {
		font-size: 24rpx;
		color: #999999;
		text-align: center;
		padding: 20rpx 0;
	}
	
	.spec-title {
		margin-bottom: 12rpx;
	}

	.full-func-line {
		margin-top: 8rpx;
		margin-bottom: 16rpx;
		padding: 16rpx 20rpx;
		border-radius: 12rpx;
		background-color: #F7F7F7;
	}

	.full-func-text {
		font-size: 24rpx;
		color: #666666;
	}
	
	.service-intro-section {
		margin-top: 10rpx;
		margin-bottom: 20rpx;
	}
	
	.service-intro-card {
		padding: 14rpx 16rpx;
		border: 1px solid #E0E0E0;
		transition: all 0.3s;
		min-width: calc(50% - 10rpx);
		flex: 1;
		box-sizing: border-box;
	}
	
	.service-intro-card-active {
		border-color: #FACC05;
		background: #FFFBF0;
	}
	
	.service-intro-desc {
		font-size: 24rpx;
		color: #666666;
		line-height: 1.6;
	}
	
	/* 全功能激活时，当有3个功能卡片（如京东秒送：出餐、回复、回评）时，确保所有卡片宽度一致 */
	.full-func-card-3 {
		flex: 0 0 calc((100% - 20rpx) / 2);
		min-width: 0;
	}
</style>