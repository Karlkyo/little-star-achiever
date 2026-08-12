# 独立演示版

这是「小星星成长记」的零依赖静态演示项目，不包含 Gemini、Google GenAI SDK、React、构建工具或任何远程请求。

## 运行方式

可以直接双击 `index.html`，也可以启动任意静态服务器：

```bash
python -m http.server 4173 --directory demo
```

然后打开 `http://localhost:4173`。

## 文件

- `index.html`：语义结构、对话框与页面内容
- `styles.css`：响应式纸质成长手帐视觉
- `app.js`：任务、奖励、成就、撤销、重置和 localStorage 数据逻辑

## 隐私

演示版不需要账户或 API Key，也不会发送网络请求。昵称和进度使用独立键 `little-star-achiever-demo-v1` 保存在当前浏览器，可使用右上角重置按钮随时清除。
