# 小星星成长记

一个面向低龄儿童家庭的正向激励应用。孩子完成日常任务后收集星星，并用星星兑换亲子互动、体验或小奖励；家长还可以查看完成统计、备份数据，并通过 Gemini 获取任务和冷静活动建议。

## 功能

- 任务打卡、星星收集与奖励兑换
- 成就墙、今日/本周/累计完成统计
- 冷静角呼吸引导与活动轮换
- 家长自定义任务、奖励和孩子昵称
- Gemini 育儿建议与语音鼓励
- 本地数据备份、恢复和 PWA 离线能力
- Capacitor Android 工程

## 本地运行

需要 Node.js 18 或更高版本。

```bash
npm install
```

在项目根目录创建 `.env.local`：

```dotenv
GEMINI_API_KEY=你的_Gemini_API_Key
```

然后启动开发服务器：

```bash
npm run dev
```

生产构建和类型检查：

```bash
npm run build
npx tsc --noEmit
```

## Android

先生成 Web 构建并同步到 Capacitor：

```bash
npm run build
npx cap sync android
```

之后可使用 Android Studio 打开 `android` 目录。

## 数据与安全

应用数据保存在设备的 `localStorage` 中，不会自动同步到云端。`.env.local`、APK、密钥库、构建产物和本地 IDE 配置均已加入 `.gitignore`。

当前 Gemini 调用直接发生在浏览器/Android WebView 中，因此生产构建中的 API Key 可被设备端用户提取。公开部署前应改为由可信后端代理 Gemini 请求，并为密钥设置 API 限制和配额。
