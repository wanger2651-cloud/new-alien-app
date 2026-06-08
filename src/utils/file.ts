/**
 * 文件根目录类型
 */
export enum IFileRootType {
  PRIVATE_WWW = 1,
  PRIVATE_DOC,
  PUBLIC_DOCUMENTS,
  PUBLIC_DOWNLOADS
}

/**
 * 文件格式
 */
export type IFileFormat = 'text' | 'base64'

/**
 * 文件管理器配置
 */
export type IFileManagerOptions = {
  type?: IFileRootType
  path?: string
}

/**
 * 获取文件系统根目录
 * @param type 文件根目录类型
 * @returns
 */
export const getFileSystemEntry = (type: IFileRootType) => {
  return new Promise<PlusIoDirectoryEntry>((resolve, reject) => {
    // 请求本地文件系统对象
    plus.io.requestFileSystem(
      type,
      (fs) => {
        if (!fs.root) {
          reject(new Error('get file system failed: root error'))
          return
        }
        resolve(fs.root)
      },
      (err) => reject(new Error(`get file root failed: ${err.message}`))
    )
  })
}

/**
 * 获取本地文件 / 文件夹操作对象
 * @param path 路径
 * @returns
 */
export const getLocalEntry = async <
  T extends PlusIoFileEntry | PlusIoDirectoryEntry
>(
  path: string
) => {
  return new Promise<T>((resolve, reject) => {
    plus.io.resolveLocalFileSystemURL(
      path,
      (entry) => resolve(<T>entry),
      (err) => reject(new Error(`get local entry failed: ${err.message}`))
    )
  })
}

/**
 * 获取父文件夹操作对象
 * @param entry 文件 / 文件夹操作对象
 * @returns
 */
export const getParentEntry = async (
  entry: PlusIoFileEntry | PlusIoDirectoryEntry
) => {
  return new Promise<PlusIoDirectoryEntry>((resolve, reject) => {
    entry.getParent(resolve, (err) =>
      reject(new Error(`get parent entry failed: ${err.message}`))
    )
  })
}

/**
 * 读取文件操作对象
 * @param fileEntry 文件操作对象
 * @param format 格式
 * @returns
 */
export const readFileEntry = async (
  fileEntry: PlusIoFileEntry,
  format: IFileFormat = 'text'
) => {
  const file = await getFile(fileEntry)
  return new Promise<string>((resolve, reject) => {
    const fileReader = new plus.io.FileReader()
    fileReader.onload = async (e) => {
      const data = fileReader.result
      if (!data) {
        reject(
          new Error('read file entry failed: fileReader.result is undefined')
        )
        return
      }
      resolve(data)
    }
    fileReader.onerror = () => {
      reject(new Error('read file entry failed: read error'))
    }
    if (format === 'text') {
      fileReader.readAsText(file)
      return
    }
    if (format === 'base64') {
      fileReader.readAsDataURL(file)
      return
    }
    reject(new Error('read file entry failed: unknown format'))
  })
}

/**
 * 写入文件操作对象
 * @param fileEntry 文件操作对象
 * @param data 数据
 * @param format 格式
 * @returns
 */
export const writeFileEntry = async (
  fileEntry: PlusIoFileEntry,
  data: string,
  format: IFileFormat = 'text'
) => {
  return new Promise<void>((resolve, reject) => {
    fileEntry.createWriter(
      (writer) => {
        writer.onwrite = () => {
          resolve()
        }
        writer.onerror = () => {
          reject(new Error('write file entry failed: write error'))
        }
        if (format === 'text') {
          writer.write(data)
          return
        }
        if (format === 'base64') {
          const base64 = data.replace(/^data:.*;base64,/, '')
          writer.writeAsBinary(base64)
          return
        }
        reject(new Error('read file entry failed: unknown format'))
      },
      (err) => {
        reject(new Error(`write file entry failed: ${err.message}`))
      }
    )
  })
}

/**
 * 移动文件 / 文件夹操作对象
 * @param srcEntry 源文件 / 文件夹操作对象
 * @param destEntry 目标文件 / 文件夹操作对象
 * @returns
 */
