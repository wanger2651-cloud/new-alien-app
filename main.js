// src-electron/main.js

// 设置控制台输出编码为 UTF-8（解决 Windows 中文乱码问题）
if (process.platform === 'win32') {
  try {
    // 尝试设置控制台代码页为 UTF-8 (65001)
    require('child_process').execSync('chcp 65001', { stdio: 'ignore' })
  } catch (e) {
    // 忽略错误
  }
  // 设置 stdout 编码
  if (process.stdout && process.stdout.setEncoding) {
    process.stdout.setEncoding('utf8')
  }
  if (process.stderr && process.stderr.setEncoding) {
    process.stderr.setEncoding('utf8')
  }
}

const { app, BrowserWindow, ipcMain, session, dialog, Menu, clipboard, webContents, shell } = require('electron')
const { join } = require('node:path')
const path = require('node:path')
const logger = require('electron-log')
// const sharp = require('sharp')
const https = require('node:https')
const http = require('node:http')
const { spawn, spawnSync, execSync } = require('node:child_process')
const os = require('node:os')
const axios = require('axios')
const fs = require('node:fs')
const crypto = require('crypto')
const ExcelJS = require('exceljs') // 引入 ExcelJS 库
const SunnyNet = require('../SunnyNet/SunnyNet.js')
const { FsterDll } = require('../SunnyNet/FsterDllService.js');
const { CheckCertificate, installCertificateInMacOS } = require('../SunnyNet/darwinProxy.js')
const { HTTPEvent } = require('../SunnyNet/Event.js')
const { checkForUpdates, startDownloadUpdate } = require('./autoUpdater.js')
const { injectScript } = require('./js/executeScript.js')
const webResourceUpdater = require('./webResourceUpdater.js')
const port = 8084
const os_type = os.type()

const isWindows = os_type === 'Windows_NT'
const isMac = os_type === 'Darwin'

// const { execSync } = require('child_process');
// 屏蔽安全警告
// ectron Security Warning (Insecure Content-Security-Policy)
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

// 微信工作包管理相关变量
let wxProcess = null
const AdmZip = require('adm-zip')

// 微信版本 MD5 校验值
const EXPECTED_WECHAT_MD5 = 'ad79791d8e891929b06b0dbb26726552'

// 保存下载的微信工作包信息（用于版本回退）
const wxWorkPackageCache = {
  zipPath: null,      // 最近下载的 zip 文件路径
  extractDir: null    // 最近解压的目录
}

/**
 * 计算文件的 MD5 值
 * @param {string} filePath 文件路径
 * @returns {Promise<string>} MD5 值（小写）
 */
function calculateFileMD5(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('md5')
    const stream = fs.createReadStream(filePath)

    stream.on('data', data => hash.update(data))
    stream.on('end', () => resolve(hash.digest('hex').toLowerCase()))
    stream.on('error', reject)
  })
}

// 微信消息服务器管理
const { WxMessageServerManager } = require('./WxMessageServer.js')
const messageServerManager = new WxMessageServerManager()

// 全局配置（供消息处理器使用）
global.appConfig = {
  baseUrl: 'http://localhost:5265',
  token: ''
}

// 消息服务器端口管理
const MESSAGE_SERVER_PORT_START = 19099
const MESSAGE_SERVER_PORT_END = 19198
const usedMessagePorts = new Set()

/**
 * 检查端口是否可用
 * @param {number} port
 * @returns {Promise<boolean>}
 */
function isPortAvailable(port) {
  const net = require('net')

  return new Promise((resolve) => {
    const server = net.createServer()

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false) // 端口被占用
      } else {
        resolve(false) // 其他错误也视为不可用
      }
    })

    server.once('listening', () => {
      server.close(() => {
        resolve(true) // 端口可用
      })
    })

    server.listen(port, '127.0.0.1')
  })
}

/**
 * 查找可用的消息服务器端口
 * @returns {Promise<number>}
 */
async function findAvailableMessagePort() {
  for (let port = MESSAGE_SERVER_PORT_START; port <= MESSAGE_SERVER_PORT_END; port++) {
    if (!usedMessagePorts.has(port) && await isPortAvailable(port)) {
      usedMessagePorts.add(port)
      return port
    }
  }
  throw new Error('没有可用的消息服务器端口')
}

/**
 * 释放消息服务器端口
 * @param {number} port
 */
function releaseMessagePort(port) {
  usedMessagePorts.delete(port)
}

let proxyServer = null
let win = null
// 创建浏览器窗口时，调用这个函数。
const createWindow = () => {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    icon: join(__dirname, '../public/logo.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      webviewTag: true,
      webSecurity: false,
      nativeWindowOpen: true,
      backgroundThrottling: false
    }
  })
  // win.loadURL('http://localhost:3000')
  // development模式
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // 开启调试台
    win.webContents.openDevTools()
  } else {
    // 使用 Web 资源更新模块获取资源路径（优先使用外部更新资源）
    const indexPath = webResourceUpdater.getResourcePath()
    win.loadURL(`file://${indexPath.replace(/\\/g, '/')}`)
  }

  // 添加窗口焦点事件监听
  win.on('blur', () => {
    // 窗口失去焦点时，通知渲染进程保持连接
    win.webContents.send('window-blur')
  })

  win.on('focus', () => {
    // 窗口获得焦点时，通知渲染进程恢复连接
    win.webContents.send('window-focus')
  })
}

// 禁用 GPU 加速和缓存（避免权限错误）
app.commandLine.appendSwitch('disable-gpu')
app.commandLine.appendSwitch('disable-gpu-compositing')
app.commandLine.appendSwitch('disable-software-rasterizer')
app.commandLine.appendSwitch('disable-dev-shm-usage')
app.commandLine.appendSwitch('no-sandbox')

// 开发模式下跳过单实例锁检查
if (!process.env.VITE_DEV_SERVER_URL) {
  const gotTheLock = app.requestSingleInstanceLock()
  if (gotTheLock) {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (win) {
        if (win.isMinimized()) {
          win.restore()
        }
        win.focus()
        win.show()
      }
    })
  } else {
    console.log('[main] 已有实例在运行，退出当前实例')
    app.quit()
  }
} else {
  console.log('[main] 开发模式：跳过单实例锁检查')
}

ipcMain.handle('start-proxy', async () => {


  FsterDll.Init();

  logger.info('start-proxy...')
  if (isMac) {

    if (CheckCertificate('SunnyNet')) {
      console.log('macos:证书已安装')
    } else {
      console.log(
        'macos:证书未安装,开始安装，请在接下来的命令行和弹窗中输入密码(注意，命令行中输入密码不显示，输入完毕后回车即可)'
      )
      try {
        installCertificateInMacOS()
      } catch (error) {
        console.log('macos:证书安装失败!', error)
      }
    }
  } else {
    let ret = SunnyNet.install_cert_to_system()
    console.log('安装证书', ret)
  }

  iniSunny() //初始化sunnny 可重复调用

  if (isWindows) {
    SunnyNet.process_atName('WeChat.exe')
    SunnyNet.process_atName('wechatweb.exe')
    SunnyNet.process_atName('WechatAppLauncher.exe')
    SunnyNet.process_atName('WeChatAppEx.exe')
    SunnyNet.process_atName('WeChatPlayer.exe')
    SunnyNet.process_atName('WechatBrowser.exe')
    SunnyNet.process_atName('WeChatXFile.exe')
    console.log('进程代理已开启 process is proxy')
  }
  SunnyNet.set_ie_proxy();
  console.log("系统代理已开启 system proxy is enlable");
})
async function HttpCallback(SunnyContext, onlyID, MessageId, type, method, requurl, message, pid) {
  let httpEvent = new HTTPEvent(SunnyContext, onlyID, MessageId, type, method, requurl, message, pid)
  if (type === 1) {
    // 删除Accept-Encoding请求头，防止服务器返回数据被压缩 这个必须加 不然gzip的数据会报错 暂时没能力解决
    httpEvent.__request.removeCompressionMark()
    try {
    } catch (error) {
      console.log('HttpCallback解析失败', error)
    }
  }
  if (type === 2) {
    try {
      // if(请求地址 === "http://localhost:3000/"){ // 测试方法 以免调试输出太多内容
      // console.log("httpEvent.取响应状态码",requurl,httpEvent.__response.getStatusCode());
      // console.log("httpEvent.取响应数据字节集",requurl,httpEvent.__response.body());
      // logger.info("httpEvent.取响应数据自动解码",requurl,httpEvent.__response.bodyAuto());
      // console.log("httpEvent.取响应数据文本",requurl,httpEvent.__response.bodyAutoStr());
      // httpEvent.__response.bodyAutoStr()
      // let bodyBuff = httpEvent.__response.body()
      // console.log(bodyBuff);
      // let bodystr = bodyBuff.toString();
      // console.log(bodystr);
      // bodystr = JSON.parse(bodystr);
      // bodystr.activityId = "3333" // 测试修改参数
      // bodyBuff = Buffer.from(JSON.stringify(bodystr));
      // console.log("httpEvent.修改Body_字节集()",请求地址,httpEvent.__response.setBody(bodyBuff));
      // console.log("httpEvent.修改Bodystr",请求地址,httpEvent.__response.setBodyStr('{"activityId":"111111"}'));
      // console.log("httpEvent.修改请求头",请求地址,httpEvent.__response.setHeader("newHeader","234"));
      // console.log("httpEvent.修改全部请求头",请求地址,httpEvent.__response.setAllHeader("newHeader:456"));
      // console.log("httpEvent.删协议头单条",请求地址,httpEvent.__response.delHeader("Content-Type"));
      // console.log("httpEvent.取全部协议头",请求地址,httpEvent.__response.getAllHeader());
      // console.log("httpEvent.删全部协议头",请求地址,httpEvent.__response.delAllHeader());
      // console.log("httpEvent.取协议头单条",请求地址,httpEvent.__response.getHeader("Content-Type"));
      // }
      // logger.info("httpEvent.取响应数据文本", requurl, httpEvent.__response.bodyAutoStr());
      //console.log("httpEvent.取响应数据文本", requurl, httpEvent.__response.bodyAutoStr());
    } catch (error) {
      console.log('HttpCallback解析失败', error)
    }
  }
  let bodyBuff = httpEvent.__response.bodyAutoStr()
  // logger.info("httpEvent.取响应数据自动解码", requurl, httpEvent.__response.bodyAuto());
  // console.log(bodyBuff,'bodyBuff');
  let requestStr = ''
  try {
    requestStr = await httpEvent.__request.bodyToStr()
  } catch (error) {
    requestStr = "err";
    console.log('HttpCallback解析失败', error)
  }

  win.webContents.send('intercepted-data', {
    url: requurl,
    statusCode: httpEvent.__response.getStatusCode(),
    body: bodyBuff,
    post: requestStr
  })

  // let bodystr = bodyBuff.toString();
  // bodystr = JSON.parse(bodystr);
  // 测试代码  访问精易论坛时跳转到百度
  // if(请求地址 === "https://bbs.125.la/forum.php"){
  //     httpEvent.__request.setUrl("https://www.baidu.com/");
  // }
}
var hasIniSunny = false
function iniSunny() {
  if (hasIniSunny) {
    console.log('sunny is running')
    return
  }
  hasIniSunny = true
  SunnyNet.set_port(port)

  SunnyNet.set_callback(HttpCallback, TcpCallback, WsCallback, UDPCallback)
  let ret = SunnyNet.start()
  if (isWindows) {
    if (!SunnyNet.open_drive(true)) {
      console.log('sunny open_drive-NFAPI error1')
      //process.exit(1)
      if (!SunnyNet.open_drive(false)) {
        console.log('sunny run error2')
      } else {
        console.log('sunny open_drive-Proxifier ok')
      }
    } else {
      console.log('sunny open_drive-NFAPI ok')
    }
  }
  console.log('SunnyNet.start--->', ret)

  if (!SunnyNet.is_script_code_supported()) {
    console.log('脚本代码不支持')
    //process.exit(1)
  } else {
    console.log('当前脚本管理页面:http://127.0.0.1:' + port + '/' + SunnyNet.set_script_page(''))
  }
}

function TcpCallback(SunnyContext) {
  // console.log("TcpCallback", SunnyContext);
}
function WsCallback(SunnyContext) {
  // console.log("WsCallback", SunnyContext);
}
function UDPCallback(SunnyContext) {
  // console.log("UDPCallback", SunnyContext);
}
// 使程序不自动停止
const intervalId = setInterval(() => { }, 10000)
// 监听应用退出事件
app.on('before-quit', () => {
  cleanupProxy()
  // 停止所有消息服务器
  if (messageServerManager) {
    console.log('Stopping all message servers')
    messageServerManager.stopAll()
  }
})

