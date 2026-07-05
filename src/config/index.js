const { NODE_ENV } = process.env;
const config = {
  development: {
    baseUrl: "https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run",
  },
  production: {
    baseUrl: "https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run",
  },
};

export default {
  baseUrl: config[NODE_ENV].baseUrl,
  shareUrl: config[NODE_ENV].shareUrl,
};