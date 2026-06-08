<template>
	<view>
		<view class="" id="pcwebview"></view>
	</view>
</template>

<script>
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app';
	var wv = null;
	export default {
		data() {
			return {
				src: ''
			};
		},
		onLoad() {

			// setTimeout(() => {
			// 	this.open_web()
			// }, 1000)
			this.check_ele()
		},
		methods: {
			check_ele() {
				try {
					uni.createSelectorQuery().in(this).select("#pcwebview").boundingClientRect((data) => {
						this.open_web()
					}).exec();
				} catch (error) {
					setTimeout(() => {
						this.check_ele()
					}, 300)
				}
			},
			set_cookie(wv, cookie, home_url, domain) {
				var currentWebview = this.$scope.$getAppWebview()
				let js_cookie_str = ''
				let js_cookie_arr = cookie.split("; ")
				for (let i in js_cookie_arr) {
					let cookie_xx = ''
					if (domain) {
						cookie_xx = `${js_cookie_arr[i]}; path=/; domain=${domain}`
					} else {
						cookie_xx = `${js_cookie_arr[i]}; path=/`
					}
					plus.navigator.setCookie(home_url, cookie_xx);
				}
			},
			open_meituan(cookie) {
				this.close_web()
				setTimeout(() => {
					console.log(['创建任务'])
					let url = `https://e.waimai.meituan.com/`
					let redirect_url = `https://e.waimai.meituan.com/`
					let w = this.create_web('https://www.baidu.com')
					plus.navigator.removeAllCookie();
					plus.navigator.removeCookie();
					plus.navigator.removeSessionCookie();
					plus.cache.clear(() => {
						this.set_cookie(w, cookie, url, '')
						w.loadURL(redirect_url)
						w.show()
					});
				}, 1000)
			},
			open_melody(cookie) {
				this.close_web()
				setTimeout(() => {
					console.log(['创建任务'])
					let shop_id = "1197905431" //商铺id
					let url = `https://melody.shop.ele.me/login`
					let redirect_url =
						`https://melody.shop.ele.me/app/shop/${shop_id}/dashboard#app.shop.dashboard`
					let w = this.create_web('https://www.baidu.com')
					plus.navigator.removeAllCookie();
					plus.navigator.removeCookie();
					plus.navigator.removeSessionCookie();
					plus.cache.clear(() => {
						this.set_cookie(w, cookie, url, '.ele.me')
						w.loadURL(redirect_url)
						w.show()
					});
				}, 1000)

			},
			close_web() {
				var wvs = plus.webview.all();
				for (var i = 0; i < wvs.length; i++) {
					let url = wvs[i].getURL()
					console.log('webview' + i + ': ' + url);
					if (url.indexOf('http') === 0) {
						console.log('关闭:webview' + i + ': ' + url);
						plus.webview.close(wvs[i])
					}
				}
			},
			create_web(url) {
				// #ifdef APP-PLUS
				const banben = Math.floor(Math.random() * 601) + 1
				plus.navigator.setUserAgent(
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
					Math.floor(Math.random() * 16) +
					"_7) AppleWebKit/" + banben +
					".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
				)
				let getWindowInfo = uni.getWindowInfo();
				let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
				const webviewid = 'pcwebview';
				const webview_setting = {
					'kernel': 'UIWebview'
				};
				let w = plus.webview.create(url, webviewid, webview_setting);
				return w
			},
			open_web() {
				let meituan_cookie =
					`_lxsdk_cuid=194224cf42dc8-0a064cdb7a6302-2a325b0a-100200-194224cf42ec8; _lxsdk=194224cf42dc8-0a064cdb7a6302-2a325b0a-100200-194224cf42ec8; WEBDFPID=65531019z5ww5x60z26w1u8x3yy10w36805775xu31897958762uy9wv-2051102256548-1735742255503SAKOSWAfd79fef3d01d5e9aadc18ccd4d0c95079957; device_uuid=!cf32201c-a475-4e41-8179-8171e714298a; uuid_update=true; shopCategory=food; acctId=168725546; token=0gVNTGVXu0L1kUZGleDKe_KkYJunW5yAlPfqdZ5nByOg*; wmPoiId=18990898; isOfflineSelfOpen=0; city_id=370100; isChain=0; ignore_set_router_proxy=false; region_id=1000370100; region_version=1693570110; bsid=FDGqAsmVC3nC-eb7kZ_eUM1C7EpWBwDne9LNBcZvb8aMhWs9wBzLq2BOtuR5ObMmB2ptw-3y0tS8iPLLv83ntw; city_location_id=370100; location_id=370113; has_not_waimai_poi=0; onlyForDaoDianAcct=0; cityId=370100; provinceId=370000; scIndex=0; set_info_single={"regionIdForSingle":"1000370100","regionVersionForSingle":1693570110}; set_info={"wmPoiId":"18990898","region_id":"1000370100","region_version":1693570110}; pushToken=0gVNTGVXu0L1kUZGleDKe_KkYJunW5yAlPfqdZ5nByOg*; _lxsdk_s=194224cf431-e1f-c76-56d||8; JSESSIONID=1xxsey1h4v9yj1o8f6k3y9lz6j; WEBDFPID=65531019z5ww5x60z26w1u8x3yy10w36805775xu31897958762uy9wv-2051102256548-1735742255503SAKOSWAfd79fef3d01d5e9aadc18ccd4d0c95079957; _lxsdk_s=194224cf431-e1f-c76-56d||9; _lxsdk_s=194224cf431-e1f-c76-56d||9; _lxsdk_s=194224cf431-e1f-c76-56d||9; setPrivacyTime=1_20250106; logan_session_token=27wechngcahoi0o71t3v; wpush_server_url=wss://wpush.meituan.com`

				this.open_meituan(meituan_cookie) //美团

				let melody_cookie =
					`cna=RWICILR2FlgCAXDvLCm0ivL0; xlly_s=1; eleUserId=f5545232e9a1d99f413d9f402a6c78a1; eleClientId=29d7f34b-d3ab-f0a6-d063-1d846e108d72; x5check_napos=OTC5YMMTA1MzE4MDA5NzQ3NzAxUEpMbWZ6MDZQ; ksid=OTC5YMMTA1MzE4MDA5NzQ3NzAxUEpMbWZ6MDZQ; shopId=1197905431; mtop_partitioned_detect=1; _m_h5_tk=dd6a40d175aba7add734bc5744f41ca5_1736170364453; _m_h5_tk_enc=8ab17368ee5fe9e930daf67e11a268df; AEM_TAG_ID_CATCH_DATA_ES00000044={%22tagId%22:%22ES00000044%22%2C%22data%22:%22%E5%BF%AB%E9%A4%90%E4%BE%BF%E5%BD%93%22%2C%22userId%22:1197905431%2C%22time%22:1736162214552}; AEM_TAG_ID_CATCH_DATA_ES00000069={%22tagId%22:%22ES00000069%22%2C%22data%22:%22%E8%80%81%E5%BA%97%22%2C%22userId%22:1197905431%2C%22time%22:1736162214552}; AEM_TAG_ID_CATCH_DATA_ES00000035={%22tagId%22:%22ES00000035%22%2C%22userId%22:1197905431%2C%22time%22:1736162214552}; AEM_TAG_ID_CATCH_DATA_ES00000021={%22tagId%22:%22ES00000021%22%2C%22data%22:%22%E5%85%A8%E5%9B%BD%E8%BF%9E%E9%94%81%22%2C%22userId%22:1197905431%2C%22time%22:1736162214552}; AEM_TAG_ID_CATCH_DATA_ES00000019={%22tagId%22:%22ES00000019%22%2C%22data%22:%22%E4%B8%8A%E6%B5%B7%22%2C%22userId%22:1197905431%2C%22time%22:1736162214553}; isg=BBoaqec1KW7-j6XCIEWpkF2ja8A8S54ldtOqrSSTxq14l7rRDNvuNeBlZ2MLRxa9; tfstk=efa9RnMu69XGhbprxNIni9ZonHCnfPFwRRPWoxDMcJeLp-HmIAV_HmwzejmsoOrpD-2vSm1anEELK8H1_q00pSNYLPqiIAbYD8MF_q20kk8YaSzG_qfZ75uqlTXlr-Fa_qkiT2UOrf5J4dBlEaboEuFQwT2MIQN5YaAkUGxpJyUm1wnEp2rR7enoXYNO4ETYJUmtF5MplTaK6xk71vLXlg8zrzEuLLD-ihCd9n-qfXrZs4eYGE3OUXHl6ZK20D5E9Yfd9n-qfAlKE1CB0no3g`;

				this.open_melody(melody_cookie) //饿了么
			}
		}
	}
</script>

<style lang="scss">

</style>