let rendererReady = false

// 监听渲染进程就绪通知
ipcMain.on('renderer-ready', () => {
  console.log('📥 收到渲染进程就绪通知')
  rendererReady = true
  // 渲染进程准备好后立即检查更新
  checkUpdate()
})

app.whenReady().then(() => {
  createWindow()

  // 注册全局网络拦截，处理阿里云函数的下载响应头
  setupGlobalNetworkInterceptor()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Web 资源更新检查（在完整包更新之前执行）
  checkWebResourceUpdate()

  // 备用方案：如果5秒后渲染进程还没准备好，也执行检查更新
  setTimeout(() => {
    if (!rendererReady) {
      console.log('⏰ 超时：渲染进程未就绪，强制检查更新')
      checkUpdate()
    }
  }, 5000)
})

/**
 * 设置全局网络拦截器
 * 拦截阿里云函数的响应，移除导致下载的 Content-Disposition 响应头
 * 并在请求时添加 Authorization 头（使用登录用户的 token）
 */
function setupGlobalNetworkInterceptor() {
  try {
    // 获取默认 session
    const defaultSession = session.defaultSession

    // 拦截请求头 - 添加 Authorization
    defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      const url = details.url

      // 判断是否是阿里云函数域名
      const isAliyunFC = url.includes('.fc.aliyuncs.com') ||
        url.includes('aliyuncs.com') ||
        url.includes('.fcapp.run') ||
        url.includes('fcapp.run')

      if (isAliyunFC) {
        const requestHeaders = details.requestHeaders || {}

        // 使用登录用户的 token
        const userToken = global.appConfig?.token

        if (userToken) {
          // 添加 Authorization 请求头
          requestHeaders['Authorization'] = `Bearer ${userToken}`
        }

        callback({ requestHeaders })
      } else {
        // 非阿里云函数请求，不做修改
        callback({ requestHeaders: details.requestHeaders })
      }
    })

    // 拦截响应头 - 删除 Content-Disposition
    defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const url = details.url

      // 判断是否是阿里云函数域名
      const isAliyunFC = url.includes('.fc.aliyuncs.com') ||
        url.includes('aliyuncs.com') ||
        url.includes('.fcapp.run') ||
        url.includes('fcapp.run')

      if (isAliyunFC) {
        const headers = details.responseHeaders || {}

        // 删除导致下载的响应头
        const headersToRemove = ['content-disposition', 'Content-Disposition']

        for (const key of headersToRemove) {
          if (headers[key]) {
            delete headers[key]
          }
        }

        // 确保 Content-Type 是 text/html
        if (headers['content-type'] || headers['Content-Type']) {
          const contentType = headers['content-type'] || headers['Content-Type']
          if (contentType && Array.isArray(contentType) && contentType[0]) {
            // 如果不是 text/html，尝试修改为 text/html
            if (!contentType[0].includes('text/html')) {
              headers['content-type'] = ['text/html; charset=utf-8']
              delete headers['Content-Type']
            }
          }
        }

        callback({ responseHeaders: headers })
      } else {
        // 非阿里云函数请求，不做修改
        callback({ responseHeaders: details.responseHeaders })
      }
    })
  } catch (error) {
    logger.error('[网络拦截] 注册全局网络拦截器失败:', error)
  }
}

// 检查 Web 资源更新
async function checkWebResourceUpdate() {
  // 开发模式下跳过 Web 资源更新检查
  if (process.env.VITE_DEV_SERVER_URL) {
    logger.info('[启动] 开发模式，跳过 Web 资源更新检查')
    return
  }

  try {
    logger.info('[启动] 开始检查 Web 资源更新')
    // 异步执行，不阻塞应用启动
    await webResourceUpdater.checkForUpdates()
    logger.info('[启动] Web 资源更新检查完成')
  } catch (error) {
    logger.error('[启动] Web 资源更新检查失败:', error)
    // 不影响应用继续启动
  }
}

// 检查完整包更新
function checkUpdate() {
  try {
    // 在开发模式下强制启用更新检查
    if (process.env.VITE_DEV_SERVER_URL) {
      Object.defineProperty(app, 'isPackaged', {
        get() {
          return true
        }
      })
    }

    checkForUpdates(status => {
      console.log('更新状态:', status)
    })
  } catch (error) {
    console.error('检查更新失败:', error)
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// 自定义处理函数 开始--------------------------------------------------------
function bytesToString(bytes) {
  let result = ''
  for (const byte of bytes) {
    result += String.fromCodePoint(byte)
  }
  return result
}
function parseUrl(url) {
  let params = {}
  url
    .substring(url.indexOf('?'))
    .split('&')
    .forEach(v => {
      params[v.split('=')[0]] = v.split('=')[1]
    })
  return params
}
function parseCookie(cookie) {
  const map = new Map()
  for (const item of cookie.split(/\s*;\s*/)) {
    if (item.length === 0) {
      continue
    }
    const [key, value] = item.split(/\s*=\s*/)
    if (key === undefined || value === undefined || key.length === 0) {
      continue
    }
    map.set(key, value)
    // map.set(decodeURIComponent(key), decodeURIComponent(value))
  }
  return map
}
// 统一清理代理的方法
function cleanupProxy() {
  console.log('用户退出 (Ctrl+C)')
  clearInterval(intervalId) // 清除定时器
  SunnyNet.process_cancel_all()
  if (os_type === 'Darwin') {
    // SunnyNet.cancel_ie_proxy()
  }
  SunnyNet.cancel_ie_proxy()
  SunnyNet.open_drive(true)
}
// 图片下载功能
async function downloadImage(imageUrl) {
  try {
    // 弹出保存对话框让用户选择保存位置
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '保存图片',
      defaultPath: path.basename(imageUrl),
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif'] }]
    })
    if (canceled) return
    // 发起 HTTP 请求获取图片数据
    const response = await axios.get(imageUrl, { responseType: 'stream' })
    const writer = fs.createWriteStream(filePath)
    // 将图片流写入文件
    response.data.pipe(writer)
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  } catch (error) {
    console.error('下载失败：', error)
  }
}
// 清理文件夹名称中的非法字符
function sanitizeFolderName(folderName) {
  // Windows 文件系统不允许的字符
  const illegalChars = /[<>:"/\\|?*]/g;
  // 替换非法字符为下划线
  return folderName.replace(illegalChars, '_');
}

// 创建文件夹（如果不存在）
ipcMain.handle('create-folder', async (event, folderPath, folderName) => {
  try {
    // 清理文件夹名称
    const sanitizedName = sanitizeFolderName(folderName);
    const fullPath = path.join(folderPath, sanitizedName);

    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    return {
      success: true,
      message: `Folder created at ${fullPath}`,
      originalName: folderName,
      sanitizedName: sanitizedName
    };
  } catch (error) {
    throw new Error(`Failed to create folder: ${error.message}`);
  }
});
// 自定义处理函数 结束--------------------------------------------------------
// electron处理程序 开始-----------------------------------------------------
ipcMain.handle('open-mt-wm', async (event, row) => {
  let cookies = '-1'
  let url = 'https://e.waimai.meituan.com'
  let website = new BrowserWindow({
    width: 900,
    height: 600,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../public/logo.ico'),
    webPreferences: {
      partition: `partition:${Date.now()}`
    }
  })
  const ses = website.webContents.session
  let temp = {},
    promises = [],
    result = { storetype: 0 }
  if (cookies === '-1') {
    website.loadURL(url)
    if (row.name) website.setTitle(row.name)
    // website.webContents.openDevTools();
    ses.webRequest.onBeforeSendHeaders(
      {
        urls: [
          'https://*/api/poi/*',
          'https://*/v2/sc/index/r/poiInfo/get*',
          'https://*/api/v2/account/homePage*',
          'https://*/gw/login/password*',
          'https://*/gw/login/mobile*',
          "https://*/common/businessStatus"
        ]
      },
      (details, callback) => {
        let info
        let postObj
        var ckStr = details.requestHeaders.Cookie
        if (ckStr && ckStr.indexOf("wmPoiId=") != -1 && ckStr.indexOf("token=") != -1) {
          result.cookies = ckStr;
        }

        if (details.url.includes('gw/login/password')) {
          if (details.method === 'POST') {
            const postData = details.uploadData.map(data => {
              return data.bytes.toString('utf8')
            })
            postObj = JSON.parse(postData)
            info = { u: postObj.login, p: postObj.password, type: 1 }
            result.info = info
          }
        } else if (details.url.includes('gw/login/mobile') && details.method === 'POST') {
          const postData = details.uploadData.map(data => {
            return data.bytes.toString('utf8')
          })
          postObj = JSON.parse(postData)
          info = { phon: postObj.mobile, code: postObj.smsCode, type: 2 }
          result.info = info
        }
        callback({ cancel: false, requestHeaders: details.requestHeaders })
      }
    )
    promises.push(
      new Promise(resolve => {
        //  https://yiyao.meituan.com/common/businessStatus
        ses.webRequest.onCompleted({ urls: ['https://*/api/*', 'https://*/v2/*', 'https://*/common/*'] }, async details => {
          if (details.url.includes('poi/poiList?ignoreSetRouterProxy') && !Object.keys(temp).includes('poi/poiList')) {
            result.storetype = 1
            temp['poi/poiList'] = true
            let urlParams = bytesToString(details.uploadData[0]['bytes'])
            const resp = await details.webContents.executeJavaScript(`
              const formData = new FormData();
              "${urlParams}".split('&').forEach(value => {
                formData.append(value.split('=')[0], value.split('=')[1]);
              })
              fetch('${details.url}',{method: 'POST', body: formData}).then(resp=>resp.json());
            `)
            result['meituan_stores'] = resp
          }
          if (details.url.includes('account/homePage') && !Object.keys(temp).includes('account/homePage')) {
            await details.webContents.executeJavaScript(injectScript)
            const resp = await details.webContents.executeJavaScript(`fetch('${details.url}').then(resp=>resp.json())`)
            result.storename = resp.data.wmPoiName
            result.account = resp.data.acctName
            result.storestatus = resp.data.wmPoiStatusDesc
            result.checkurl = details.url
            result.storeid = parseUrl(details.url)['acctId']
            let url1 = `https://e.waimai.meituan.com/v2/shop/manage/shopInfo?region_id=${resp.data.regionId}&region_version=${resp.data.regionVersion}`
            let resp1 = await details.webContents.executeJavaScript(`$.get("${url1}", res => res)`)
            let splitwords = 'data-poi-address="'
            resp1 = resp1.substr(resp1.indexOf(splitwords) + splitwords.length, 10)
            result.cityname = resp1.substring(resp1.indexOf('省') + 1, resp1.indexOf('市') + 1)
            temp['account/homePage'] = true
          }
          if (details.url.includes('index/homePage') && !Object.keys(temp).includes('index/homePage')) {
            const resp = await details.webContents.executeJavaScript(`fetch('${details.url}').then(resp=>resp.json())`)
            result.storelogo = resp.data.wmPoiData.logoUrl
            temp['index/homePage'] = true
          }
          //
          if (details.url.includes('sc/index/r/poiInfo/get') && !Object.keys(temp).includes('sc/index/r/poiInfo/get')) {
            const resp = await details.webContents.executeJavaScript(`fetch('${details.url}').then(resp=>resp.json())`)
            result.storelogo = resp.data.wmPoiData.logoUrl
            result.storename = resp.data.wmPoiData.wmPoiName
            result.account = resp.data.userName
            result.storeid = resp.data.wmPoiId
            result.checkurl = details.url
            let url1 = `https://shangoue.meituan.com/health/pc/merchant/storeaddress?poiId=${result.storeid}`
            const resp1 = await details.webContents.executeJavaScript(`fetch('${url1}').then(resp=>resp.json())`)
            let addr = resp1.data.storeAddress
            result.cityname = addr.substring(addr.indexOf('省') + 1, addr.indexOf('市') + 1)
            temp['sc/index/r/poiInfo/get'] = true
          }
          if (details.url.includes('/retail/home/basicInfo') && !Object.keys(temp).includes('/retail/home/basicInfo')) {
            const resp = await details.webContents.executeJavaScript(`fetch('${details.url}').then(resp=>resp.json())`)
            result.storestatus = resp.data.wmPoiStatusDesc
            temp['/retail/home/basicInfo'] = true
          }
          if (details.url.includes('poi/banner/r/list')) {
            //停业中的新店
            result.storetype = 1
            temp['poi/poiList'] = true
            temp['account/homePage'] = true
          }
          if (details.url.includes('common/businessStatus')) {
            temp['common/businessStatus'] = true
            logger.info("mt--------------------------resolve le", details.url)
            var ckStr = result.cookies;
            if (ckStr && ckStr.indexOf("wmPoiId=") != -1 && ckStr.indexOf("token=") != -1) {
              resolve()
            } else {
              logger.info("收到了common/businessStatus 但获取不到wmpoid ")
            }

          }
          logger.info("mt--------------------------loginok_", details.url)
          if (Object.keys(temp).length >= 2) {
            resolve()
          }
        })
      })
    )
    await Promise.all(promises)
    website.close()
    return result
  }
})

ipcMain.handle('open-elm-wm', async () => {
  let url = 'https://melody.shop.ele.me/app'
  // let url = "https://open-api.shop.ele.me/authorize?response_type=code&client_id=YOXXIuxkFk&state=780185&scope=all&redirect_uri=https%3A%2F%2Feleme.maiyatian.com%2Fchannel%2Fauth%2F";
  let website = new BrowserWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    icon: join(__dirname, '../public/logo.ico'),
    webPreferences: {
      partition: `partition:${Date.now()}`
    }
  })
  // website.webContents.openDevTools()
  const ses = website.webContents.session
  const promises = [],
    result = { storetype: 0, umidtoken: '', ua: '' }
  website.loadURL(url)
  const _url = 'https://agw.ele.me/gw/h5api/ele-waimai-merchant-task-center.*?source=ELE'
  // const _url = 'https://open-api.shop.ele.me/identity/auth/chain'
  const _url1 = 'https://app-api.shop.ele.me/xtop/xtop.napos.keeper.login.loginByUsername/2.0'
  const _url2 = 'https://app-api.shop.ele.me/arena/invoke/?method=LoginService.loginByUsername'
  ses.webRequest.onBeforeSendHeaders({ urls: [_url, _url1, _url2] }, (details, callback) => {
    result.cookies = details.requestHeaders.Cookie
    result.url = details.url
    result.umidtoken = details.requestHeaders['bx-umidtoken'] ? details.requestHeaders['bx-umidtoken'] : ''
    result.ua = details.requestHeaders['bx-ua'] ? details.requestHeaders['bx-ua'] : ''
    if ((details.url === _url1 || details.url === _url2) && details.method === 'POST') {
      const postData = details.uploadData.map(data => {
        return data.bytes.toString('utf8')
      })
      let postObj = JSON.parse(postData)
      let info = { u: postObj.params.username, p: postObj.params.password }
      result.info = info
    }
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
  promises.push(
    new Promise(resolve => {
      ses.webRequest.onCompleted({ urls: [_url] }, async details => {
        logger.info('Response:', details)
        if (result.cookies && result.cookies.includes('ksid')) {
          resolve('')
        }
      })
    })
  )
  await Promise.all(promises)
  website.close()
  return result
})
ipcMain.handle('open-elm-retail', async () => {
  let url =
    //'https://nr.ele.me/eleme-nr-bfe-newretail/eb_login?redirect_url=https%3A%2F%2Fnr.ele.me%2Feleme_nr_bfe_retail%2Feb_common%23%2F'
    'https://nr.ele.me/eleme-nr-bfe-newretail/eb_login?redirect_url=https%3A%2F%2Fnr.ele.me%2Fapp%2Feleme-nr-bfe-newretail%2Fcommon-next%23%2Fpc%2FstoreCommodityManagementPc%2F'
  let website = new BrowserWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    icon: join(__dirname, '../public/logo.ico'),
    webPreferences: {
      partition: `partition:${Date.now()}`
    }
  })
  // website.webContents.openDevTools()
  const ses = website.webContents.session
  const promises = [],
    result = { storetype: 0, umidtoken: '', ua: '' }
  website.loadURL(url)
  const _url = 'https://*.ele.me/*'
  ses.webRequest.onBeforeSendHeaders({ urls: [_url] }, (details, callback) => {
    var ck = details.requestHeaders.Cookie ?? "";
    if (ck.includes("_m_h5_tk") || ck.includes("_m_h5_c")) {
      result.cookies = ck;
      logger.info("nr--------------------------resolve le", ck)
    }
    // result.cookies = details.requestHeaders.Cookie
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
  promises.push(
    new Promise(resolve => {
      ses.webRequest.onCompleted({ urls: [_url] }, async details => {
        logger.info('Response2:', result.cookies)
        if (result.cookies && result.cookies.includes('WMSTOKEN')) {
          resolve('')
        }
      })
    })
  )
  await Promise.all(promises)
  website.close()
  return result
})
ipcMain.handle('open-jd-home', async (event, params) => {
  // 京东到家（默认 shop_type=6）
  let url = 'https://store.jddj.com/base/login?appCode=lsp-store&backUrl=https://store.jddj.com/'
  let website = new BrowserWindow({
    width: 1000,
    height: 600,
    autoHideMenuBar: true,
    icon: join(__dirname, '../public/logo.ico'),
    webPreferences: {
      partition: `partition:${Date.now()}`
    }
  })
  // website.webContents.openDevTools()
  const ses = website.webContents.session
  const promises = [],
    result = { storetype: 0, umidtoken: '', ua: '' }
  website.loadURL(url)
  //            //stock-store.jddj.com/stockCenter/stockUpload
  const _url = 'https://sff.jddj.com/api?v=1.0&appId=YNE4XWZFDHXOYGKZU5FN&api=dsm.o2o.order.home.getData'
  ses.webRequest.onBeforeSendHeaders({ urls: ["https://*.jddj.com/*"] }, (details, callback) => {
    result.cookies = details.requestHeaders.Cookie
    callback({ cancel: false, requestHeaders: details.requestHeaders })
  })
  promises.push(
    new Promise(resolve => {
      ses.webRequest.onCompleted({ urls: [_url] }, async details => {
        logger.info('Response2:', result.cookies)
        if (result.cookies && result.cookies.includes('mba_sid')) {
          resolve('')
        }
      })
    })
  )
  await Promise.all(promises)
  website.close()
  return result
})
ipcMain.handle('openurl', (e, url, name) => {
  const newurl = new BrowserWindow({
    autoHideMenuBar: true,
    title: name,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    },
    icon: join(__dirname, '../public/logo.ico')
  })
  newurl.webContents.on('page-title-updated', e => {
    e.preventDefault()
    newurl.setTitle(name)
  })
  newurl.loadURL(url)
  // let win = new BrowserWindow({ width: 800, height: 600, autoHideMenuBar: true });

  //   let view = new BrowserView({
  //       webPreferences: {
  //           preload: path.join(__dirname, 'preload.js'),
  //           contextIsolation: true,
  //           nodeIntegration: false,
  //           enableRemoteModule: false
  //       }
  //   });
  //   win.setBrowserView(view);
  //   view.setBounds({ x: 0, y: 0, width: 800, height: 600, autoHideMenuBar: true });
  //   view.webContents.loadURL(url);
})

