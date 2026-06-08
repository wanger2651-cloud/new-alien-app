/**
 * 防抖
 * @param func
 * @param time
 * @returns
 */
export const debounce = <T extends any[], P>(
  func: (...args: T) => P,
  time: number = 300
) => {
  let timeout = -1
  return function <K>(this: K, ...args: T) {
    return new Promise<Awaited<P>>((resolve, reject) => {
      clearTimeout(timeout)
      // @ts-ignore
      timeout = setTimeout(async () => {
        try {
          resolve(await func.apply(this, args))
        } catch (err) {
          reject(err)
        }
      }, time)
    })
  }
}

/**
 * 节流
 * @param func
 * @param time
 * @returns
 */
export const throttle = <T extends any[], P>(
  func: (...args: T) => P,
  time: number = 300
) => {
  let canRun = true
  return function <K>(this: K, ...args: T) {
    return new Promise<Awaited<P>>((resolve) => {
      if (!canRun) {
        return
      }
      canRun = false
      setTimeout(async () => {
        resolve(await func.apply(this, args))
        canRun = true
      }, time)
    })
  }
}

/**
 * 创建id
 * @param length 长度
 * @returns
 */
export const createRandomId = (length: number): string => {
  const id = Math.random()
    .toString(16)
    .slice(2, length + 2)
  const restLength = length - id.length
  if (!restLength) {
    return id
  }
  return `${id}${createRandomId(restLength)}`
}