export const moveEntry = async (
  srcEntry: PlusIoFileEntry | PlusIoDirectoryEntry,
  destEntry: PlusIoDirectoryEntry
) => {
  return new Promise<void>((resolve, reject) => {
    srcEntry.moveTo(
      destEntry,
      undefined,
      () => resolve(),
      (err) => reject(new Error(`move entry failed: ${err.message}`))
    )
  })
}

/**
 * 复制文件 / 文件夹操作对象
 * @param srcEntry 源文件 / 文件夹操作对象
 * @param destEntry 目标文件 / 文件夹操作对象
 * @returns
 */
export const copyEntry = async (
  srcEntry: PlusIoFileEntry | PlusIoDirectoryEntry,
  destEntry: PlusIoDirectoryEntry
) => {
  return new Promise<void>((resolve, reject) => {
    srcEntry.copyTo(
      destEntry,
      undefined,
      () => resolve(),
      (err) => reject(new Error(`copy entry failed: ${err.message}`))
    )
  })
}

/**
 * 删除文件 / 文件夹操作对象
 * @param entry 文件 / 文件夹操作对象
 * @returns
 */
export const removeEntry = async (
  entry: PlusIoFileEntry | PlusIoDirectoryEntry
) => {
  return new Promise<void>((resolve, reject) => {
    entry.remove(
      () => resolve(),
      (err) => reject(new Error(`remove entry failed: ${err.message}`))
    )
  })
}

/**
 * 递归删除文件夹操作对象
 * @param directoryEntry 文件夹操作对象
 * @returns
 */
export const removeRecursiveEntry = async (
  directoryEntry: PlusIoDirectoryEntry
) => {
  return new Promise<void>((resolve, reject) => {
    directoryEntry.removeRecursively(
      () => resolve(),
      (err) =>
        reject(new Error(`remove Recursive entry failed: ${err.message}`))
    )
  })
}

/**
 * 获取文件操作对象
 * @param root 根目录操作对象
 * @param path 路径
 * @param flag 操作配置
 * @returns
 */
export const getFileEntry = async (
  root: PlusIoDirectoryEntry,
  path: string,
  flag: PlusIoFlags = { create: false, exclusive: false }
) => {
  return new Promise<PlusIoFileEntry>((resolve, reject) => {
    root.getFile(path, flag, resolve, (err) =>
      reject(new Error(`get file entry failed: ${err.message}`))
    )
  })
}

/**
 * 获取文件夹操作对象
 * @param root 根目录操作对象
 * @param path 路径
 * @param flag 操作配置
 * @returns
 */
export const getDirectoryEntry = async (
  root: PlusIoDirectoryEntry,
  path: string,
  flag: PlusIoFlags = { create: false, exclusive: false }
) => {
  return new Promise<PlusIoDirectoryEntry>((resolve, reject) => {
    root.getDirectory(path, flag, resolve, (err) =>
      reject(new Error(`get directory entry failed: ${err.message}`))
    )
  })
}

/**
 * 写入文件
 * @param root 根目录操作对象
 * @param path 路径
 * @param data 数据
 * @param format 格式
 * @returns
 */
export const writeFile = async (
  root: PlusIoDirectoryEntry,
  path: string,
  data: string,
  format: IFileFormat = 'text'
) => {
  const fileEntry = await getFileEntry(root, path, {
    create: true
  })
  await writeFileEntry(fileEntry, data, format)
  return fileEntry
}

/**
 * 获取文件
 * @param fileEntry 文件操作对象
 * @returns
 */
export const getFile = async (fileEntry: PlusIoFileEntry) => {
  return new Promise<PlusIoFile>((resolve, reject) => {
    fileEntry.file(resolve, (err) =>
      reject(new Error(`get file failed: ${err.message}`))
    )
  })
}

/**
 * 读取文件
 * @param root 根目录操作对象
 * @param path 路径
 * @param format 格式
 * @returns
 */
export const readFile = async (
  root: PlusIoDirectoryEntry,
  path: string,
  format: IFileFormat = 'text'
) => {
  const fileEntry = await getFileEntry(root, path)
  return readFileEntry(fileEntry, format)
}