// 用于记录已注册的 partition，避免重复注册
const registeredPartitions = new Set();

// ========== 手动授权窗口相关 ==========

// 存储授权窗口实例的Map
const authWindows = new Map();

/**
 * 打开手动授权窗口
 * 支持所有平台的手动授权
 */
ipcMain.handle('open-auth-window', async (event, params) => {
  const { shopType, name } = params;

  // 定义各平台的登录URL
  const urlMap = {
    1: 'https://e.waimai.meituan.com',           // 美团外卖
    2: 'https://melody.shop.ele.me/app',         // 饿了么
    3: 'https://shangoue.meituan.com',           // 美团闪购
    4: 'https://yiyao.meituan.com',              // 美团医药
    5: 'https://nr.ele.me/eleme-nr-bfe-newretail/eb_login?redirect_url=https%3A%2F%2Fnr.ele.me%2Fapp%2Feleme-nr-bfe-newretail%2Fcommon-next%23%2Fpc%2FstoreCommodityManagementPc%2F', // 饿百零售
    6: 'https://store.jddj.com/base/login?appCode=lsp-store&backUrl=https://store.jddj.com/', // 京东到家
  };

  const url = urlMap[shopType];

  if (!url) {
    return { success: false, message: '不支持的店铺类型' };
  }

  // 创建独立的partition
  const partition = `partition:auth_${shopType}_${Date.now()}`;

  // 创建授权窗口
  const authWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: `${name || '店铺'}授权`,
    autoHideMenuBar: true,
    icon: join(__dirname, '../public/logo.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      partition: partition
    }
  });

  // 加载授权窗口HTML
  authWindow.loadFile(join(__dirname, 'authWindow.html'));

  // 窗口加载完成后，发送初始化参数
  authWindow.webContents.on('did-finish-load', () => {
    authWindow.webContents.send('init-auth-window', {
      shopType,
      partition,
      url
    });
  });

  // 保存窗口实例
  const windowId = authWindow.id;
  authWindows.set(windowId, { window: authWindow, partition, shopType });

  // 窗口关闭时清理
  authWindow.on('closed', () => {
    authWindows.delete(windowId);
  });

  return { success: true, windowId };
});

/**
 * 获取完整的cookies
 * 使用Electron官方API: session.cookies.get()
 */
