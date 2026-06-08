export interface PagingResult<T extends any[]> {
  total: number
  list: T
}

export interface PagingOptions {
  pageNo?: number
  pageSize?: number
}

/**
 * 创建分页
 * @param callback
 * @param options
 * @returns
 */
export const createPaging = <T extends any[], K extends any[]>(
  callback: (
    paging: { pageNo: number; pageSize: number },
    ...args: T
  ) => Promise<PagingResult<K>>,
  options?: PagingOptions
) => {
  let pageNo = options?.pageNo || 1
  let pageSize = options?.pageSize || 20
  let data = <K>(<any>[])
  let done = false
  return async (more: boolean, ...args: T) => {
    if (!more) {
      pageNo = options?.pageNo || 1
      pageSize = options?.pageSize || 20
      data = <K>(<any>[])
      done = false
    }
    if (done) {
      return {
        data,
        done
      }
    }
    const { total, list } = await callback({ pageNo, pageSize }, ...args)
    data = <K>(<any>[...data, ...list])
    done = pageNo >= Math.ceil(total / pageSize)
    done || pageNo++
    return {
      data,
      done
    }
  }
}
