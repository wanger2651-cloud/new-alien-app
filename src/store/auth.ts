// src/stores/auth.ts
import { defineStore } from 'pinia';

interface AuthState {
  token: string | null;
  userId: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: uni.getStorageSync('token') || null, // 从本地存储中读取初始 Token
	userId: uni.getStorageSync('userId') || null
  }),
  actions: {
    setToken(token: string): void {
      this.token = token;
      uni.setStorageSync('token', token); // 存储 Token 到本地存储
    },
	setUserId(userId: string): void {
		this.userId = userId
		uni.setStorageSync('userId', userId)
	},
    clearToken(): void {
      this.token = null;
      uni.removeStorageSync('token'); // 从本地存储中移除 Token
    },
	clearUserId(): void {
		this.userId = null
		uni.removeStorageSync('userId')
	}
  },
  getters: {
    getToken(state: AuthState): string | null {
      return state.token;
    },
	getUserId(state: AuthState): string | null {
		return state.userId
	}
  },
});