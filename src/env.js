// .env.js 文件
// 不同环境访问不同的路径
// import store from '@/common/store/index'

//登录接口
const ADMIN_API_ROOT = 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run/'

const ENV_LOGIN_URL = {
	development: ADMIN_API_ROOT,
	production: ADMIN_API_ROOT,
}
//项目接口
const ENV_API_URL = {
	development: ADMIN_API_ROOT,
	production: ADMIN_API_ROOT,
}

//图片上传
const IMG_UPLOAD_URL ='https://**/';

//图片显示
const ck_URL ='http://s3j98umt4.hd-bkt.clouddn.com/';

// process.env.NODE_ENV
export const LOGIN_URL = ENV_LOGIN_URL['development']; //后台根域名
export const API_URL = ENV_API_URL['development']; //后台接口域名
export const MAP_URL = ck_URL; //地图接口
export const IMG_URL = IMG_UPLOAD_URL; //图片上传接口 