import pagesConfig from '@/pages.json'
import useAccountStore from '@/store/account'
import { createRouter } from '@/utils/router'

// 商家版已移除，tabBar 已注释，使用空数组作为默认值
const tabBar = (pagesConfig as any).tabBar || { list: [] }
const pages = pagesConfig.pages

/**
 * 创建路由
 */
const router = createRouter({
  init: pages[0].path,
  routes: pages.map(({ path, title, authRequired }) => ({
    path,
    meta: {
      authRequired,
      title
    },
    // 商家版已移除，tabBar 已注释，所有页面都不是 tabBar
    isTabBar: tabBar.list && tabBar.list.length > 0 ? tabBar.list.some((item: any) => item.pagePath === path) : false
  }))
})

router.beforeEach((to, from) => {
  console.log(`--- route before ${from?.fullPath} -> ${to?.fullPath}`)
  if (to?.meta?.authRequired) {
    const store = useAccountStore()
    store.syncTokenFromStorage()
    const isLogin = !!store.token
    if (!isLogin) {
      return {
        path: '/pages/login/chooseUser',
        query: { from: to.path, showModal: true }
      }
    }
  }
})

router.afterEach((to, from, err) => {
  console.log(
    `--- route after ${from?.fullPath} -> ${to?.fullPath} ${err || ''}`
  )
})
export default router
