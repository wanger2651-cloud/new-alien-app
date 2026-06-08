import type { BaseFileItem } from '@/types/file'
import { IFileRootType, createFileSystemManager } from './file'

/**
 * file转base64
 *
 * @param file
 * @returns
 */
export const fileToDataURL = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      resolve(<string>fileReader.result)
    }
    fileReader.onerror = () => {
      reject(new Error(`file to dataURL failed: ${fileReader.error!.name}`))
    }
    fileReader.readAsDataURL(file)
  })
}

/**
 * file转text
 *
 * @param file
 * @returns
 */
export const fileToText = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      resolve(<string>fileReader.result)
    }
    fileReader.onerror = () => {
      reject(new Error(`file to text failed: ${fileReader.error!.name}`))
    }
    fileReader.readAsText(file)
  })
}

/**
 * file转arraybuffer
 *
 * @param file
 * @returns
 */
export const fileToArrayBuffer = (file: File) => {
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      resolve(<ArrayBuffer>fileReader.result)
    }
    fileReader.onerror = () => {
      reject(new Error(`file to arrayBuffer failed: ${fileReader.error!.name}`))
    }
    fileReader.readAsArrayBuffer(file)
  })
}

/**
 * 文件项转临时路径
 *
 * @param file
 * @returns
 */
export const fileItemToTempPath = async (fileItem: BaseFileItem) => {
  const fs = await createFileSystemManager({
    type: IFileRootType.PRIVATE_DOC
  })
  if (fileItem.dataURL) {
    const filePath = `uniapp_temp/${fileItem.name}`
    const entry = await fs.writeFile(filePath, fileItem.dataURL, 'base64')
    return entry.toLocalURL()
  }
  if (fileItem.url) {
    const res = await uni.downloadFile({
      url: fileItem.url
    })
    return res.tempFilePath
  }
  throw new Error('文件项转临时路径失败')
}

/**
 * arraybuffer转base64
 *
 * @param arrayBuffer
 * @returns
 */
export const arrayBufferToDataURL = (
  arrayBuffer: ArrayBuffer,
  type: string
) => {
  let binary = ''
  const bytes = new Uint8Array(arrayBuffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const data = btoa(binary)
  return `data:${type};base64,${data}`
}

/**
 * base64转arrayBuffer
 * @param dataURL base64
 */
export const dataURLToArrayBuffer = (dataURL: string) => {
  const matchedData = dataURL.match(/^data:(.+);base64,(.+)$/)
  if (!matchedData) {
    // wrong format
    throw new Error('base64 format required')
  }
  const [_, type, data] = matchedData
  const binary = atob(data)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const arrayBuffer = bytes.buffer
  return {
    type,
    arrayBuffer
  }
}

/**
 * base64转file
 *
 * @param dataURL
 * @param name
 * @returns
 */
export const dataURLToFile = (dataURL: string, name: string) => {
  const { type, arrayBuffer } = dataURLToArrayBuffer(dataURL)
  return new File([arrayBuffer], name, { type })
}