/**
 * 移动文件
 * @param root 根目录操作对象
 * @param src 源路径
 * @param dest 目标路径
 * @param force 强制
 * @returns
 */
export const moveFile = async (
  root: PlusIoDirectoryEntry,
  src: string,
  dest: string,
  force?: boolean
) => {
  const srcFileEntry = await getFileEntry(root, src)
  const destDirectoryEntry = await getDirectoryEntry(root, dest)
  if (force) {
    try {
      const destDirectory = destDirectoryEntry.toLocalURL()
      const destPath = `${destDirectory}${srcFileEntry.name}`
      const destEntry = await getLocalEntry(destPath)
      if (destEntry.isFile || !destEntry.isDirectory) {
        await removeEntry(destEntry)
      }
    } catch (err) {}
  }
  return moveEntry(srcFileEntry, destDirectoryEntry)
}

/**
 * 复制文件
 * @param root 根目录操作对象
 * @param src 源路径
 * @param dest 目标路径
 * @param force 强制
 * @returns
 */
export const copyFile = async (
  root: PlusIoDirectoryEntry,
  src: string,
  dest: string,
  force?: boolean
) => {
  const srcFileEntry = await getFileEntry(root, src)
  const destDirectoryEntry = await getDirectoryEntry(root, dest)
  if (force) {
    try {
      const destDirectory = destDirectoryEntry.toLocalURL()
      const destPath = `${destDirectory}${srcFileEntry.name}`
      const destEntry = await getLocalEntry(destPath)
      if (destEntry.isFile || !destEntry.isDirectory) {
        await removeEntry(destEntry)
      }
    } catch (err) {}
  }
  return copyEntry(srcFileEntry, destDirectoryEntry)
}

/**
 * 删除文件
 * @param root 根目录操作对象
 * @param path 路径
 * @returns
 */
export const removeFile = async (root: PlusIoDirectoryEntry, path: string) => {
  const fileEntry = await getFileEntry(root, path)
  return removeEntry(fileEntry)
}

/**
 * 创建文件夹
 * @param root 根目录操作对象
 * @param path 路径
 */
export const createDirectory = (root: PlusIoDirectoryEntry, path: string) => {
  return getDirectoryEntry(root, path, { create: true })
}

/**
 * 读取文件夹中的所有文件和子目录
 * @param root 根目录操作对象
 * @param path 路径
 * @returns
 */
export const readDirectory = async (
  root: PlusIoDirectoryEntry,
  path: string
) => {
  const directoryEntry = await getDirectoryEntry(root, path)
  const directoryReader = directoryEntry.createReader()
  return new Promise<(PlusIoFileEntry | PlusIoDirectoryEntry)[]>(
    (resolve, reject) => {
      directoryReader.readEntries(
        (entries: any) => {
          resolve(entries)
        },
        (err) => {
          reject(new Error(`read directory failed: ${err.message}`))
        }
      )
    }
  )
}

/**
 * 移动文件夹
 * @param root 根目录操作对象
 * @param src 源路径
 * @param dest 目标路径
 * @param force 强制
 * @returns
 */
export const moveDirectory = async (
  root: PlusIoDirectoryEntry,
  src: string,
  dest: string,
  force?: boolean
) => {
  const srcDirectoryEntry = await getFileEntry(root, src)
  const destDirectoryEntry = await getDirectoryEntry(root, dest)
  if (force) {
    try {
      const destDirectory = destDirectoryEntry.toLocalURL()
      const destPath = `${destDirectory}${srcDirectoryEntry.name}`
      const destEntry = await getLocalEntry(destPath)
      if (destEntry.isDirectory || !destEntry.isFile) {
        await removeRecursiveEntry(<PlusIoDirectoryEntry>destEntry)
      }
    } catch (err) {}
  }
  return moveEntry(srcDirectoryEntry, destDirectoryEntry)
}

/**
 * 复制文件夹
 * @param root 根目录操作对象
 * @param src 源路径
 * @param dest 目标路径
 * @param force 强制
 * @returns
 */
