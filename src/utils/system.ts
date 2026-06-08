import permission from './permission'

/**
 * 检查定位权限
 * @returns
 */
export const checkLocationPermission = async () => {
  const settings = uni.getAppAuthorizeSetting()
  return settings.locationAuthorized === 'authorized'
}

/**
 * 检查定位服务
 * @returns
 */
export const checkLocationService = () => {
  return permission.checkSystemEnableLocation()
}

/**
 * 请求定位权限
 * @returns
 */
export const requestLocationPermission = async () => {
  const systemType = uni.getSystemInfoSync().platform
  // 安卓
  if (systemType === 'android') {
    const res = await permission.requestAndroidPermission(
      'android.permission.ACCESS_FINE_LOCATION'
    )
    return res === 1
  }
  // IOS
  if (systemType === 'ios') {
    return permission.judgeIosPermission('location')
  }
  throw new Error('unknown platform')
}

/**
 * 开启定位权限
 */
export const openLocationPermission = () => {
  permission.gotoAppPermissionSetting()
  return new Promise<void>((resolve, reject) => {
    const timer = setInterval(async () => {
      const enabled = await checkLocationPermission()
      if (!enabled) {
        return
      }
      clearTimeout(timeout)
      clearInterval(timer)
      resolve()
    }, 100)
    const timeout = setTimeout(() => {
      clearInterval(timer)
      reject()
    }, 10000)
  })
}

/**
 * 开启定位服务
 */
export const openLocationService = () => {
  const main: any = plus.android.runtimeMainActivity()
  const Intent: any = plus.android.importClass('android.content.Intent')
  const Settings: any = plus.android.importClass('android.provider.Settings')
  const intent: any = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
  main.startActivity(intent)
  return new Promise<void>((resolve, reject) => {
    const timer = setInterval(() => {
      const enabled = checkLocationService()
      if (!enabled) {
        return
      }
      clearTimeout(timeout)
      clearInterval(timer)
      resolve()
    }, 100)
    const timeout = setTimeout(() => {
      clearInterval(timer)
      reject()
    }, 10000)
  })
}
