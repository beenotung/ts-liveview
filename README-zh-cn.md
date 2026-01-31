# ts-liveview

**使用 TypeScript 构建混合 SSG/SSR 实时 SPA/MPA**

ts-liveview 从 Node.js 服务器直接提供用户界面，减少客户端需要下载和执行的 JavaScript 体积。

客户端运行时小于 13KB（压缩后约 2.3KB）。

[English](./README.md) | [繁體中文](./README-zh-hk.md)

## 快速开始

```bash
# 从模板创建新项目
npm init ts-liveview my-app

cd my-app

# 安装依赖并设置数据库
./scripts/init.sh

# 启动开发服务器
npm start
```

详情请参阅 [create-ts-liveview](https://github.com/beenotung/create-ts-liveview)

## 配置

- 环境变量：`.env`（参考 [.env.example](./.env.example) 及 [server/env.ts](./server/env.ts)）
- 网站设置：[server/config.ts](./server/config.ts)
- 数据库结构：[db/README.md](./db/README.md)

## 主要功能

- [x] 混合渲染模式（启动时预渲染、请求时服务器渲染、运行时实时更新）
- [x] 支持 SPA、MPA 及混合路由架构
- [x] 支持 JSX，不依赖虚拟 DOM
- [x] 遵循 DOM 标准，兼容 CSS 框架和 Web Components
- [x] 按需加载（内置 sweetalert、swiper、chart.js 等库）
- [x] 支持自定义客户端 TypeScript 模块
- [x] JavaScript 禁用时仍可通过链接和表单运作
- [x] 轻量级 WebSocket 协议
- [x] 自动重连
- [x] 兼容 express.js
- [x] 内置语言和时区支持
- [x] CSRF 保护（通过 `SameSite=Lax` cookies）
- [x] 多维度用量限制（IP、用户、目标、全局）
- [x] 多种起始模板（minimal、web、ionic、auth 等）

## npm 指令

| 指令 | 说明 |
|------|------|
| `npm start` | 启动开发服务器（实时更新、热重载） |
| `npm run build` | 编译 TypeScript 并打包客户端 |
| `npm run format` | 使用 prettier 格式化代码 |
| `npm run lint` | 使用 eslint 检查代码 |
| `npm run fix` | 自动添加 `.js` 扩展名（ESM 运行时需要） |
| `npm run size` | 检查打包后的体积 |

## 体积比较

| 工具 | 运行时体积（压缩后） |
|------|---------------------|
| Vanilla | 0.3K |
| **ts-liveview** | **6.5K** |
| Stencil | 13.7K |
| Svelte | 17.4K |
| Vue | 49.3K |
| React | 144.6K |
| Angular | 155.8K |

## 起始模板

- v5-demo - 功能展示
- v5-minimal-template - 单页起点
- v5-minimal-without-db-template - 无数据库版本
- v5-web-template - 响应式 Web 应用
- v5-ionic-template - 移动优先应用
- v5-hybrid-template - Web/Ionic 混合版
- v5-auth-template - 含登录/注册/邮箱验证
- v5-auth-web-template - 响应式认证版
- v5-auth-ionic-template - 移动优先认证版

## 示例

- [Thermostat](https://liveviews.cc/thermostat) - 实时控制
- [Chatroom](https://liveviews.cc/chatroom) - 即时聊天
- [Editor](https://liveviews.cc/editor) - 图片编辑器
- [Form](https://liveviews.cc/form) - 表单处理
- [Auto-complete](https://liveviews.cc/auto-complete) - 自动完成搜索

更多示例请参阅 [English README](./README.md#examples--demo)。

## 为什么选择服务器渲染？

- 尽快呈现有意义的内容（直接回应 HTML，无需等待脚本和 AJAX 请求）
- 减少客户端需要下载和执行的 JavaScript 体积
- 支持服务器驱动的功能开关，客户端只下载当前页面所需内容
- 支持「空中更新」应用状态和部署

## 为什么使用 JSX？

早期版本使用模板字符串构建 HTML。虽然可以通过辅助函数避免 XSS 攻击，但容易出错。

使用 JSX 后，字符串值会自动转义，有效防止动态内容的 XSS 攻击。

## 为什么不使用虚拟 DOM？

ts-liveview 使用 CSS 选择器精确更新 DOM，减少服务器内存需求，更好地支持大量并发连接。

可配合 [S.js](https://github.com/adamhaile/S)、[RxJS](https://github.com/ReactiveX/rxjs) 或 getter/setter 实现响应式状态管理。

## 常用功能模板

- [x] 可折叠导航栏（响应式）
- [x] 可折叠侧边栏（响应式）
- [x] 底部标签栏（Ionic）
- [x] 登录/注册
- [ ] OAuth
- [x] 邮箱验证
- [x] SMS 验证
- [ ] 重置密码
- [ ] 登录记录

## 客户端自定义代码

虽然 ts-liveview 以服务器为中心，但也支持复杂的客户端交互：

**简单代码**：在页面中直接编写内联 JavaScript。

**组织代码**：使用 TypeScript 模块，通过 `loadClientPlugin` 函数加载：
- 使用 TypeScript（而非内联 JavaScript 字符串）
- 可导入其他文件和 npm 包
- 按页面打包，不影响其他页面加载速度

**应用示例**：
- Canvas 动画（confetti 粒子效果）
- 丰富的 UI 组件（sweetalert2 弹窗）
- 实时媒体处理（MediaPipe 人脸追踪、TensorFlow.js 机器学习、WebRTC 视频流）

详见 [demo-plugin.tsx](./server/app/pages/demo-plugin.tsx) 和 [demo-typescript-page.tsx](./server/app/pages/demo-typescript-page.tsx)。

## 用量限制

配置文件：[server/rate-limits.ts](./server/rate-limits.ts)

使用 token bucket 算法，支持 IP、用户、目标（邮箱/电话）和全局维度的用量限制。

## 部署说明

部署到生产环境：

1. 配置 [scripts/config](./scripts/config)
2. 执行 `./scripts/deploy.sh`

这会自动构建并使用 knex migrate 和 pm2 部署服务器。

### 开发 HTTPS

某些功能需要 HTTPS（如相机、麦克风）。开发环境设置：

1. 安装 caddy：`./scripts/caddy-install.sh`（Mac/Linux）或 `./scripts/caddy-install.ps1`（Windows）
2. 在 `.env` 中启用：`CADDY_PROXY=enable`

## 灵感来源

- [Phoenix LiveView](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript) - 初始 HTML 回应和 WebSocket 实时更新的概念
- [htmx](https://htmx.org) - 基于属性的事件处理
- [Surplus](https://github.com/adamhaile/surplus)、[Stencil](https://stenciljs.com/docs/templating-jsx)、[React](https://reactjs.org/docs/react-without-jsx.html) - JSX 语法

## 版本记录

详情请参阅 [Changelog](./CHANGELOG.md)

## 授权条款

本项目采用 [BSD-2-Clause](./LICENSE) 授权。

这是自由开源软件，您可以自由运行、研究、分发和修改。