ipcMain.handle('get-auth-cookies', async (event, partition, shopType) => {
  try {
    logger.info(`[手动授权] 开始获取cookies, partition: ${partition}, shopType: ${shopType}`);

    const ses = session.fromPartition(partition);

    // 根据平台定义需要获取cookies的域名
    const domainMap = {
      1: ['.meituan.com', '.waimai.meituan.com', 'e.waimai.meituan.com'],  // 美团外卖
      2: ['.ele.me', '.shop.ele.me', 'melody.shop.ele.me'],                 // 饿了么
      3: ['.meituan.com', 'shangoue.meituan.com'],                          // 美团闪购
      4: ['.meituan.com', 'yiyao.meituan.com'],                             // 美团医药
      5: ['.ele.me', 'nr.ele.me'],                                          // 饿百零售
      6: ['.jddj.com', 'store.jddj.com'],                                   // 京东到家
    };

    const domains = domainMap[shopType] || [];
    logger.info(`[手动授权] 目标域名列表: ${domains.join(', ')}`);

    let allCookies = [];

    // 获取所有相关域名的cookies
    for (const domain of domains) {
      const cookies = await ses.cookies.get({ domain });
      logger.info(`[手动授权] 域名 ${domain} 获取到 ${cookies.length} 个cookies`);
      allCookies = allCookies.concat(cookies);
    }

    // 如果没有指定域名，获取所有cookies
    if (domains.length === 0) {
      logger.warn(`[手动授权] 未找到平台 ${shopType} 的域名配置，获取所有cookies`);
      allCookies = await ses.cookies.get({});
    }

    // 去重（按name和domain）
    const uniqueCookies = [];
    const seen = new Set();
    for (const cookie of allCookies) {
      const key = `${cookie.name}@${cookie.domain}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueCookies.push(cookie);
      }
    }

    // 转换为cookie字符串格式
    const cookieString = uniqueCookies
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    logger.info(`[手动授权] 店铺类型: ${shopType}, 去重后共 ${uniqueCookies.length} 个cookies`);
    logger.info(`[手动授权] Cookies前200字符: ${cookieString.substring(0, 200)}...`);
    logger.info(`[手动授权] Cookies总长度: ${cookieString.length}`);

    if (!cookieString || cookieString.length < 10) {
      logger.error(`[手动授权] Cookies为空或过短: ${cookieString}`);
      return {
        success: false,
        message: `Cookies获取失败或为空(长度: ${cookieString.length})，请确保已登录店铺后台`
      };
    }

    return { success: true, cookies: cookieString };
  } catch (error) {
    logger.error('[手动授权] 获取cookies异常:', error);
    return { success: false, message: `获取cookies异常: ${error.message}` };
  }
});

/**
 * 从授权窗口添加店铺
 * 调用后端API添加店铺
 */
ipcMain.handle('add-shop-from-auth', async (event, data) => {
  try {
    const { shop_type, cookies, shop_user, shop_pwd } = data;

    logger.info(`[手动授权] 开始添加店铺, 类型: ${shop_type}, cookies长度: ${cookies?.length}`);

    // 获取主窗口，通过主窗口调用前端的addShop方法
    const allWindows = BrowserWindow.getAllWindows();
    logger.info(`[手动授权] 当前窗口数量: ${allWindows.length}`);

    // 找到主窗口（不是授权窗口）
    const mainWindow = allWindows.find(win => !win.getTitle().includes('授权'));
    if (!mainWindow) {
      logger.error('[手动授权] 主窗口未找到');
      return { success: false, message: '主窗口未找到，请确保主应用窗口正常打开' };
    }

    logger.info(`[手动授权] 找到主窗口: ${mainWindow.getTitle()}`);

    // 通知渲染进程添加店铺
    const result = await new Promise((resolve) => {
      const responseChannel = `add-shop-response-${Date.now()}`;
      let hasResolved = false;

      logger.info(`[手动授权] 发送请求到渲染进程, 响应频道: ${responseChannel}`);

      // 监听响应
      ipcMain.once(responseChannel, (event, response) => {
        if (hasResolved) {
          logger.warn(`[手动授权] 收到重复响应，已忽略`);
          return;
        }
        hasResolved = true;
        logger.info(`[手动授权] 收到渲染进程响应:`, response);
        resolve(response);
      });

      // 发送请求到渲染进程
      mainWindow.webContents.send('add-shop-request', {
        data: {
          shop_type,
          cookies,
          shop_user,
          shop_pwd
        },
        responseChannel
      });

      // 30秒超时（增加超时时间，因为后端处理可能需要更长时间）
      setTimeout(() => {
        if (!hasResolved) {
          logger.error('[手动授权] 请求超时(30秒)');
          hasResolved = true;
          resolve({ success: false, message: '请求超时(30秒)，请检查网络连接或后端服务状态' });
        }
      }, 30000);
    });

    logger.info(`[手动授权] 最终结果:`, result);
    return result;
  } catch (error) {
    logger.error('[手动授权] 添加店铺异常:', error);
    return { success: false, message: `添加店铺异常: ${error.message}` };
  }
});

/**
 * 关闭授权窗口
 */
ipcMain.on('close-auth-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (window && !window.isDestroyed()) {
    window.close();
  }
});

// ========== 手动授权窗口相关结束 ==========

// 处理 webview 右键菜单，支持复制选中文本
ipcMain.on('show-context-menu', (event, params) => {
  const { selectionText, isEditable, webContentsId, linkURL, srcURL, shopId, shortcuts, shopInfo } = params;
  const menuItems = [];

  // 如果有链接，添加链接相关选项
  if (linkURL) {
    menuItems.push({
      label: '在新窗口中打开链接',
      click: () => {
        shell.openExternal(linkURL);
      }
    });
    menuItems.push({
      label: '复制链接地址',
      click: () => {
        clipboard.writeText(linkURL);
      }
    });
    menuItems.push({ type: 'separator' });
  }

  // 如果有图片，添加图片相关选项
  if (srcURL && (srcURL.startsWith('http') || srcURL.startsWith('data:'))) {
    menuItems.push({
      label: '复制图片地址',
      click: () => {
        clipboard.writeText(srcURL);
      }
    });
    menuItems.push({
      label: '在新窗口中打开图片',
      click: () => {
        if (srcURL.startsWith('http')) {
          shell.openExternal(srcURL);
        }
      }
    });
    menuItems.push({ type: 'separator' });
  }

  // 如果有选中文本，显示复制选项
  if (selectionText && selectionText.length > 0) {
    menuItems.push({
      label: '复制',
      accelerator: 'CmdOrCtrl+C',
      click: () => {
        clipboard.writeText(selectionText);
      }
    });
  }

  // 如果是可编辑区域，添加粘贴选项
  if (isEditable) {
    if (menuItems.length > 0) {
      menuItems.push({ type: 'separator' });
    }
    menuItems.push({
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      click: () => {
        const wc = webContents.fromId(webContentsId);
        if (wc) {
          wc.paste();
        }
      }
    });
  }

  // 添加全选选项
  if (selectionText || isEditable) {
    menuItems.push({
      label: '全选',
      accelerator: 'CmdOrCtrl+A',
      click: () => {
        const wc = webContents.fromId(webContentsId);
        if (wc) {
          wc.selectAll();
        }
      }
    });
  }

  // 添加页面导航选项（后退、前进、刷新）
  if (menuItems.length > 0) {
    menuItems.push({ type: 'separator' });
  }

  const wc = webContents.fromId(webContentsId);
  const canGoBack = wc ? wc.canGoBack() : false;
  const canGoForward = wc ? wc.canGoForward() : false;

  menuItems.push({
    label: '后退',
    accelerator: 'Alt+Left',
    enabled: canGoBack,
    click: () => {
      if (wc && canGoBack) {
        wc.goBack();
      }
    }
  });
  menuItems.push({
    label: '前进',
    accelerator: 'Alt+Right',
    enabled: canGoForward,
    click: () => {
      if (wc && canGoForward) {
        wc.goForward();
      }
    }
  });
  menuItems.push({
    label: '刷新',
    accelerator: 'CmdOrCtrl+R',
    click: () => {
      if (wc) {
        wc.reload();
      }
    }
  });

  // 添加快捷入口（如果有）
  if (shortcuts && Object.keys(shortcuts).length > 0) {
    let hasValidShortcut = false;
    const shortcutItems = [];

    if (shortcuts.product) {
      hasValidShortcut = true;
      shortcutItems.push({
        label: '📦 商品管理',
        click: () => {
          event.sender.send('navigate-to-url', { shopId, url: shortcuts.product });
        }
      });
    }

    if (shortcuts.activity) {
      hasValidShortcut = true;
      shortcutItems.push({
        label: '🎉 活动列表',
        click: () => {
          event.sender.send('navigate-to-url', { shopId, url: shortcuts.activity });
        }
      });
    }

    if (shortcuts.order) {
      hasValidShortcut = true;
      shortcutItems.push({
        label: '📋 订单管理',
        click: () => {
          event.sender.send('navigate-to-url', { shopId, url: shortcuts.order });
        }
      });
    }

    if (shortcuts.promote) {
      hasValidShortcut = true;
      shortcutItems.push({
        label: '📢 推广管理',
        click: () => {
          event.sender.send('navigate-to-url', { shopId, url: shortcuts.promote });
        }
      });
    }

    if (hasValidShortcut) {
      menuItems.push({ type: 'separator' });
      menuItems.push(...shortcutItems);
    }
  }

  // 添加分隔线和检查元素选项
  menuItems.push({ type: 'separator' });
  menuItems.push({
    label: '检查',
    click: () => {
      event.sender.send('open-webview-devtools');
    }
  });

  // 如果有店铺信息，添加"打开独立后台页面"选项
  if (shopInfo && shopInfo.id) {
    menuItems.push({ type: 'separator' });
    menuItems.push({
      label: '打开独立后台页面',
      click: () => {
        // 通知渲染进程打开独立后台页面
        event.sender.send('open-shop-in-independent-window', shopInfo);
      }
    });
  }

  const menu = Menu.buildFromTemplate(menuItems);
  menu.popup();
});

ipcMain.handle('win', (e, url, partition, name, officeId, shopType) => {
  // 注册拦截器（只注册一次）

  const ses = session.fromPartition(partition);
  ses.webRequest.onHeadersReceived((details, callback) => {
    // 京东到家：删除 set-cookie 响应头，防止 cookies 重复导致业务请求异常
    if (details.url.includes('jddj.com')) {
      const headers = details.responseHeaders;
      Object.keys(headers).forEach(key => {
        if (key.toLowerCase() === 'set-cookie') {
          delete headers[key];
        }
      });
      callback({ responseHeaders: headers });
    } else {
      callback({ responseHeaders: details.responseHeaders });
    }
  });



  const mdwin = new BrowserWindow({
    autoHideMenuBar: true,
    title: name,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
      webviewTag: true
    },
    icon: join(__dirname, '../public/logo.ico')
  })
  mdwin.webContents.on('page-title-updated', e => {
    e.preventDefault()
    mdwin.setTitle(name)
  })
  // 使用 localShortcut 风格：监听窗口获得焦点时的键盘事件
  const { globalShortcut } = require('electron')

  // 窗口获得焦点时注册快捷键
  mdwin.on('focus', () => {
    globalShortcut.register('F12', () => {
      mdwin.webContents.send('open-webview-devtools')
    })
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      mdwin.webContents.send('open-webview-devtools')
    })
  })

  // 窗口失去焦点时注销快捷键
  mdwin.on('blur', () => {
    globalShortcut.unregister('F12')
    globalShortcut.unregister('CommandOrControl+Shift+I')
  })

  // 窗口关闭时注销快捷键
  mdwin.on('closed', () => {
    globalShortcut.unregister('F12')
    globalShortcut.unregister('CommandOrControl+Shift+I')
  })

  // 加载带导航栏的店铺窗口模板，通过 URL 参数传递目标地址、partition、shopType 和 officeId
  const shopWindowPath = join(__dirname, 'shopWindow.html')
  const encodedUrl = encodeURIComponent(url)
  const shopTypeParam = shopType ? `&shopType=${shopType}` : ''
  const officeIdParam = officeId ? `&officeId=${encodeURIComponent(officeId)}` : ''
  mdwin.loadURL(`file://${shopWindowPath}?url=${encodedUrl}&partition=${encodeURIComponent(partition)}${shopTypeParam}${officeIdParam}`)
})

ipcMain.handle('win_elm', async (e, url, partition, name, ckStr, officeId, shopType) => {
  // 先设置 cookies 到 session
  if (!ckStr.includes('x5check_napos')) {
    const jar = parseCookie(ckStr)
    logger.info('已处理 x5check_napos', jar['ksid'])
    ckStr += `;x5check_napos=${jar['ksid']}`
  }
  const ses = session.fromPartition(partition)
  const jar = parseCookie(ckStr)
  logger.info('Response2:jar', JSON.stringify(ckStr))
  for (const [key, value] of jar) {
    logger.info('即将设置key:', key, ' value:', value)
    await ses.cookies.set({ name: key, value, domain: '.melody.shop.ele.me', url: 'https://melody.shop.ele.me' })
    await ses.cookies.set({ name: key, value, domain: '.app-api.shop.ele.me', url: 'https://app-api.shop.ele.me' })
    await ses.cookies.set({ name: key, value, domain: '.gm.mmstat.com', url: 'https://gm.mmstat.com' })
    await ses.cookies.set({ name: key, value, domain: '.ynuf.aliapp.org', url: 'https://ynuf.aliapp.org' })
    await ses.cookies.set({ name: key, value, domain: '.log.mmstat.com', url: 'https://log.mmstat.com' })
    await ses.cookies.set({ name: key, value, domain: '.agw.ele.me', url: 'https://agw.ele.me' })
    await ses.cookies.set({ name: key, value, domain: '.ws-msgacs.m.taobao.com', url: 'https://ws-msgacs.m.taobao.com' })
    await ses.cookies.set({ name: key, value, domain: '.ele.me', url: 'https://melody.shop.ele.me' })
  }

  const mdwin = new BrowserWindow({
    autoHideMenuBar: true,
    title: name,
    webPreferences: {
      webSecurity: false,
      contextIsolation: false,
      nodeIntegration: true,
      webviewTag: true
    },
    icon: join(__dirname, '../public/logo.ico')
  })
  mdwin.webContents.on('page-title-updated', e => {
    e.preventDefault()
    mdwin.setTitle(name)
  })
  // 使用 globalShortcut 监听键盘事件
  const { globalShortcut } = require('electron')

  // 窗口获得焦点时注册快捷键
  mdwin.on('focus', () => {
    globalShortcut.register('F12', () => {
      mdwin.webContents.send('open-webview-devtools')
    })
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      mdwin.webContents.send('open-webview-devtools')
    })
  })

  // 窗口失去焦点时注销快捷键
  mdwin.on('blur', () => {
    globalShortcut.unregister('F12')
    globalShortcut.unregister('CommandOrControl+Shift+I')
  })

  // 窗口关闭时注销快捷键
  mdwin.on('closed', () => {
    globalShortcut.unregister('F12')
    globalShortcut.unregister('CommandOrControl+Shift+I')
  })

  // 加载带导航栏的店铺窗口模板
  const shopWindowPath = join(__dirname, 'shopWindow.html')
  const encodedUrl = encodeURIComponent(url)
  const shopTypeParam = shopType ? `&shopType=${shopType}` : ''
  const officeIdParam = officeId ? `&officeId=${encodeURIComponent(officeId)}` : ''
  mdwin.loadURL(`file://${shopWindowPath}?url=${encodedUrl}&partition=${encodeURIComponent(partition)}${shopTypeParam}${officeIdParam}`)
  mdwin.webContents.setAudioMuted(true)
})
ipcMain.handle('set-cookie', async (e, partition, url, cookie) => {
  logger.info('set-cookie调用:', partition, url)
  const s = session.fromPartition(partition, { cache: false })
  const jar = parseCookie(cookie)

  // 从URL中提取域名
  let domain = ''
  let cleanUrl = url.replace(/\/\*$/, '') // 移除通配符

  try {
    const urlObj = new URL(cleanUrl)
    domain = urlObj.hostname
    // 美团闪购：服务器返回的signToken cookie没有Domain属性（host-only cookie），
    // 因此我们设置时也不设置domain参数，保持与服务器行为一致，避免cookie冲突
    if (domain === 'shangoue.meituan.com') {
      domain = undefined
    } else {
      // 如果域名有多个部分，使用点号开头的域名格式（支持子域名）
      const parts = domain.split('.')
      if (parts.length > 2) {
        domain = '.' + parts.slice(-2).join('.') // 例如：store.jddj.com -> .jddj.com
      }
    }
  } catch (err) {
    logger.error('URL解析失败:', cleanUrl, err)
  }

  for (const [key, value] of jar) {
    try {
      // 同时使用url和domain参数确保cookies能正确设置
      await s.cookies.set({
        url: cleanUrl,
        domain: domain || undefined,
        name: key,
        value,
        path: '/',
        secure: cleanUrl.startsWith('https'),
        httpOnly: false,
        sameSite: 'no_restriction'
      })
    } catch (error) {
      logger.error(`❌ 设置cookie失败: ${key}`, error.message)
    }
  }
})
ipcMain.handle('set-cookie2', async (e, partition, url, cookie) => {
  // logger.info('Response2:', partition, url, cookie);
  const s = session.fromPartition(partition, { cache: false })
  try {
    const json2 = JSON.parse(cookie)
    for (const item of json2) {
      await s.cookies.set(item)
    }
  } catch (err) {
    console.error(err)
  }
})
// main.js
ipcMain.handle('clear-cookies', async (event, partition, url) => {
  const ses = session.fromPartition(partition)
  await ses.clearStorageData({ storages: ['cookies'], origin: url === '*' ? undefined : url })
})

