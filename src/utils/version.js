import * as utils from '@/uni_modules/hic-upgrade/utils/index.js';
import { toast } from '@/uni_modules/hic-plugin';

/**
 * @description 版本更新
 * @param {Boolean} tip 是否显示提示信息
 *  app初始化进行版本判断, 不显示提示信息   -> false
 *  关于页面 手动点击版本更新, 显示提示信息   -> true
 */
export async function versionUpdate(tip) {
    try {
        // console.log('[版本更新] 开始检测版本更新, tip:', tip);
        
        // 先拿到本地真实 versionCode，避免出现 0 < 服务端 code 导致误走整包/静默热更
        await utils.getVersionInfo();

        // 1 请求返回服务端版本信息
        // console.log('[版本更新] 正在请求服务器版本信息...');
        const res = await getLatestVersion({
            platform: utils.platform // 运行平台
        });
        
        if (!res) {
            // console.warn('[版本更新] 服务器返回数据为空');
            if (tip) toast('暂无更新');
            return;
        }
        
        // console.log('[版本更新] 服务器版本信息:', {
        //     versionName: res.versionName,
        //     versionCode: res.versionCode,
        //     downloadUrl: res.downloadUrl,
        //     wgtUrl: res.wgtUrl
        // });
        
        // 2 存储服务端版本信息
        utils.setServerInfo({
            version: res.versionName,
            versionCode: res.versionCode,
            downloadUrl: res.downloadUrl,
            wgtUrl: res.wgtUrl,
            forceUpdate: res.forceUpdate,
            isSilently: res.isSilently,
            desc: res.versionDesc
        });
        
        // 获取当前版本信息用于对比
        const currentVersion = utils.getCurrentVersion();
        // console.log('[版本更新] 当前版本信息:', {
        //     version: currentVersion.version,
        //     versionCode: currentVersion.versionCode
        // });
        
        // 3 判断是否更新
        const needUpdate = utils.isUpdate();
        // console.log('[版本更新] 是否需要更新:', needUpdate);
        
        if (!needUpdate) {
            // console.log('[版本更新] 已是最新版本，无需更新');
            if (tip) toast('已是最新版本');
            return;
        }
        
        const updateInfo = utils.getUpdateInfo();
        const info = utils.getServerVersion();
        // console.log('[版本更新] 更新信息:', {
        //     type: updateInfo.type,
        //     url: updateInfo.url,
        //     isSilently: info.isSilently
        // });
        
        // 4 wgt 静默更新
        if (updateInfo.type == 'wgt' && info.isSilently) {
            // console.log('[版本更新] 开始静默更新 (wgt)');
            const path = await utils.downloadFile(updateInfo.url);
            // 下载完成 直接安装 下次启动生效
            await utils.installForAndroid(path);
            // console.log('[版本更新] 静默更新完成');
            return;
        }
        
        // 5 跳转页面 提示更新
        // console.log('[版本更新] 跳转到更新页面');
        await utils.toUpgradePage('/uni_modules/hic-upgrade/pages/upgrade');
        // console.log('[版本更新] 更新流程完成');
    } catch (err) {
        // 错误处理：记录错误日志，但不干扰应用正常使用
        // console.error('[版本更新] 检测失败:', err);
        // console.error('[版本更新] 错误堆栈:', err.stack);
        if (tip) {
            toast('检查更新失败，请稍后重试');
        }
    }
}

/**
 * 获取最新版本信息
 * @param {Object} data 平台信息
 * @returns {Promise} 版本信息
 */
export function getLatestVersion(data) {
    return new Promise((resolve, reject) => {
        // 更新服务器地址
        const baseUrl = 'http://119.23.54.15/app';
        const versionUrl = `${baseUrl}/latest.yml`;
        // console.log('[版本更新] 请求URL:', versionUrl);
        
        uni.request({
        	url: versionUrl,
        	method: 'GET',
        	header: {
        		'Content-Type': 'application/json', //自定义请求头信息
        	},
        	success: (res) => {
				// console.log('[版本更新] 服务器响应状态码:', res.statusCode);
				// console.log('[版本更新] 服务器响应数据:', res.data);
				
				if (!res || !res.data) {
					// console.error('[版本更新] 服务器返回数据为空');
					reject(new Error('Invalid response data'));
					return;
				}
				
				let str = res.data;
				let versionData = {}
				try {
					// 使用正则表达式直接解析 YAML 格式
					// 匹配 version: '1.1.9' 或 version: "1.1.9" 或 version: 1.1.9
					const versionMatch = str.match(/version:\s*['"]?([^'\n"]+)['"]?/);
					if (versionMatch) {
						versionData.version = versionMatch[1].trim();
					}
					
					// 匹配 versionCode: 119
					const versionCodeMatch = str.match(/versionCode:\s*(\d+)/);
					if (versionCodeMatch) {
						versionData.versionCode = parseInt(versionCodeMatch[1], 10);
					}
					
					// 匹配 versionDesc: '...' 或 versionDesc: "..."
					// 处理多行字符串（包含 \n）
					const versionDescMatch = str.match(/versionDesc:\s*['"]([^'"]*(?:\\n[^'"]*)*)['"]/);
					if (versionDescMatch) {
						// 将 \n 转换为实际的换行符
						versionData.versionDesc = versionDescMatch[1].replace(/\\n/g, '\n');
					}
					
					// console.log('[版本更新] 解析后的版本数据:', versionData);
					
					// 验证必要字段
					if (!versionData.version || !versionData.versionCode) {
						throw new Error('缺少必要的版本信息字段');
					}
				} catch (e) {
					// console.error('[版本更新] YAML解析失败:', e);
					// console.error('[版本更新] 原始数据:', str);
					// 解析失败，使用默认值
					versionData = {
						version: '0.0.0',
						versionCode: 0,
						versionDesc: ''
					};
				}
				
        		// 获取应用的基本信息
        		// #ifdef APP-PLUS
        		if (typeof plus !== 'undefined' && plus.runtime) {
        		plus.runtime.getProperty(plus.runtime.appid, function(wgtinfo) {
        			// console.log('[版本更新] 当前应用版本信息:', {
        			// 	version: wgtinfo.version,
        			// 	versionCode: wgtinfo.versionCode
        			// });
        			
        			// 注意：versionName 应该保持原始格式（如 '1.1.7'），不要去掉点号
        			// versionCode 应该是数字类型
        			const serverVersion = versionData.version || '0.0.0';
        			const serverVersionCode = parseInt(versionData.versionCode) || 0;
        			
        			const resd = {
        				versionName: serverVersion, // 保持原始格式，如 '1.1.7'
        				versionCode: serverVersionCode, // 数字类型，如 117
        				downloadUrl: `${baseUrl}/apk/zorotool.apk`,
        				wgtUrl: `${baseUrl}/wgt/zorotool.wgt`,
        				forceUpdate: 0,
        				isSilently: 0,
        				versionDesc: versionData.versionDesc || ''
        			}
        			
        			// console.log('[版本更新] 返回的版本信息:', resd);
        			resolve(resd);
        		});
				} else {
					// console.error('[版本更新] plus.runtime 不可用');
					reject(new Error('plus.runtime is not available'));
				}
        		// #endif
        		// #ifndef APP-PLUS
        		reject(new Error('Only available in APP-PLUS'));
        		// #endif
        	},
        	fail: (err) => {
        		// console.error('[版本更新] 请求失败:', err);
        		reject(err);
        	}
        })
    });
}