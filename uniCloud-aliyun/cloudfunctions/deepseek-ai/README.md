# DeepSeek AI 云函数

该云函数负责代理小程序对 DeepSeek API 的调用，避免 API Key 被打包到小程序前端。

部署前在微信云开发控制台为函数配置环境变量：

- `DEEPSEEK_API_KEY`: 重新生成的 DeepSeek API Key
- `DEEPSEEK_MODEL`: 可选，默认 `deepseek-v4-pro`

请求默认开启：

- `thinking.type`: `enabled`
- `reasoning_effort`: `high`
- `stream`: `false`

不要将真实 API Key 写入代码、配置文件或 Git 仓库。
