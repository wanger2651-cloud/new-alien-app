import { UniEntryAbility } from "@dcloudio/uni-app-runtime";
import { initUniModules } from "../uni_modules/index.generated";
import window from "@ohos.window";

initUniModules();

export default class EntryAbility extends UniEntryAbility {
  constructor() {
    super("__UNI__CABEF04", {
      // 未运行 `npm run dev:app-harmony` 时必须为 false，否则会加载 -dev 框架导致白屏
      debug: false,
    });
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    super.onWindowStageCreate(windowStage);
    // 尽早关闭系统启动页，避免中间 logo 闪屏
    windowStage.removeStartingWindow().catch(() => {});
  }
}
