/**
 * 对象过滤
 * @param obj 对象
 * @param callback 过滤回调
 * @returns
 */
export const objCustomFilter = (
  obj: Record<string, any>,
  callback: (value: [string, any]) => any
) => {
  return Object.fromEntries(Object.entries(obj).filter(callback))
}

/**
 * 对象映射
 * @param obj 对象
 * @param callback 映射回调
 * @returns
 */
export const objCustomMap = (
  obj: Record<string, any>,
  callback: (value: [string, any]) => any
) => {
  return Object.fromEntries(Object.entries(obj).map(callback))
}
