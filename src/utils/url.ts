import { objCustomMap } from './object'

/**
 * 编码查询参数
 * @param data 数据
 * @returns
 */
export const encodeQuery = (data?: Record<string, any>) => {
  // 请求参数不存在
  if (!data || !Object.keys(data).length) {
    return ''
  }
  return `?${Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(
      ([key, value]) => `${key}=${encodeURIComponent(JSON.stringify(value))}`
    )
    .join('&')}`
}

/**
 * 创建页面链接
 * @param name 页面名称
 * @param data 数据
 * @returns
 */
export const createPageUrl = (name: string, data?: Record<string, any>) => {
  return `/pages/${name}/${name}${encodeQuery(data)}`
}

/**
 * 解码查询参数
 * @param query 查询参数
 * @param parser 转换
 * @returns
 */
export const decodeQuery = <
  T extends Record<string, any> = Record<string, any>
>(
  query?: Record<string, any>,
  parser?: (k: string, v: any) => any
) => {
  if (!query) {
    return {}
  }
  return <T>objCustomMap(query, ([k, v]) => {
    // 解码值
    let decodedVal
    try {
      decodedVal = JSON.parse(decodeURIComponent(v))
    } catch (e) {
      console.warn(`Failed to parse query parameter "${k}":`, e)
      // 如果解析失败，返回原始值
      decodedVal = decodeURIComponent(v)
    }
    // 不转换
    if (!parser) {
      return [k, decodedVal]
    }
    // 自定义转换
    return [k, parser(k, decodedVal)]
  })
}

/**
 * 转化URL
 * @param url
 * @returns
 */
export const parserURL = (
  url: string
): { path: string; query?: Record<string, any> } => {
  const [path, search] = url.split('?')
  if (!search) {
    return {
      path
    }
  }
  const query = <Record<string, any>>(
    Object.fromEntries(
      search.split('&').map((item) => {
        const [key, ...valueParts] = item.split('=')
        const value = valueParts.length > 0 ? valueParts.join('=') : ''
        return [decodeURIComponent(key), decodeURIComponent(value)]
      })
    )
  )
  return {
    path,
    query
  }
}
