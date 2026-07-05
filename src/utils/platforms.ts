const PLATFORM_NAMES: Record<number, string> = {
	1: '美团外卖', 2: '淘宝闪购外卖', 3: '美团闪购', 4: '美团医药',
	5: '淘宝闪购零售', 6: '京东秒送', 7: '抖店即时零售', 8: '饿了么官方', 9: '抖音外卖',
}
export function getPlatformName(shopType: number): string {
	return PLATFORM_NAMES[shopType] || `平台${shopType}`
}
