import { ref, type App, type UnwrapRef, getCurrentInstance, type Ref } from 'vue'
import { decodeQuery, encodeQuery, parserURL } from './url'
import { onLoad } from '@dcloudio/uni-app'

export interface RouterOptions {
  init?: RoutePath
  routes: Route[]
}

export interface Route {
  name?: string
  path: string
  isTabBar?: boolean
  meta?: Record<string, any>
  redirect?: string
}

export interface RouteNormalize extends Route {
  path: string
}

export interface RouteResolved<
  T extends Record<string, any> = Record<string, any>
> extends RouteNormalize {
  query?: T
  fullPath: string
}

export interface RoutePathOptions {
  path?: string
  name?: string
  query?: Record<string, any>
}

export type RoutePath = string | RoutePathOptions

export type RouterBeforeGuard = (
  to?: RouteResolved,
  from?: RouteResolved
) => Promise<RoutePath | boolean | undefined> | RoutePath | boolean | void

export type RouterAfterGuard = (
  to?: RouteResolved,
  from?: RouteResolved,
  err?: any
) => Promise<RoutePath | boolean | undefined> | RoutePath | boolean | void

export type RouterBeforeListener = {
  type: 'before'
  guard: RouterBeforeGuard
}

export type RouterAfterListener = {
  type: 'after'
  guard: RouterAfterGuard
}

export type RouterListener = RouterBeforeListener | RouterAfterListener

export type RouterNavigateType = 'push' | 'replace' | 'relaunch'

export interface RouterBeforeNavigateOptions {
  to?: RouteResolved
  from?: RouteResolved
  type: RouterNavigateType
}

export interface RouterAfterNavigateOptions {
  to?: RouteResolved
  from?: RouteResolved
  type: RouterNavigateType
  err: any
}

/**
 * 标准化路由
 * @param routes
 * @returns
 */
const normalizeRoutes = (routes: Route[]) => {
  return routes.map<RouteNormalize>((route) => {
    const name = (route.path.match(/pages\/(.+)\/\1$/) || [])[1]
    route.path = route.path.startsWith('/') ? route.path : `/${route.path}`
    return {
      ...route,
      name
    }
  })
}

// 路由
let router: Router

/**
 * 创建路由
 * @param options 路由配置
 */
export const createRouter = (options: RouterOptions) => {
  // 如果已经存在路由，则直接返回
  if (router) {
    return router
  }
  // 初始化路由
  router = new Router(options)
  return router
}