/**
 * 清空所有店铺的浏览器缓存目录
 * 扫描Partitions目录，找到所有店铺相关的partition目录并删除
 */
ipcMain.handle('clear-all-shop-cache', async (event) => {
  try {
    const userDataPath = app.getPath('userData')
    const partitionsPath = path.join(userDataPath, 'Partitions')

    logger.info(`[清空缓存] 用户数据目录: ${userDataPath}`)
    logger.info(`[清空缓存] Partitions目录: ${partitionsPath}`)

    // 检查Partitions目录是否存在
    if (!fs.existsSync(partitionsPath)) {
      logger.info('Partitions目录不存在，无需清空')
      return { success: true, message: '未找到缓存目录', clearedCount: 0 }
    }

    // 读取Partitions目录下的所有子目录
    const entries = fs.readdirSync(partitionsPath, { withFileTypes: true })
    logger.info(`[清空缓存] Partitions目录下共 ${entries.length} 个条目`)

    // 获取所有子目录，直接删除所有目录（不进行过滤判断）
    const allDirectories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)

    logger.info(`[清空缓存] 找到 ${allDirectories.length} 个子目录，开始删除...`)

    if (allDirectories.length === 0) {
      logger.info('Partitions目录下没有子目录')
      return { success: true, message: '未找到需要删除的目录', clearedCount: 0 }
    }

    let clearedCount = 0
    const total = allDirectories.length

    // 逐个尝试删除目录并发送进度更新
    for (let i = 0; i < allDirectories.length; i++) {
      const dirName = allDirectories[i]
      const dirPath = path.join(partitionsPath, dirName)

      try {
        // 直接删除目录（递归删除所有内容）
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true })
        }

        clearedCount++
        logger.info(`✅ 已删除目录: ${dirName} (${clearedCount}/${total})`)

        // 发送进度更新
        if (event.sender && !event.sender.isDestroyed()) {
          event.sender.send('clear-cache-progress', {
            current: clearedCount,
            total: total,
            partition: dirName
          })
        }
      } catch (error) {
        logger.error(`❌ 删除目录失败 ${dirName}:`, error)
        // 继续处理下一个，不中断整个过程
      }
    }

    logger.info(`✅ 缓存清空完成，共清空 ${clearedCount}/${total} 个店铺缓存`)
    return {
      success: true,
      message: `已清空 ${clearedCount} 个店铺的缓存目录`,
      clearedCount: clearedCount,
      total: total
    }
  } catch (error) {
    logger.error('❌ 清空缓存失败:', error)
    throw error
  }
})
ipcMain.handle('http-post-form', async (e, urlStr, postObjStr) => {
  return new Promise((resolve, reject) => {
    const postObj = JSON.parse(postObjStr)
    const urlObj = new URL(urlStr)
    const reqOptions = {
      hostname: urlObj.host,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded', // 根据需要设置正确的Content-Type
        Referer: urlStr // 设置Referer头
      }
    }
    const req = https.request(reqOptions, res => {
      let responseBuffer = ''
      res.on('data', chunk => {
        responseBuffer += chunk
      })
      res.on('end', () => {
        logger.info('responseBuffer:', responseBuffer)
        resolve(responseBuffer)
      })
    })
    // 监听错误事件
    req.on('error', e => {
      logger.info(`请求遇到问题: ${e.message}`)
      reject(e)
    })
    // 写入POST请求的数据
    const searchParams = new URLSearchParams(postObj)
    const postData = searchParams.toString()
    req.write(postData)
    // 结束请求
    req.end()
  })
})
ipcMain.handle('download-image', async (event, url) => {
  await downloadImage(url)
})

ipcMain.handle('stop-proxy', async () => {
  cleanupProxy()
})

// ==================== Frida 相关处理器 开始 ====================
const fridaServer = require('./fridaServer')

// 启动 Frida 注入
ipcMain.handle('frida-inject', async (event, { host, port }) => {
  try {
    await fridaServer.startInject(win, host, port)
    return { success: true }
  } catch (err) {
    console.error('[Frida] 注入失败:', err.message)

    // 如果是 Frida 工具未安装的错误，显示更详细的对话框
    if (err.message.includes('Python') || err.message.includes('frida-tools') || err.message.includes('未安装')) {
      const { dialog } = require('electron')
      dialog.showMessageBox(win, {
        type: 'error',
        title: 'Frida 工具未安装',
        message: 'Frida 注入失败',
        detail: err.message,
        buttons: ['确定']
      })
    }

    return { success: false, error: err.message }
  }
})

// 重启应用并注入
ipcMain.handle('frida-inject-restart', async (event, { host, port }) => {
  try {
    await fridaServer.startInjectWithRestart(win, host, port)
    return { success: true }
  } catch (err) {
    console.error('[Frida] 重启并注入失败:', err.message)

    // 如果是 Frida 工具未安装的错误，显示更详细的对话框
    if (err.message.includes('Python') || err.message.includes('frida-tools') || err.message.includes('未安装')) {
      const { dialog } = require('electron')
      dialog.showMessageBox(win, {
        type: 'error',
        title: 'Frida 工具未安装',
        message: 'Frida 注入失败',
        detail: err.message,
        buttons: ['确定']
      })
    }

    return { success: false, error: err.message }
  }
})

// 停止 Frida
ipcMain.handle('frida-stop', async () => {
  try {
    fridaServer.stop()
    return { success: true }
  } catch (err) {
    console.error('[Frida] 停止失败:', err.message)
    return { success: false, error: err.message }
  }
})
// ==================== Frida 相关处理器 结束 ====================

// 监听来自渲染进程的消息
ipcMain.handle('open-directory-dialog', async event => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory'] // 只允许选择目录
  })

  if (!result.canceled) {
    return result.filePaths[0] // 返回第一个（也是唯一一个）文件夹路径
  }
})
// 保存Excel文件对话框
ipcMain.handle('save-excel-file', async (event, { buffer, defaultPath }) => {
  try {
    const { dialog } = require('electron')
    const fs = require('fs')
    const path = require('path')

    // 显示保存对话框
    const result = await dialog.showSaveDialog({
      title: '保存Excel文件',
      defaultPath: defaultPath || '异常商品列表.xlsx',
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })

    if (result.canceled) {
      return { success: false, canceled: true }
    }

    // 将buffer数组转换回Buffer对象并保存文件
    const bufferData = Buffer.from(buffer)
    fs.writeFileSync(result.filePath, bufferData)

    return { success: true, filePath: result.filePath }
  } catch (error) {
    logger.error('Failed to save Excel file:', error)
    return { success: false, error: error.message }
  }
})

// 创建并保存 Excel 文件
ipcMain.handle('create-and-save-excel', async (event, filePath, header, data, columnWidths) => {
  logger.info('0000000000000000000')
  try {
    logger.info('1')
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet 1')
    logger.info('2')
    // 添加表头
    const headerRow = worksheet.addRow(header)
    logger.info('3')
    headerRow.height = 30
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        bgColor: { argb: 'E7E6E6' },
        fgColor: { argb: '76933C' } // 设置背景颜色
      }
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 14 } // 设置字体样式
      cell.alignment = { horizontal: 'left', vertical: 'middle' } // 设置对齐方式
    })
    logger.info('4')
    // 添加数据行
    data.forEach(item => {
      const row = worksheet.addRow([
        item.id,
        item.name,
        item.product_name,
        item.month_sales_description,
        item.unit,
        item.min_price,
        item.max_discount,
        item.origin_price,
        item.stock,
        item.today_stock,
        item.meal_num,
        item.meal_price,
        item.format,
        item.min_order_count,
        item.description
      ])
      row.height = 24
      row.eachCell(cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        cell.alignment = { horizontal: 'left', vertical: 'middle' }
      })
    })
    logger.info('5')
    // 设置列宽
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width
    })
    logger.info('6')
    // 保存 Excel 文件
    await workbook.xlsx.writeFile(filePath)
    logger.info('7')
    return { success: true, message: `Excel file created at ${filePath}` }
  } catch (error) {
    logger.info('1111111111')
    throw new Error(`Failed to create Excel file: ${error.message}`)
  }
})
// 创建并保存 Excel 文件
ipcMain.handle(
  'create-and-save-excel-operate',
  async (event, filePath, header1, headerRow1, columnWidths1, header2, headerRow2, columnWidths2, data1, data2) => {
    try {
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Sheet 1')

      // 添加表头
      const Row1 = worksheet.addRow(header1)
      Row1.height = 54
      Row1.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '76933C' } // 设置背景颜色
        }
        cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 28 } // 设置字体样式
        cell.alignment = { horizontal: 'center', vertical: 'middle' } // 设置对齐方式
      })
      // 合并表头单元格，使其跨越指定列数
      worksheet.mergeCells(`A1:${String.fromCharCode(64 + 15)}1`)

      const Row2 = worksheet.getRow(2)
      Row2.height = 31
      let currentColumn = 1
      headerRow1.forEach((headerText, index) => {
        const startColumn = currentColumn
        const endColumn = startColumn + 2 // 每个单元格跨越3列
        const startCell = `${String.fromCharCode(64 + startColumn)}2`
        const endCell = `${String.fromCharCode(64 + endColumn)}2`
        // 合并单元格
        worksheet.mergeCells(`${startCell}:${endCell}`)
        // 设置合并后的单元格内容及样式
        const mergedCell = worksheet.getCell(startCell)
        mergedCell.value = headerText
        mergedCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E7E6E6' } // 设置背景颜色
        }
        mergedCell.font = { bold: true, color: { argb: '000000' }, size: 14 } // 设置字体样式
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' } // 设置对齐方式
        currentColumn += 3 // 更新下一组开始的列索引
      })

      const RowData1 = worksheet.getRow(3)
      RowData1.height = 24
      let currentColumn2 = 1
      data1.forEach((headerText, index) => {
        const startColumn = currentColumn2
        const endColumn = startColumn + 2 // 每个单元格跨越3列
        const startCell = `${String.fromCharCode(64 + startColumn)}3`
        const endCell = `${String.fromCharCode(64 + endColumn)}3`
        // 合并单元格
        worksheet.mergeCells(`${startCell}:${endCell}`)
        // 设置合并后的单元格内容及样式
        const mergedCell = worksheet.getCell(startCell)
        mergedCell.value = headerText
        mergedCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFF' } // 设置背景颜色
        }
        mergedCell.font = { color: { argb: '000000' }, size: 14 } // 设置字体样式
        mergedCell.alignment = { horizontal: 'center', vertical: 'middle' } // 设置对齐方式
        currentColumn2 += 3 // 更新下一组开始的列索引
      })

      const Row3 = worksheet.addRow(header2)
      Row3.height = 54
      Row3.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '76933C' } // 设置背景颜色
        }
        cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 28 } // 设置字体样式
        cell.alignment = { horizontal: 'center', vertical: 'middle' } // 设置对齐方式
      })
      // 合并表头单元格，使其跨越指定列数
      worksheet.mergeCells(`A4:${String.fromCharCode(64 + 15)}4`)

      const Row4 = worksheet.addRow(headerRow2)
      Row4.height = 31
      Row4.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'E7E6E6' } // 设置背景颜色
        }
        cell.font = { bold: true, color: { argb: '000000' }, size: 14 } // 设置字体样式
        cell.alignment = { horizontal: 'center', vertical: 'middle' } // 设置对齐方式
      })

      // 添加数据行
      data2.forEach((item, index) => {
        const RowData2 = worksheet.addRow([
          item.name,
          item.product_name,
          item.month_sales_description,
          item.unit,
          item.min_price,
          item.active_price,
          item.origin_price,
          item.max_discount,
          item.stock,
          item.pack_price,
          item.format,
          item.min_order_count,
          item.like_ratio_desc,
          item.attribute,
          item.description
        ])
        RowData2.height = 24
        RowData2.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          }
          cell.alignment = { horizontal: 'left', vertical: 'middle' }
        })
      })

      // 设置列宽
      columnWidths2.forEach((width, index) => {
        worksheet.getColumn(index + 1).width = width
      })

      // 保存 Excel 文件
      await workbook.xlsx.writeFile(filePath)

      return { success: true, message: `Excel file created at ${filePath}` }
    } catch (error) {
      throw new Error(`Failed to create Excel file: ${error.message}`)
    }
  }
)

