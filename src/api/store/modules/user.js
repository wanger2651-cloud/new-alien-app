// 用户数据模块
import store from '../index.js'

import {
	USER_INFO,
	TOKEN_INFO,
	OUT_LOGIN,
} from '../types.js'
const state = {
	userInfo: uni.getStorageSync('userInfo') ? uni.getStorageSync('userInfo') : {},
	tokenInfo: uni.getStorageSync('tokenInfo') ? uni.getStorageSync('tokenInfo') : {},
	showLoginTip: false,

}

const actions = {

	
}

const mutations = {

	[USER_INFO](state, data) {
		state.userInfo = data
	},
    [TOKEN_INFO](state, data) {
    	state.tokenInfo = data
    },
	[OUT_LOGIN](state, data) {
		uni.removeStorageSync('tokenInfo');
		uni.removeStorageSync('userInfo');
		store.commit('USER_INFO', {});
		store.commit('TOKEN_INFO', {});
	},

}

const getters = {
    loginFlag: state => {
        return Boolean( Object.keys(state.tokenInfo).length != 0 );
    },
}

export default {
	state,
	mutations,
	actions,
	getters
}
