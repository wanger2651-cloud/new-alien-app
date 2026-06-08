export interface TimerOptions {
  duration: number
  interval?: number
  callback?: (current: number, options: TimerOptions) => void
}

/**
 * 创建定时器
 * @param options 配置
 * @returns
 */
export const createTimer = (options: TimerOptions) => {
  const { duration, interval = 1000, callback } = options
  const totalCount = ~~(duration / interval)

  let count = 0
  let timer = -1
  let paused = false

  const start = () => {
    count = totalCount
    paused = false
    clearInterval(timer)
    return new Promise<void>((resolve, reject) => {
      if (!count) {
        resolve()
        return
      }
      if (count < 0) {
        reject(new Error('Invalid timer options!'))
        return
      }
      const handler = () => {
        // 暂停
        if (paused) {
          return
        }
        callback && callback(count, options)

        // 计时结束
        if (!count) {
          clearInterval(timer)
          resolve()
        }
        count--
      }
      // @ts-ignore
      timer = setInterval(handler, interval)
      handler()
    })
  }
  const pause = () => (paused = true)
  const resume = () => (paused = false)
  const cancel = () => clearInterval(timer)
  return { start, pause, resume, cancel }
}