// WebP 文件头特征检测
function isWebP(buffer) {
  return (
    buffer.length >= 12 &&
    buffer.readUInt32BE(0) === 0x52494646 && // 'RIFF'
    buffer.readUInt32BE(8) === 0x57454250
  ) // 'WEBP'
}

// Sharp 元数据检测（备用方案）
async function detectBySharp(buffer) {
  try {
    const { format } = await sharp(buffer).metadata()
    return format
  } catch {
    return 'unknown'
  }
}

// 下载图片到指定路径
ipcMain.handle('download-image-file', async (event, imageUrl, destinationFolderPath, imageName) => {
  try {
    const httpModule = new URL(imageUrl).protocol === 'https:' ? https : http
    const destinationPath = path.join(destinationFolderPath, imageName)

    // 使用 https.get 下载图片
    return new Promise((resolve, reject) => {
      httpModule
        .get(imageUrl, response => {
          response
            .pipe(fs.createWriteStream(destinationPath))
            .on('finish', () => resolve({ success: true, message: `Image downloaded to ${destinationPath}` }))
            .on('error', reject)
        })
        .on('error', reject)
    })
  } catch (error) {
    throw new Error(`Failed to download image: ${error.message}`)
  }
})
// ipcMain.handle('download-image-file', async (event, imageUrl, dir, filename) => {
//   const httpModule = new URL(imageUrl).protocol === 'https:' ? https : http;
//   const tempPath = path.join(dir, `temp_${Date.now()}_${filename}`);
//   const parsed = path.parse(filename);

//   return new Promise((resolve, reject) => {
//     const fileStream = fs.createWriteStream(tempPath);
//     let headerBuffer = Buffer.alloc(0);

//     // 下载并实时检测
//     httpModule.get(imageUrl, (response) => {
//       if (response.statusCode !== 200) return reject(new Error(`HTTP ${response.statusCode}`));

//       response.on('data', (chunk) => {
//         // 累积前 12 字节用于检测
//         if (headerBuffer.length < 12) {
//           headerBuffer = Buffer.concat([headerBuffer, chunk.slice(0, 12 - headerBuffer.length)]);
//         }
//       });

//       response.pipe(fileStream).on('finish', async () => {
//         try {
//           // 读取临时文件
//           const buffer = fs.readFileSync(tempPath);

//           // 检测格式
//           const shouldConvert = isWebP(headerBuffer) ||
//             (await detectBySharp(buffer)) === 'webp';

//           // 最终路径
//           const finalPath = shouldConvert ?
//             path.join(dir, `${parsed.name}.png`) :
//             path.join(dir, filename);

//           // 转换或移动文件
//           if (shouldConvert) {
//             await sharp(buffer).png().toFile(finalPath);
//             fs.unlinkSync(tempPath); // 删除临时文件
//           } else {
//             fs.renameSync(tempPath, finalPath);
//           }

//           resolve({ path: finalPath, converted: shouldConvert });
//         } catch (err) {
//           reject(err);
//         }
//       });
//     }).on('error', reject);
//   });
// });

// 获取默认导出路径（桌面）
ipcMain.handle('get-default-export-path', async event => {
  return app.getPath('desktop')
})
// 路劲拼接
ipcMain.handle('get-path-montage', async (event, pathArr) => {
  return join(...pathArr)
})

// ==================== 令牌文件管理 ====================
/**
 * 获取令牌文件存储目录
 * @returns {string} 令牌文件目录路径
 */
function getTokenFilesDir() {
  // 使用临时目录下的指定子目录
  const tokenDir = path.join(os.tmpdir(), 'alien-tokens')
  // 确保目录存在
  if (!fs.existsSync(tokenDir)) {
    fs.mkdirSync(tokenDir, { recursive: true })
  }
  return tokenDir
}

/**
 * 获取令牌文件路径
 * @param {string} username - 用户名
 * @returns {string} 文件路径
 */
function getTokenFilePath(username) {
  // 清理用户名，确保可以作为文件名使用
  const safeUsername = username.replace(/[<>:"/\\|?*]/g, '_')
  return path.join(getTokenFilesDir(), `${safeUsername}.txt`)
}

/**
 * 保存令牌到文件
 */
ipcMain.handle('save-token-file', async (event, username, token) => {
  try {
    if (!username || !token) {
      throw new Error('用户名和令牌不能为空')
    }
    const filePath = getTokenFilePath(username)
    fs.writeFileSync(filePath, token, 'utf8')
    logger.info(`[令牌文件] 保存成功: ${username} -> ${filePath}`)
    return { success: true }
  } catch (error) {
    logger.error(`[令牌文件] 保存失败: ${error.message}`)
    return { success: false, error: error.message }
  }
})

/**
 * 读取令牌文件
 */
ipcMain.handle('read-token-file', async (event, username) => {
  try {
    if (!username) {
      throw new Error('用户名不能为空')
    }
    const filePath = getTokenFilePath(username)
    if (!fs.existsSync(filePath)) {
      return { success: false, token: null, error: '文件不存在' }
    }
    const token = fs.readFileSync(filePath, 'utf8')
    logger.info(`[令牌文件] 读取成功: ${username}`)
    return { success: true, token }
  } catch (error) {
    logger.error(`[令牌文件] 读取失败: ${error.message}`)
    return { success: false, token: null, error: error.message }
  }
})

/**
 * 删除令牌文件
 */
ipcMain.handle('delete-token-file', async (event, username) => {
  try {
    if (!username) {
      throw new Error('用户名不能为空')
    }
    const filePath = getTokenFilePath(username)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      logger.info(`[令牌文件] 删除成功: ${username}`)
    }
    return { success: true }
  } catch (error) {
    logger.error(`[令牌文件] 删除失败: ${error.message}`)
    return { success: false, error: error.message }
  }
})

/**
 * 列出所有令牌文件
 */
ipcMain.handle('list-token-files', async (event) => {
  try {
    const tokenDir = getTokenFilesDir()
    if (!fs.existsSync(tokenDir)) {
      return { success: true, files: [] }
    }
    const files = fs.readdirSync(tokenDir)
      .filter(file => file.endsWith('.txt'))
      .map(file => {
        const username = file.replace('.txt', '')
        const filePath = path.join(tokenDir, file)
        const stat = fs.statSync(filePath)
        return {
          username,
          filePath,
          lastModified: stat.mtimeMs
        }
      })
    return { success: true, files }
  } catch (error) {
    logger.error(`[令牌文件] 列出文件失败: ${error.message}`)
    return { success: false, files: [], error: error.message }
  }
})
// ==================== 令牌文件管理结束 ====================

// ==================== 店铺后台管理器开始 ====================

let shopBackendManagerWindow = null

/**
 * 打开店铺后台管理器窗口（集中管理多个店铺后台）
 */
// 待打开的店铺数据缓存（解决时序问题）
let pendingShopData = null

ipcMain.handle('open-shop-backend-manager', async (event, shopData) => {
  try {
    // 如果窗口已存在且未销毁，直接发送店铺数据到该窗口
    if (shopBackendManagerWindow && !shopBackendManagerWindow.isDestroyed()) {
      shopBackendManagerWindow.webContents.send('open-shop-in-manager', shopData)
      shopBackendManagerWindow.focus()
      logger.info(`[店铺后台管理器] 发送店铺数据到现有窗口: ${shopData.name}`)
      return
    }

    // 缓存待打开的店铺数据
    pendingShopData = shopData
    logger.info(`[店铺后台管理器] 缓存待打开的店铺数据: ${shopData.name}`)

    // 创建新的店铺后台管理器窗口
    shopBackendManagerWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      autoHideMenuBar: true,
      icon: join(__dirname, '../public/logo.ico'),
      title: '店铺后台管理',
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        nodeIntegration: true,
        contextIsolation: true,
        enableRemoteModule: true,
        webviewTag: true,
        webSecurity: false,
        nativeWindowOpen: true,
        backgroundThrottling: false
      }
    })

    // 窗口关闭时清理引用和缓存
    shopBackendManagerWindow.on('closed', () => {
      shopBackendManagerWindow = null
      pendingShopData = null
      logger.info('[店铺后台管理器] 窗口已关闭')
    })

    // 加载页面
    if (process.env.VITE_DEV_SERVER_URL) {
      // 开发模式
      await shopBackendManagerWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#/shop-backend-manager`)
      // 不自动打开调试窗口，如需调试可手动按 F12
      // shopBackendManagerWindow.webContents.openDevTools()
    } else {
      // 生产模式
      const webResourceUpdater = require('./webResourceUpdater')
      const indexPath = webResourceUpdater.getResourcePath()
      await shopBackendManagerWindow.loadURL(`file://${indexPath.replace(/\\/g, '/')}#/shop-backend-manager`)
    }

    logger.info('[店铺后台管理器] 窗口已创建')
  } catch (error) {
    logger.error(`[店铺后台管理器] 打开失败: ${error.message || error}`, error)
  }
})

// 渲染进程主动获取待打开的店铺数据（解决时序问题）
ipcMain.handle('get-pending-shop-data', async () => {
  if (pendingShopData) {
    const data = pendingShopData
    pendingShopData = null // 获取后清空
    logger.info(`[店铺后台管理器] 返回待打开的店铺数据: ${data.name}`)
    return data
  }
  return null
})

/**
 * 关闭当前窗口
 */
ipcMain.handle('close-current-window', (event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  if (window && !window.isDestroyed()) {
    window.close()
  }
})

// ==================== 店铺后台管理器结束 ====================

// 新建窗口打开浏览器链接
ipcMain.handle('open-new-window-url', async (event, url) => {
  let website = new BrowserWindow({
    width: 900,
    height: 600,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../public/logo.ico'),
    webPreferences: {
      partition: `partition:${Date.now()}`
    }
  })
  website.loadURL(url)
})

// 处理开始下载更新的请求
ipcMain.handle('start-download-update', async () => {
  logger.info('[更新] 渲染进程请求开始下载更新')
  startDownloadUpdate()
})

// ==================== 微信机器人工作包管理 ====================

/**
 * 查找可用端口
 */