export const copyDirectory = async (
  root: PlusIoDirectoryEntry,
  src: string,
  dest: string,
  force?: boolean
) => {
  const srcDirectoryEntry = await getDirectoryEntry(root, src)
  const destDirectoryEntry = await getDirectoryEntry(root, dest)
  if (force) {
    try {
      const destDirectory = destDirectoryEntry.toLocalURL()
      const destPath = `${destDirectory}${srcDirectoryEntry.name}`
      const destEntry = await getLocalEntry(destPath)
      if (destEntry.isDirectory || !destEntry.isFile) {
        await removeRecursiveEntry(<PlusIoDirectoryEntry>destEntry)
      }
    } catch (err) {}
  }
  return copyEntry(srcDirectoryEntry, destDirectoryEntry)
}

/**
 * 删除文件夹
 * @param root 根目录操作对象
 * @param path 路径
 * @param recursive 递归
 * @returns
 */
export const removeDirectory = async (
  root: PlusIoDirectoryEntry,
  path: string,
  recursive?: boolean
) => {
  const directoryEntry = await getDirectoryEntry(root, path)
  if (recursive) {
    return removeRecursiveEntry(directoryEntry)
  }
  return removeEntry(directoryEntry)
}

/**
 * 创建文件管理器
 * @param type 文件根目录类型
 * @returns
 */
export const getFileRoot = async (options: IFileManagerOptions) => {
  const { type, path } = options
  if (path) {
    const entry = await getLocalEntry(path)
    if (entry.isFile || !entry.isDirectory) {
      throw new Error(`get file root failed: ${path} is not a directory`)
    }
    return <PlusIoDirectoryEntry>entry
  }
  if (type) {
    return getFileSystemEntry(type)
  }
  throw new Error(`get file root failed: type or path is required`)
}

/**
 * 创建文件管理器
 * @param type 文件根目录类型
 * @returns
 */
export const createFileSystemManager = async (options: IFileManagerOptions) => {
  const root = await getFileRoot(options)
  const handler =
    <T, K extends any[]>(
      callback: (root: PlusIoDirectoryEntry, ...args: K) => T
    ) =>
    (...args: K) =>
      callback(root, ...args)
  return {
    /**
     * 获取文件操作对象
     * @param path — 路径
     * @param flag — 操作配置
     */
    getFileEntry: handler(getFileEntry),
    /**
     * 获取文件夹操作对象
     * @param path — 路径
     * @param flag — 操作配置
     */
    getDirectoryEntry: handler(getDirectoryEntry),
    /**
     * 读取文件
     * @param path 路径
     * @param format 格式
     * @returns
     */
    readFile: handler(readFile),
    /**
     * 移动文件
     * @param src 源路径
     * @param dest 目标路径
     * @param force 强制
     * @returns
     */
    moveFile: handler(moveFile),
    /**
     * 移动文件
     * @param src 源路径
     * @param dest 目标路径
     * @param force 强制
     * @returns
     */
    copyFile: handler(copyFile),
    /**
     * 删除文件
     * @param path 路径
     * @returns
     */
    removeFile: handler(removeFile),
    /**
     * 写入文件
     * @param path 路径
     * @param data
     * @param format 格式
     * @returns
     */
    writeFile: handler(writeFile),
    /**
     * 创建文件夹
     * @param path 路径
     * @returns
     */
    createDirectory: handler(createDirectory),
    /**
     * 创建文件夹
     * @param path 路径
     * @returns
     */
    readDirectory: handler(readDirectory),
    /**
     * 移动文件夹
     * @param src 源路径
     * @param dest 目标路径
     * @param force 强制
     * @returns
     */
    moveDirectory: handler(moveDirectory),
    /**
     * 移动文件夹
     * @param src 源路径
     * @param dest 目标路径
     * @param force 强制
     * @returns
     */
    copyDirectory: handler(copyDirectory),
    /**
     * 删除文件夹
     * @param path 路径
     * @param recursive 递归
     * @returns
     */
    removeDirectory: handler(removeDirectory)
  }
}
