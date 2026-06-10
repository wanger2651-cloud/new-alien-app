# 青柠助手 · 鸿蒙（HarmonyOS）调试与上架指南

本项目为 **uni-app（Vue3）**，应用名：**青柠助手**，包名：`com.qingningzhushou.helper`。

## 目录说明

| 路径 | 用途 |
|------|------|
| `D:\qingning\new-alien-app\src\` | 日常开发源码（在 Cursor / HBuilderX 编辑） |
| `dist/build/app-harmony/` | `npm run build:app-harmony` 生成的前端资源（www） |
| `harmony-native/` | **用 DevEco Studio 打开的原生工程**（调试、打包、上架） |

> 不要打开 `D:\huawei` 那种只拷了 `.vue` 的目录，那不是鸿蒙原生工程。

---

## 一、日常开发流程

### 1. 改代码后编译前端

```powershell
cd D:\qingning\new-alien-app
npm run build:app-harmony
```

### 2. 同步到 DevEco 工程

```powershell
npm run sync:harmony-www
```

### 3. 用 DevEco Studio 打开

1. 启动 **DevEco Studio 5**
2. **File → Open** → 选择文件夹：  
   `D:\qingning\new-alien-app\harmony-native`
3. 等待 Sync / Index 完成
4. **Build → Rebuild Project**
5. 连接鸿蒙真机或模拟器 → 点击 **Run** 调试

开发时若只改 Vue/JS，重复「编译 → sync → DevEco Run」即可。

---

## 二、签名配置（上架必做）

当前 `build-profile.json5` 里 `signingConfigs` 为空，上架前必须在 DevEco 配置签名：

1. 登录 [AppGallery Connect](https://developer.huawei.com/consumer/cn/service/josp/agc/index.html)
2. 创建应用，包名与 `com.qingningzhushou.helper` 一致
3. 在 AGC 生成/下载 **调试证书、发布证书** 及 Profile
4. DevEco：**File → Project Structure → Signing Configs**
   - 配置 debug（调试用）
   - 配置 release（上架用）
5. 或在 `src/manifest.json` 的 `app-harmony.distribute.signingConfigs` 中填写（需按 DCloud/uni-app 文档与 AGC 一致）

---

## 三、打正式包（Release）

1. DevEco 顶部选择 **Product: release**（或 default，视你配置的 product 而定）
2. **Build → Build Hap(s)/APP(s) → Build APP(s)**（或 Build Hap）
3. 产物一般在：  
   `harmony-native/build/outputs/` 或 `entry/build/release/outputs/`

上架华为应用市场需使用 **已签名的 Release 包**，并满足图标、隐私政策、权限说明等审核要求。

---

## 四、版本号

- 业务版本：改 `src/manifest.json` 的 `versionName` / `versionCode`
- 鸿蒙壳版本：改 `harmony-native/AppScope/app.json5`（需与 manifest 保持一致）

当前已对齐为：**1.0.2 (102)**。

---

## 五、Windows 环境变量（若构建报错）

在 **用户环境变量** 中配置（设置后需重启 DevEco）：

| 变量名 | 示例值 |
|--------|--------|
| `DEVECO_SDK_HOME` | `D:\DevEcoStudio5\DevEco Studio\sdk` |
| `JAVA_HOME` | `D:\DevEcoStudio5\DevEco Studio\jbr` |

并把 `%JAVA_HOME%\bin` 加入用户 `Path`。

常见报错：

- `Invalid value of DEVECO_SDK_HOME` → 未设置或路径错误
- `spawn java ENOENT` → 未安装/未配置 Java，使用 DevEco 自带 `jbr` 即可

---

## 六、白屏排查

### 现象：安装成功、Launching 成功，但模拟器全白

常见原因：**未启动 uni-app 开发服务，却使用了 debug 开发框架**。

`EntryAbility.ets` 里 `debug` 必须为 `false`（当前已配置）。  
只有同时运行 `npm run dev:app-harmony` 做热更新时，才用 `debug: true`。

正确发布/调试流程：

```powershell
cd D:\qingning\new-alien-app
npm run harmony:prepare
```

DevEco：**Rebuild → Run**。

---

## 七、常见问题

### Q: 报错 `Index.ets does not exist`

说明打开的是**错误的工程**（例如只有 vue 的 `D:\huawei`）。请打开 `harmony-native`。

### Q: `npm run build:app-harmony` 后 dist 里只有 js/css，没有 entry/

正常。CLI 只产出 www；原生壳在 `harmony-native`，用 `npm run sync:harmony-www` 合并。

### Q: 首次从 HBuilderX 迁到纯 CLI

若 `harmony-native` 损坏，可从历史完整工程（如 `D:\waimai\new-alien-app\dist\build\app-harmony`）复制壳层，再执行 sync。

---

## 八、上架检查清单

- [ ] AGC 应用已创建，包名 `com.qingningzhushou.helper`
- [ ] Release 签名与 Profile 已配置
- [ ] 图标、启动图符合鸿蒙规范（避免过小 PNG 警告）
- [ ] 隐私政策 URL、权限说明已在应用市场后台填写
- [ ] 真机全流程测试：登录、网络、相机/通知等权限
