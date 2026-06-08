import type { LoginInfo } from '@/types/login'
import { ref } from 'vue'
import { defineStore } from 'pinia';

const useAccountStore = defineStore(
  'account',
  () => {
    const token = ref<string>()
    const loginInfo = ref<LoginInfo>()
    /**
     * 登录
     */
    const login = (data: string) => (token.value = data)

    /**
     * 设置登录信息
     *
     * @param data
     * @returns
     */
    const setLoginInfo = (data?: LoginInfo) =>
      (loginInfo.value = data)

    /**
     * 退出登录
     */
    const logout = () => {
      token.value = undefined
      loginInfo.value = undefined
    }

    /**
     * 登录页等场景只写了 `uni.setStorageSync('token')`（authStore），未写入本 store 时，
     * 内存中 token 仍为空会导致误判未登录并跳转登录页，随即 chooseUser 又因本地 token 存在而 reLaunch 首页。
     * 在鉴权判断前调用，用本地存储与本 store 对齐。
     */
    const syncTokenFromStorage = () => {
      if (token.value) {
        return
      }
      const persisted = uni.getStorageSync('token') as string | undefined
      if (persisted && String(persisted).trim() !== '') {
        token.value = persisted
      }
    }

    return {
      token,
      loginInfo,
      logout,
      login,
      setLoginInfo,
      syncTokenFromStorage
    }
  },
  {
    unistorage: true
  }
)

export default useAccountStore