function findAvailablePort(startPort = 19088) {
  const net = require('net')

  return new Promise((resolve, reject) => {
    const server = net.createServer()

    server.listen(startPort, () => {
      const port = server.address().port
      server.close(() => {
        resolve(port)
      })
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // 端口被占用，尝试下一个
        resolve(findAvailablePort(startPort + 1))
      } else {
        reject(err)
      }
    })
  })
}

// 准备工作包
ipcMain.handle('wx-prepare-workpackage', async (event, config) => {
  try {
    logger.info('[微信工作包] 开始准备工作包')

    // 使用固定的临时目录
    const tempDir = path.join(os.tmpdir(), 'alien-wxpush')

    // 创建临时目录
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // 压缩包和解压目录的路径
    const zipPath = path.join(tempDir, 'WeChat.zip')
    const extractDir = path.join(tempDir, 'WeChat')

    // ========== 第一步：检查解压目录是否存在且 MD5 正确 ==========
    const wechatExePath = path.join(extractDir, 'WeChat.exe')
    const wechatVersionPath = path.join(extractDir, '[3.9.2.23]', 'WeChat.exe')

    let extractDirValid = false

    if (fs.existsSync(extractDir) && fs.existsSync(wechatExePath)) {
      logger.info('[微信工作包] 发现已有解压目录，检查 MD5')

      try {
        const wechatMD5 = await calculateFileMD5(wechatExePath)
        logger.info('[微信工作包] WeChat.exe MD5:', wechatMD5)

        let versionMD5Valid = true
        if (fs.existsSync(wechatVersionPath)) {
          const versionMD5 = await calculateFileMD5(wechatVersionPath)
          logger.info('[微信工作包] [3.9.2.23]\\WeChat.exe MD5:', versionMD5)
          versionMD5Valid = (versionMD5 === EXPECTED_WECHAT_MD5)
        }

        if (wechatMD5 === EXPECTED_WECHAT_MD5 && versionMD5Valid) {
          logger.info('[微信工作包] ✅ 解压目录有效，MD5 校验通过，直接使用')
          extractDirValid = true

          // 更新缓存
          wxWorkPackageCache.zipPath = zipPath
          wxWorkPackageCache.extractDir = extractDir

          return { success: true, workDir: extractDir }
        } else {
          logger.warn('[微信工作包] ⚠️ 解压目录 MD5 不匹配，需要重新解压')
        }
      } catch (error) {
        logger.error('[微信工作包] 检查解压目录 MD5 失败:', error)
      }
    } else {
      logger.info('[微信工作包] 解压目录不存在')
    }

    // ========== 第二步：检查压缩包是否存在 ==========
    let needDownload = false

    if (fs.existsSync(zipPath)) {
      logger.info('[微信工作包] 发现已有压缩包，无需重新下载')
      needDownload = false
    } else {
      logger.info('[微信工作包] 压缩包不存在，需要下载')
      needDownload = true
    }

    // ========== 第三步：如果需要下载，则下载压缩包 ==========
    if (needDownload) {
      logger.info('[微信工作包] 开始下载')

      const writer = fs.createWriteStream(zipPath)

      // 修改下载地址
      const downloadUrl = 'http://119.23.54.15/windows/WeChat.zip'
      logger.info('[微信工作包] 下载地址:', downloadUrl)

      let downloadAborted = false

      const response = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
        // 支持取消下载
        cancelToken: new axios.CancelToken((cancel) => {
          // 监听取消下载事件
          ipcMain.once('wx-cancel-download', () => {
            logger.info('[微信工作包] 用户取消下载')
            downloadAborted = true
            cancel('用户取消下载')
          })
        })
      })

      // 获取文件总大小
      const totalLength = parseInt(response.headers['content-length'], 10)
      let downloadedLength = 0
      let lastProgressTime = Date.now()
      let lastDownloadedLength = 0

      logger.info('[微信工作包] 文件总大小:', totalLength, '字节')

      // 保存 webContents 引用（event.sender 在异步回调中可能失效）
      const senderWebContents = event.sender

      // 监听下载进度
      response.data.on('data', (chunk) => {
        downloadedLength += chunk.length

        // 每 500ms 更新一次进度（避免更新太频繁）
        const now = Date.now()
        if (now - lastProgressTime >= 500 || downloadedLength === totalLength) {
          const timeDiff = (now - lastProgressTime) / 1000 // 秒
          const sizeDiff = downloadedLength - lastDownloadedLength
          const speed = timeDiff > 0 ? sizeDiff / timeDiff : 0

          const progress = {
            loaded: downloadedLength,
            total: totalLength,
            percentage: totalLength ? Math.round((downloadedLength * 100) / totalLength) : 0,
            speed: Math.round(speed),
            remaining: speed > 0 ? Math.round((totalLength - downloadedLength) / speed) : 0
          }

          // 发送下载进度到渲染进程（使用 win 而不是 event.sender）
          if (win && !win.isDestroyed()) {
            win.webContents.send('wx-download-progress', progress)
            logger.info(`[微信工作包] 已发送进度到渲染进程: ${progress.percentage}%`)
          }

          logger.info(`[微信工作包] 下载进度: ${progress.percentage}% (${downloadedLength}/${totalLength})`)

          lastProgressTime = now
          lastDownloadedLength = downloadedLength
        }
      })

      response.data.pipe(writer)

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)

        // 如果下载被取消，拒绝 Promise
        response.data.on('error', (error) => {
          if (axios.isCancel(error)) {
            reject(new Error('下载已取消'))
          } else {
            reject(error)
          }
        })
      })

      // 如果下载被取消，清理文件并返回
      if (downloadAborted) {
        if (fs.existsSync(zipPath)) {
          fs.unlinkSync(zipPath)
        }
        return { success: false, error: '下载已取消', cancelled: true }
      }

      logger.info('[微信工作包] 下载完成')
    }

    // ========== 第四步：解压压缩包 ==========
    logger.info('[微信工作包] 开始解压')

    // 如果已经存在旧的解压目录，先删除
    if (fs.existsSync(extractDir)) {
      logger.info('[微信工作包] 删除旧的解压目录')
      fs.rmSync(extractDir, { recursive: true, force: true })
    }

    const zip = new AdmZip(zipPath)
    zip.extractAllTo(extractDir, true)

    logger.info('[微信工作包] 解压完成:', extractDir)

    // 保存工作包信息到缓存
    wxWorkPackageCache.zipPath = zipPath
    wxWorkPackageCache.extractDir = extractDir

    logger.info('[微信工作包] 工作包准备完成，压缩包路径:', zipPath)

    return { success: true, workDir: extractDir }
  } catch (error) {
    logger.error('[微信工作包] 准备失败:', error)

    // 如果是取消错误，返回特殊标记
    if (axios.isCancel(error) || error.message === '下载已取消') {
      return { success: false, error: '下载已取消', cancelled: true }
    }

    return { success: false, error: error.message }
  }
})

// 取消下载（触发事件即可，在 wx-prepare-workpackage 中监听）
ipcMain.handle('wx-cancel-download', async () => {
  try {
    logger.info('[微信工作包] 触发取消下载事件')
    // 触发取消事件
    ipcMain.emit('wx-cancel-download')
    return { success: true }
  } catch (error) {
    logger.error('[微信工作包] 取消下载失败:', error)
    return { success: false, error: error.message }
  }
})

// 手动导入工作包
ipcMain.handle('wx-import-workpackage', async (event, config) => {
  try {
    logger.info('[微信工作包] 开始手动导入工作包')

    let zipPath = config.zipPath

    // 如果没有提供 zipPath，弹出文件选择对话框
    if (!zipPath) {
      const result = await dialog.showOpenDialog(win, {
        title: '选择微信工作包',
        filters: [
          { name: 'ZIP 压缩包', extensions: ['zip'] }
        ],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: '用户取消选择', cancelled: true }
      }

      zipPath = result.filePaths[0]
    }

    logger.info('[微信工作包] 选择的文件:', zipPath)

    // 检查文件是否存在
    if (!fs.existsSync(zipPath)) {
      throw new Error(`文件不存在: ${zipPath}`)
    }

    // 检查文件扩展名
    if (!zipPath.toLowerCase().endsWith('.zip')) {
      throw new Error('请选择 .zip 格式的压缩包')
    }

    // 使用固定的临时目录
    const tempDir = path.join(os.tmpdir(), 'alien-wxpush')

    // 创建临时目录
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // 解压到固定目录
    const extractDir = path.join(tempDir, 'WeChat')

    // 如果已经存在旧的解压目录，先删除
    if (fs.existsSync(extractDir)) {
      logger.info('[微信工作包] 删除旧的解压目录')
      fs.rmSync(extractDir, { recursive: true, force: true })
    }

    logger.info('[微信工作包] 开始解压:', zipPath)

    const zip = new AdmZip(zipPath)
    zip.extractAllTo(extractDir, true)

    logger.info('[微信工作包] 解压完成:', extractDir)

    // 复制用户选择的 zip 文件到临时目录（保存一份）
    const cachedZipPath = path.join(tempDir, 'WeChat.zip')
    if (zipPath !== cachedZipPath) {
      if (fs.existsSync(cachedZipPath)) {
        fs.unlinkSync(cachedZipPath)
      }
      fs.copyFileSync(zipPath, cachedZipPath)
      logger.info('[微信工作包] 已复制压缩包到:', cachedZipPath)
    }

    // 保存工作包信息到缓存
    wxWorkPackageCache.zipPath = cachedZipPath
    wxWorkPackageCache.extractDir = extractDir

    logger.info('[微信工作包] 手动导入完成')

    return { success: true, workDir: extractDir }
  } catch (error) {
    logger.error('[微信工作包] 手动导入失败:', error)
    return { success: false, error: error.message }
  }
})