export class Router {
  /**
   * 路由配置
   */
  routes: RouteNormalize[]
  /**
   * 初始路由路径
   */
  #initRoute: RouteResolved | undefined
  /**
   * 当前路由路径
   */
  #route: Ref<RouteResolved | undefined>
  /**
   * 路由守卫
   */
  listener: RouterListener[]
  constructor(options: RouterOptions) {
    this.routes = normalizeRoutes(options.routes)
    this.listener = []
    const initRoute = this.resolve(options.init)
    this.#route = ref(initRoute)
    this.#initRoute = initRoute

    // 拦截函数名
    const names = [
      'navigateTo',
      'redirectTo',
      'reLaunch',
      'switchTab',
      'navigateBack'
    ]

    // 批量注册路由拦截
    names.forEach((name) => {
      // 源路由
      let fromRoute: RouteResolved | undefined
      //目标路由
      let toRoute: RouteResolved | undefined

      // 调用导航
      const invokeNavigate =
        (callback: (options: any) => Promise<boolean> | boolean | undefined) =>
        async (options: any) => {
          const res = await callback(options)
          if (res === false) {
            throw new Error('[router] Navigation canceled')
          }
          return options
        }

      // 路由拦截
      uni.addInterceptor(name, {
        invoke: invokeNavigate(async (res) => {
          if (name !== 'navigateBack') {
            toRoute = this.resolve(res.url)
            // 如果路由解析失败，直接允许导航（使用原始URL）
            if (!toRoute) {
              console.warn(`[router] Route not found: ${res.url}, allowing direct navigation`)
              return true
            }
            fromRoute = this.resolve(this.#route.value)
            // 前置结果
            const beforeRes = await this.handleBeforeGuard(toRoute, fromRoute)
            return typeof beforeRes === 'boolean' ? beforeRes : true
          }
          const pages = getCurrentPages()
          const toPage = pages[pages.length - (res.delta || 1) - 1]
          toRoute = this.resolve(toPage?.route)
          fromRoute = this.resolve(this.#route.value)
          // 修复返回页面时，tabbar不更新的问题
          if (fromRoute?.name === 'login' && toRoute?.isTabBar) {
            this.replace(toRoute)
            return false
          }
          // 阻止返回到登录页面
          if (toRoute?.name === 'login' || toRoute?.path?.includes('login')) {
            return false
          }
          // 禁止返回初始页面
          // if (this.#initRoute && toRoute?.name === this.#initRoute.name) {
          //   return false
          // }
          // 前置结果
          const beforeRes = await this.handleBeforeGuard(toRoute, fromRoute)
          return typeof beforeRes === 'boolean' ? beforeRes : true
        }),
        success: () => {
          const toPage = getCurrentPages().pop()
          const resRoute = this.resolve(toPage?.route)
          if (name === 'navigateBack') {
            if (resRoute && fromRoute && resRoute.path === fromRoute.path) {
              this.handleAfterGuard(
                toRoute,
                fromRoute,
                new Error('[router] Navigation canceled')
              )
              return
            }
          }
          this.#route.value = toRoute
          this.handleAfterGuard(toRoute, fromRoute)
        },
        fail: (err) => {
          this.handleAfterGuard(
            toRoute,
            fromRoute,
            err instanceof Error ? err : new Error(err.errMsg)
          )
        }
      })
    })
  }
  /**
   * 路径解析
   *
   * @param routePath
   * @returns
   * @example
   * ```ts
   * import { useRouter } from '@/utils/router'
   * const router = useRouter()
   *
   * const route = router.resolve('/pages/index/index?a=1')
   * // 或者
   * const route = router.resolve({
   *   path: '/pages/index/index',
   *   name: 'index',
   *   query: { a: 1 }
   * })
   *
   * // { path: '/pages/index/index', name: 'index', query: { a: 1 }, fullPath: '/pages/index/index?a=1' }
   * console.log(route)
   * ```
   */
  resolve<T extends Record<string, any> = Record<string, any>>(
    routePath?: RoutePath
  ) {
    if (!routePath) {
      return
    }
    if (typeof routePath === 'string') {
      const { path, query } = parserURL(routePath)
      const route = this.routes.find(
        (route) => route.path === (path.startsWith('/') ? path : `/${path}`)
      )
      if (!route) {
        return
      }
      const fullPath = `${route.path}${encodeQuery(query)}`
      const resolvedRoute: RouteResolved<T> = {
        ...route,
        query: <T>query,
        fullPath
      }
      return resolvedRoute
    }
    const route = this.routes.find((route) => {
      const { path, name } = routePath
      if (path && route.path === (path.startsWith('/') ? path : `/${path}`)) {
        return true
      }
      if (name && route.name === name) {
        return true
      }
      return false
    })
    if (!route) {
      return
    }
    const { query } = routePath
    const fullPath = `${route.path}${encodeQuery(query)}`
    const resolvedRoute: RouteResolved<T> = {
      ...route,
      query: <T>query,
      fullPath
    }
    return resolvedRoute
  }
  /**
   * 前置路由守卫
   *
   * @param guard 路由守卫
   * @example
   * ```ts
   * import { useRouter } from '@/utils/router'
   * const router = useRouter()
   *
   * // 返回 路由 则重定向到指定路由
   * router.beforeEach((to, from) => {
   *   return '/pages/index/index?a=1'
   * // 或者
   *   return { path: '/pages/index/index', name: 'index', query: { a: 1 } }
   * })
   *
   * // 返回 false 则中断导航
   * router.beforeEach((to, from) => {
   *   return false
   * })
   *
   * // 返回 true 或者 undefined 则继续导航
   * router.beforeEach((to, from) => {
   *   return true
   * // 或者
   *   return
   * })
   * ```
   */
  beforeEach(guard: RouterBeforeGuard) {
    this.listener.push({
      type: 'before',
      guard
    })
  }
  /**
   * 后置路由守卫
   *
   * @param guard 路由守卫
   * @example
   * ```ts
   * import { useRouter } from '@/utils/router'
   * const router = useRouter()
   *
   * router.afterEach((to, from, err) => {
   *   // 跳转完成信息
   *   console.log(to, from, err)
   * })
   * ```
   */
  afterEach(guard: RouterAfterGuard) {
    this.listener.push({
      type: 'after',
      guard
    })
  }
  /**
   * 跳转页面
   * @param toRoutePath
   * @param options
   * @returns
   * @example
   * ```ts
   * import { useRouter } from '@/utils/router'
   * const router = useRouter()
   *
   * // 路径
   * router.push('/pages/index/index?a=1')
   *
   * // 对象
   * router.push({
   *   path: '/pages/index/index',
   *   name: 'index',
   *   query: { a: 1 }
   * })
   * ```
   */
  push(
    toRoutePath: RoutePath,
    options?: Pick<
      UniNamespace.NavigateToOptions,
      'animationType' | 'animationDuration'
    >
  ) {
    const toRoute = this.resolve(toRoutePath)
    if (!toRoute) {
      throw new Error(`[router] Invalid route in router: ${toRoutePath}`)
    }
    return this.startNavigate('push', toRoute, options)
  }
  /**
   * 重定向页面
   *
   * @param toRoutePath
   * @returns
   * @example
   * ```ts
   * import { useRouter } from '@/utils/router'
   * const router = useRouter()
   *
   * // 路径
   * router.replace('/pages/index/index?a=1')
   *
   * // 对象
   * router.replace({
   *   path: '/pages/index/index',
   *   name: 'index',
   *   query: { a: 1 }
   * })
   * ```
   */
  replace(toRoutePath: RoutePath) {
    const toRoute = this.resolve(toRoutePath)
    if (!toRoute) {
      throw new Error(`[router] Invalid route in router: ${toRoutePath}`)
    }
    return this.startNavigate('replace', toRoute)
  }
  /**
   * 关闭所有页面，打开当前页
   *
   * @param toRoutePath
   * @returns
   * @example
   * ```ts
   * import { useRouter } from '@/utils/router'
   * const router = useRouter()
   *
   * // 路径
   * router.relaunch('/pages/index/index?a=1')
   *
   * // 对象
   * router.relaunch({
   *   path: '/pages/index/index',
   *   name: 'index',
   *   query: { a: 1 }
   * })
   * ```
   */
  relaunch(toRoutePath: RoutePath) {
    const toRoute = this.resolve(toRoutePath)
    if (!toRoute) {
      throw new Error(`[router] Invalid route in router: ${toRoutePath}`)
    }
    return this.startNavigate('relaunch', toRoute)
  }
  async back(
    options?: Pick<
      UniNamespace.NavigateBackOptions,
      'delta' | 'animationDuration' | 'animationType'
    >
  ) {
    return uni.navigateBack(options)
  }
  /**
   * 开始导航
   * @param type
   * @param route
   * @returns
   */
  startNavigate(
    type: RouterNavigateType,
    route: RouteResolved,
    options?: Pick<
      UniNamespace.NavigateToOptions,
      'animationType' | 'animationDuration'
    >
  ) {
    const { fullPath, isTabBar } = route
    if (type === 'replace') {
      if (isTabBar) {
        return uni.switchTab({
          url: fullPath
        })
      }
      return uni.redirectTo({
        url: fullPath
      })
    }
    if (type === 'push') {
      if (isTabBar) {
        return uni.switchTab({
          url: fullPath
        })
      }
      return uni.navigateTo({
        url: fullPath,
        ...options
      })
    }
    if (type === 'relaunch') {
      return uni.reLaunch({
        url: fullPath
      })
    }
    throw new Error(`[router] Invalid handleGuard type: ${type}`)
  }
  /**
   * 处理路由守卫
   * @param listeners
   * @param to
   * @param from
   * @returns
   */
  async handleGuard(
    listeners: RouterBeforeListener[],
    to?: RouteResolved,
    from?: RouteResolved
  ): Promise<boolean | undefined> {
    const listener = listeners.pop()
    if (!listener) {
      return
    }
    const res = await listener.guard(to, from)
    if (res === undefined || res === true) {
      return this.handleGuard(listeners, to, from)
    }
    if (res === false) {
      return false
    }
    const toRoute = this.resolve(res)
    if (!toRoute) {
      throw new Error(`[router] Invalid route in router navigation: ${res}`)
    }
    this.push(toRoute)
    return false
  }
  /**
   * 处理前置守卫
   * @param to
   * @param from
   * @returns
   */
  handleBeforeGuard(to?: RouteResolved, from?: RouteResolved) {
    const beforeListener = <RouterBeforeListener[]>(
      this.listener.filter((listener) => listener.type === 'before')
    )
    return this.handleGuard(beforeListener, to, from)
  }
  /**
   * 处理后置守卫
   * @param to
   * @param from
   * @param err
   */
  handleAfterGuard(to?: RouteResolved, from?: RouteResolved, err?: any) {
    const afterListener = <RouterAfterListener[]>(
      this.listener.filter((listener) => listener.type === 'after')
    )
    afterListener.forEach((listener) => listener.guard(to, from, err))
  }
  /**
   * 安装到Vue应用
   * @param app
   * @param options
   */
  install(app: App, ...options: any[]) {
    app.config.globalProperties.$router = this
  }
}

/**
 * 路由
 * @returns
 */
export const useRouter = () => {
  return <Router>(
    getCurrentInstance()!.appContext.config.globalProperties.$router
  )
}

/**
 * 路由路径
 * @returns
 * @example
 * ```ts
 * import { useRouter, useRoute } from '@/utils/router'
 * const router = useRouter()
 * const route = useRoute()
 *
 * onLoad(()=>{
 * // 必须在 onLoad 生命周期中才能获取路由参数
 * console.log(route.query)
 * })
 * ```
 */
export const useRoute = <
  T extends Record<string, any> = Record<string, any>
>() => {
  const page = getCurrentPages().pop()!
  const router = useRouter()
  const route = ref(router.resolve<T>(page.route)!)
  onLoad((query) => {
    if (!route.value) {
      return
    }
    route.value.query = <UnwrapRef<T>>decodeQuery<T>(query)
  })
  return route
}
