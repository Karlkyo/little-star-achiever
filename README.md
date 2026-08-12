<div align="center">

# ⭐ 小星星成长记

用温柔、清晰的正向反馈，记录孩子每一次小小进步。

[![CI](https://github.com/Karlkyo/little-star-achiever/actions/workflows/ci.yml/badge.svg)](https://github.com/Karlkyo/little-star-achiever/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)

</div>

「小星星成长记」是一款面向 3–5 岁儿童家庭的正向激励应用。孩子完成刷牙、收拾玩具、耐心等待等任务后获得星星，再用星星兑换拥抱、亲子活动或小奖励。数据默认保存在设备本地，家长可以自定义内容、查看成长统计和备份数据。

## 功能亮点

- ⭐ 任务打卡、动态星星罐和奖励兑换
- 🏆 今日、本周与累计统计，以及成就墙
- 🌿 冷静角呼吸引导和情绪调节活动
- 👪 家长自定义昵称、任务、奖励和冷静活动
- 🤖 Gemini 生成育儿建议和中文语音鼓励
- 💾 本地数据备份与恢复
- 📱 PWA 离线支持和 Capacitor Android 工程
- ♿ 大触控目标、语义标签和减少动态效果支持

## 技术栈

React 19、TypeScript、Vite、Tailwind CSS、Capacitor 6、Google GenAI SDK、vite-plugin-pwa。

## 快速开始

需要 Node.js 18 或更高版本，推荐 Node.js 20。

```bash
git clone https://github.com/Karlkyo/little-star-achiever.git
cd little-star-achiever
npm ci
```

复制环境变量示例，并填入你自己的 Gemini API Key：

```powershell
Copy-Item .env.example .env.local
```

macOS 或 Linux：

```bash
cp .env.example .env.local
```

`.env.local` 内容：

```dotenv
GEMINI_API_KEY=你的_Gemini_API_Key
```

启动开发服务器：

```bash
npm run dev
```

未配置 Gemini Key 时，基础的任务、奖励、统计、冷静角和备份功能仍可使用；AI 建议和语音功能不可用。

## 可用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run typecheck` | 运行 TypeScript 检查 |
| `npm run build` | 生成生产构建和 PWA 文件 |
| `npm run check` | 依次执行类型检查和生产构建 |
| `npm run preview` | 本地预览生产构建 |

## Android

```bash
npm run build
npx cap sync android
npx cap open android
```

之后可在 Android Studio 中运行或打包。`android/local.properties`、APK、AAB 和签名密钥不会提交到仓库。

## 数据与隐私

- 昵称、任务、奖励和统计默认保存在当前设备的 `localStorage`。
- 应用不会自动将这些数据同步到项目作者的服务器。
- 数据导出文件可能包含孩子昵称和行为记录，请像保护其他家庭数据一样妥善保管。
- Gemini 功能会把家长输入的情境发送给 Google Gemini API；请不要输入真实姓名、地址、学校或医疗等敏感信息。
- 本项目是家庭辅助工具，不提供医疗、心理或专业育儿建议。

## ⚠️ Gemini Key 与公开部署

当前实现为了方便本地体验，由 Vite 将 `GEMINI_API_KEY` 注入客户端构建。浏览器和 Android WebView 中的密钥都可能被提取，因此这种方式只适合本地开发、个人设备或受控演示。

公开部署前应将 Gemini 调用迁移到可信后端，并实现身份验证、限流、配额控制和输入校验。至少应为开发密钥设置 API 限制与低配额，且绝不能提交 `.env.local`。详见 [安全政策](SECURITY.md)。

## 路线图

- [ ] 将 Gemini 请求迁移至可选的安全后端代理
- [ ] 增加自动化单元测试与关键交互测试
- [ ] 改进本地数据版本迁移与导入校验
- [ ] 完善任务编辑、删除和防止误触机制
- [ ] 升级 Capacitor，并验证新版 Android 工程
- [ ] 增加更多语言和可配置的儿童年龄范围

欢迎通过 [Issue](https://github.com/Karlkyo/little-star-achiever/issues) 提出建议。

## 参与贡献

请阅读 [贡献指南](CONTRIBUTING.md) 和 [行为准则](CODE_OF_CONDUCT.md)。提交 Pull Request 前请运行：

```bash
npm run check
npm audit --omit=dev
```

安全问题请勿发布为公开 Issue，请按照 [SECURITY.md](SECURITY.md) 私密报告。

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

如果这个项目对你的家庭或开发工作有帮助，欢迎点一个 ⭐，也欢迎一起把它做得更温暖、更可靠。