// 启动微信进程
ipcMain.handle('wx-start-process', async (event, config) => {
  try {
    logger.info('[微信进程] 开始启动进程', config)

    const executablePath = path.join(config.workDir, config.executableName)

    // 检查可执行文件是否存在
    if (!fs.existsSync(executablePath)) {
      throw new Error(`可执行文件不存在: ${executablePath}`)
    }

    // WeChat.exe 的完整路径
    const wechatExePath = path.join(config.workDir, 'WeChat.exe')
    const wechatVersionPath = path.join(config.workDir, '[3.9.2.23]', 'WeChat.exe')

    // 检查 WeChat.exe 是否存在
    if (!fs.existsSync(wechatExePath)) {
      throw new Error(`WeChat.exe 不存在: ${wechatExePath}`)
    }

    // ========== MD5 校验：防止微信自动升级 ==========
    logger.info('[微信进程] 开始检查微信版本 MD5')

    let needRestore = false

    // 检查 WeChat.exe 的 MD5
    try {
      const wechatMD5 = await calculateFileMD5(wechatExePath)
      logger.info('[微信进程] WeChat.exe MD5:', wechatMD5)

      if (wechatMD5 !== EXPECTED_WECHAT_MD5) {
        logger.warn('[微信进程] ⚠️ WeChat.exe MD5 不匹配！预期:', EXPECTED_WECHAT_MD5, '实际:', wechatMD5)
        needRestore = true
      }
    } catch (error) {
      logger.error('[微信进程] 计算 WeChat.exe MD5 失败:', error)
      needRestore = true
    }

    // 检查 [3.9.2.23]\WeChat.exe 的 MD5
    if (fs.existsSync(wechatVersionPath)) {
      try {
        const versionMD5 = await calculateFileMD5(wechatVersionPath)
        logger.info('[微信进程] [3.9.2.23]\\WeChat.exe MD5:', versionMD5)

        if (versionMD5 !== EXPECTED_WECHAT_MD5) {
          logger.warn('[微信进程] ⚠️ [3.9.2.23]\\WeChat.exe MD5 不匹配！预期:', EXPECTED_WECHAT_MD5, '实际:', versionMD5)
          needRestore = true
        }
      } catch (error) {
        logger.error('[微信进程] 计算 [3.9.2.23]\\WeChat.exe MD5 失败:', error)
        needRestore = true
      }
    }

    // 如果 MD5 不匹配，需要恢复版本
    if (needRestore) {
      logger.warn('[微信进程] 检测到微信已被自动升级，开始恢复版本')

      // 检查是否有缓存的压缩包
      if (!wxWorkPackageCache.zipPath || !fs.existsSync(wxWorkPackageCache.zipPath)) {
        logger.warn('[微信进程] 缓存的压缩包不存在，需要重新下载')

        // 重新下载
        const tempDir = path.join(os.tmpdir(), 'alien-wxpush')
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true })
        }

        const zipPath = path.join(tempDir, 'WeChat.zip')
        const downloadUrl = 'http://119.23.54.15/windows/WeChat.zip'

        logger.info('[微信进程] 重新下载微信工作包:', downloadUrl)

        const writer = fs.createWriteStream(zipPath)
        const response = await axios({
          method: 'get',
          url: downloadUrl,
          responseType: 'stream'
        })

        response.data.pipe(writer)

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve)
          writer.on('error', reject)
        })

        wxWorkPackageCache.zipPath = zipPath
        logger.info('[微信进程] 下载完成:', zipPath)
      }

      // 使用缓存的压缩包重新解压
      logger.info('[微信进程] 使用压缩包恢复微信版本:', wxWorkPackageCache.zipPath)

      // 删除当前工作目录
      if (fs.existsSync(config.workDir)) {
        logger.info('[微信进程] 删除旧版本目录')
        fs.rmSync(config.workDir, { recursive: true, force: true })
      }

      // 重新解压
      const zip = new AdmZip(wxWorkPackageCache.zipPath)
      zip.extractAllTo(config.workDir, true)

      logger.info('[微信进程] ✅ 版本恢复完成')

      // 再次验证 MD5
      const restoredMD5 = await calculateFileMD5(wechatExePath)
      logger.info('[微信进程] 恢复后的 WeChat.exe MD5:', restoredMD5)

      if (restoredMD5 !== EXPECTED_WECHAT_MD5) {
        throw new Error(`版本恢复失败：MD5 仍不匹配 (${restoredMD5})`)
      }
    } else {
      logger.info('[微信进程] ✅ 微信版本 MD5 校验通过')
    }
    // ========== MD5 校验结束 ==========

    // 查找可用端口
    const httpPort = await findAvailablePort(19088)
    logger.info('[微信进程] 分配 HTTP 服务端口:', httpPort)

    // 启动 injector32.exe（注入器）
    // 参数格式: injector32.exe -w "路径\WeChat.exe" -m -P 端口号
    // -w: WeChat.exe 的完整路径
    // -m: 表示多开
    // -P: HTTP 服务监听端口
    // 注意：使用 spawn 参数数组时，不需要手动添加引号，spawn 会自动处理
    const args = [
      '-w', wechatExePath,  // 不要加引号！spawn 会自动处理带空格的路径
      '-m',
      '-P', httpPort.toString()
    ]

    logger.info('[微信进程] 启动注入器:', executablePath)
    logger.info('[微信进程] 参数:', JSON.stringify(args))
    logger.info('[微信进程] 工作目录:', config.workDir)

    // 不使用 shell，直接启动进程（这是最可靠的方式）
    const injector = spawn(executablePath, args, {
      cwd: config.workDir,
      detached: false,
      windowsVerbatimArguments: false, // 允许 Node.js 自动转义参数
      stdio: ['ignore', 'pipe', 'pipe'] // 忽略 stdin，捕获 stdout 和 stderr
    })

    // 捕获注入器输出（用于调试）
    if (injector.stdout) {
      injector.stdout.on('data', (data) => {
        logger.info('[注入器输出]', data.toString())
      })
    }

    if (injector.stderr) {
      injector.stderr.on('data', (data) => {
        logger.warn('[注入器错误]', data.toString())
      })
    }

    // 等待注入器完成
    await new Promise((resolve, reject) => {
      injector.on('exit', (code) => {
        logger.info('[微信进程] 注入器退出，代码:', code)
        // 注入器退出即表示完成（无论退出码是多少）
        resolve(null)
      })

      injector.on('error', (error) => {
        logger.error('[微信进程] 注入器启动失败:', error)
        reject(error)
      })

      // 超时保护（30秒）
      setTimeout(() => {
        reject(new Error('注入器执行超时'))
      }, 30000)
    })

    // 等待一下让 WeChat.exe 启动，增加等待时间
    logger.info('[微信进程] 等待微信进程启动...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 查找 WeChat.exe 进程（增加重试机制）
    logger.info('[微信进程] 查找 WeChat.exe 进程')
    let wechatPid = null
    let retryCount = 0
    const maxRetries = 5

    // 使用 tasklist 查找进程（Windows），带重试
    if (isWindows) {
      while (retryCount < maxRetries && !wechatPid) {
        try {
          const tasklistResult = execSync('tasklist /FI "IMAGENAME eq WeChat.exe" /FO CSV /NH', { encoding: 'utf8' })
          const lines = tasklistResult.trim().split('\n')

          logger.info('[微信进程] tasklist 输出:', tasklistResult)

          if (lines.length > 0 && lines[0] !== 'INFO: No tasks are running which match the specified criteria.') {
            // CSV 格式: "WeChat.exe","12345","Console","1","123,456 K"
            const match = lines[0].match(/"WeChat\.exe","(\d+)"/)
            if (match) {
              wechatPid = parseInt(match[1])
              logger.info('[微信进程] 找到 WeChat.exe, PID:', wechatPid)
              break
            }
          }
        } catch (err) {
          logger.warn('[微信进程] 查找进程失败:', err.message)
        }

        if (!wechatPid) {
          retryCount++
          logger.info(`[微信进程] 未找到进程，重试 ${retryCount}/${maxRetries}`)
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }

    if (!wechatPid) {
      throw new Error('未找到 WeChat.exe 进程，微信可能启动失败')
    }

    // 保存 WeChat 进程信息
    wxProcess = { pid: wechatPid, port: httpPort }

    return { success: true, pid: wechatPid, port: httpPort }
  } catch (error) {
    logger.error('[微信进程] 启动失败:', error)
    return { success: false, error: error.message }
  }
})

// 停止微信进程
ipcMain.handle('wx-stop-process', async (event, config) => {
  try {
    logger.info('[微信进程] 停止进程, PID:', config.pid)

    if (!wxProcess) {
      return { success: true }
    }

    // 在 Windows 上使用 taskkill 结束 WeChat.exe
    if (isWindows) {
      try {
        // 先尝试正常结束
        logger.info('[微信进程] 使用 taskkill 结束进程')
        execSync(`taskkill /PID ${config.pid} /T`, { encoding: 'utf8' })

        // 等待一下，如果还没结束就强制结束
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 检查进程是否还存在
        try {
          const checkResult = execSync(`tasklist /FI "PID eq ${config.pid}" /FO CSV /NH`, { encoding: 'utf8' })
          if (checkResult.includes('WeChat.exe')) {
            // 进程还在，强制结束
            logger.warn('[微信进程] 强制结束进程')
            execSync(`taskkill /F /PID ${config.pid} /T`, { encoding: 'utf8' })
          }
        } catch (e) {
          // 进程已不存在，忽略错误
        }

        wxProcess = null
        logger.info('[微信进程] 进程已停止')
        return { success: true }
      } catch (error) {
        logger.error('[微信进程] taskkill 失败:', error)
        // 尝试使用 process.kill
        try {
          process.kill(config.pid)
          wxProcess = null
          return { success: true }
        } catch (killError) {
          throw error
        }
      }
    } else {
      // 非 Windows 系统
      try {
        process.kill(config.pid, 'SIGTERM')

        // 等待进程结束
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 强制结束
        try {
          process.kill(config.pid, 'SIGKILL')
        } catch (e) {
          // 进程可能已经结束
        }

        wxProcess = null
        return { success: true }
      } catch (error) {
        throw error
      }
    }
  } catch (error) {
    logger.error('[微信进程] 停止失败:', error)
    wxProcess = null
    return { success: false, error: error.message }
  }
})

// 清理临时文件
ipcMain.handle('wx-cleanup', async (event, config) => {
  try {
    logger.info('[微信工作包] 清理请求（保留文件，仅清理缓存引用）:', config.workDir)

    // 不删除解压目录和压缩包，因为下次启动时还可以继续使用
    // 这样可以避免重复下载和解压，节省时间

    // 只清理内存中的缓存引用（不清理实际文件）
    // 注意：不清理 wxWorkPackageCache，因为它在下次启动时还会用到

    logger.info('[微信工作包] 清理完成（文件已保留用于下次启动）')
    logger.info('[微信工作包] - 压缩包:', wxWorkPackageCache.zipPath)
    logger.info('[微信工作包] - 解压目录:', wxWorkPackageCache.extractDir)

    return { success: true }
  } catch (error) {
    logger.error('[微信工作包] 清理失败:', error)
    return { success: false, error: error.message }
  }
})

// ==================== 微信机器人工作包管理结束 ====================

// 启动消息服务器
ipcMain.handle('wx-start-message-server', async (event, config) => {
  try {
    logger.info('[消息服务器] 启动服务器', config)

    let port = config.fixedPort

    // 如果指定了固定端口（用于重启后恢复），优先使用该端口
    if (port) {
      logger.info('[消息服务器] 使用固定端口启动:', port)
      // 记录端口占用
      if (!usedMessagePorts.has(port)) {
        usedMessagePorts.add(port)
      }
      // 额外检查端口是否可用（避免被其他进程占用）
      const available = await isPortAvailable(port)
      if (!available) {
        throw new Error(`固定端口 ${port} 已被占用，无法启动消息服务器`)
      }
    } else {
      // 未指定固定端口时，自动分配可用端口
      port = await findAvailableMessagePort()
    }

    // 启动服务器
    await messageServerManager.startServer(
      config.robotId,
      port,
      {
        wxHttpHost: config.wxHttpHost,
        wxHttpPort: config.wxHttpPort
      },
      config.robotInfo
    )

    logger.info(`[消息服务器] 服务器已启动，机器人: ${config.robotId}, 端口: ${port}`)

    // 输出所有服务器状态
    messageServerManager.printStatus()

    return { success: true, port }
  } catch (error) {
    logger.error('[消息服务器] 启动失败:', error)
    return { success: false, error: error.message }
  }
})

// 停止消息服务器
ipcMain.handle('wx-stop-message-server', async (event, robotId) => {
  try {
    logger.info('[消息服务器] 停止服务器:', robotId)

    const port = messageServerManager.getPort(robotId)
    messageServerManager.stopServer(robotId)

    if (port) {
      releaseMessagePort(port)
    }

    logger.info(`[消息服务器] 服务器已停止，机器人: ${robotId}`)

    return { success: true }
  } catch (error) {
    logger.error('[消息服务器] 停止失败:', error)
    return { success: false, error: error.message }
  }
})

// 更新机器人信息（用于消息服务器）
ipcMain.handle('wx-update-robot-info', async (event, config) => {
  try {
    logger.info('[消息服务器] 更新机器人信息:', config.robotId)

    messageServerManager.updateRobotInfo(config.robotId, config.robotInfo)

    return { success: true }
  } catch (error) {
    logger.error('[消息服务器] 更新机器人信息失败:', error)
    return { success: false, error: error.message }
  }
})

// 更新全局配置（baseUrl 和 token）
ipcMain.handle('update-app-config', async (event, config) => {
  try {
    if (config.baseUrl) {
      global.appConfig.baseUrl = config.baseUrl
      logger.info('[配置] 更新 baseUrl:', config.baseUrl)
    }
    if (config.token !== undefined) {
      global.appConfig.token = config.token || ''
      logger.info('[配置] 更新 token (长度:', global.appConfig.token.length, ')')
      if (!global.appConfig.token) {
        logger.warn('[配置] ⚠️ Token 为空，消息处理功能可能无法正常工作')
      }
    }
    logger.info('[配置] 当前 global.appConfig 状态:')
    logger.info('  baseUrl:', global.appConfig.baseUrl)
    logger.info('  token存在:', !!global.appConfig.token)
    logger.info('  token长度:', global.appConfig.token ? global.appConfig.token.length : 0)
    return { success: true }
  } catch (error) {
    logger.error('[配置] 更新配置失败:', error)
    return { success: false, error: error.message }
  }
})

// 获取所有消息服务器状态
ipcMain.handle('wx-get-message-servers', async () => {
  try {
    const servers = messageServerManager.getAllServers()
    logger.info('[消息服务器] 获取服务器列表:', servers.length)
    return { success: true, servers }
  } catch (error) {
    logger.error('[消息服务器] 获取服务器列表失败:', error)
    return { success: false, error: error.message, servers: [] }
  }
})

// 打印消息服务器状态（调试用）
ipcMain.handle('wx-print-message-servers', async () => {
  try {
    messageServerManager.printStatus()
    return { success: true }
  } catch (error) {
    logger.error('[消息服务器] 打印状态失败:', error)
    return { success: false, error: error.message }
  }
})

// electron处理程序 结束-----------------------------------------------------
