export type MpTabKey = 'manage' | 'aggregated' | 'user'

export const MP_SHELL_URL = '/pages/mp-shell/mp-shell'

export function mpShellTabUrl(tab: MpTabKey) {
	return `${MP_SHELL_URL}?tab=${tab}`
}

export function redirectToMpShellTab(tab: MpTabKey) {
	uni.redirectTo({
		url: mpShellTabUrl(tab),
		fail: () => {
			uni.reLaunch({ url: mpShellTabUrl(tab) })
		},
	})
}
