# 参与贡献

感谢你愿意帮助改进「小星星成长记」。无论是报告问题、完善文档，还是提交代码，都非常欢迎。

## 开始之前

- 请先搜索已有 Issue，避免重复讨论。
- Bug 请尽量包含复现步骤、预期结果、实际结果、浏览器或 Android 版本。
- 新功能请说明它解决的问题，以及是否适合 3–5 岁儿童和家长使用。
- 安全问题不要创建公开 Issue，请遵循 [SECURITY.md](SECURITY.md)。

## 本地开发

需要 Node.js 18 或更高版本。

```bash
git clone https://github.com/Karlkyo/little-star-achiever.git
cd little-star-achiever
npm ci
copy .env.example .env.local
npm run dev
```

macOS 或 Linux 可使用 `cp .env.example .env.local`。

Gemini 功能需要你自己的 API Key；不配置时仍可开发和使用基础的任务、奖励、统计与冷静角功能。

## 提交代码

1. 从 `main` 创建一个描述清晰的分支。
2. 保持改动聚焦，不要提交 `.env.local`、APK、构建产物或 IDE 配置。
3. 提交前运行：

   ```bash
   npm run check
   npm audit --omit=dev
   ```

4. 在 Pull Request 中说明改了什么、为什么改、如何验证；界面变化请附截图。

## 代码与界面原则

- 使用 TypeScript，避免无必要的 `any`。
- 优先保证低龄儿童可理解、大触控目标、清晰反馈和无障碍标签。
- 新增数据需要考虑 `localStorage` 兼容、备份导入和旧版本迁移。
- 不要把第三方 API 密钥或个人数据写入源码、日志、测试或截图。
- AI 建议只能作为辅助内容，不应替代医疗、心理或专业育儿意见。

提交贡献即表示你同意贡献内容按本项目的 [MIT License](LICENSE) 发布。
