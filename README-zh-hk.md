# ts-liveview

**使用 TypeScript 構建混合 SSG/SSR 實時 SPA/MPA**

ts-liveview 從 Node.js 伺服器直接提供用戶界面，減少客戶端需要下載和執行的 JavaScript 體積。

客戶端運行時小於 13KB（壓縮後約 2.3KB）。

[English](./README.md) | [简体中文](./README-zh-cn.md)

## 快速開始

```bash
# 從模板創建新項目
npm init ts-liveview my-app

cd my-app

# 安裝依賴並設置數據庫
./scripts/init.sh

# 啟動開發伺服器
npm start
```

詳情請參閱 [create-ts-liveview](https://github.com/beenotung/create-ts-liveview)

## 配置

- 環境變數：`.env`（參考 [.env.example](./.env.example) 及 [server/env.ts](./server/env.ts)）
- 網站設定：[server/config.ts](./server/config.ts)
- 數據庫結構：[db/README.md](./db/README.md)

## 主要功能

- [x] 混合渲染模式（啟動時預渲染、請求時伺服器渲染、運行時實時更新）
- [x] 支持 SPA、MPA 及混合路由架構
- [x] 支持 JSX，不依賴虛擬 DOM
- [x] 遵循 DOM 標準，兼容 CSS 框架和 Web Components
- [x] 按需加載（內置 sweetalert、swiper、chart.js 等庫）
- [x] 支持自定義客戶端 TypeScript 模組
- [x] JavaScript 禁用時仍可通過連結和表單運作
- [x] 輕量級 WebSocket 協議
- [x] 自動重連
- [x] 兼容 express.js
- [x] 內置語言和時區支持
- [x] CSRF 保護（通過 `SameSite=Lax` cookies）
- [x] 多維度用量限制（IP、用戶、目標、全局）
- [x] 多種起始模板（minimal、web、ionic、auth 等）

## npm 指令

| 指令 | 說明 |
|------|------|
| `npm start` | 啟動開發伺服器（實時更新、熱重載） |
| `npm run build` | 編譯 TypeScript 並打包客戶端 |
| `npm run format` | 使用 prettier 格式化代碼 |
| `npm run lint` | 使用 eslint 檢查代碼 |
| `npm run fix` | 自動添加 `.js` 擴展名（ESM 運行時需要） |
| `npm run size` | 檢查打包後的體積 |

## 體積比較

| 工具 | 運行時體積（壓縮後） |
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
- v5-minimal-template - 單頁起點
- v5-minimal-without-db-template - 無數據庫版本
- v5-web-template - 響應式 Web 應用
- v5-ionic-template - 移動優先應用
- v5-hybrid-template - Web/Ionic 混合版
- v5-auth-template - 含登入/註冊/郵箱驗證
- v5-auth-web-template - 響應式認證版
- v5-auth-ionic-template - 移動優先認證版

## 示例

- [Thermostat](https://liveviews.cc/thermostat) - 實時控制
- [Chatroom](https://liveviews.cc/chatroom) - 即時聊天
- [Editor](https://liveviews.cc/editor) - 圖片編輯器
- [Form](https://liveviews.cc/form) - 表單處理
- [Auto-complete](https://liveviews.cc/auto-complete) - 自動完成搜索

更多示例請參閱 [English README](./README.md#examples--demo)。

## 為什麼選擇伺服器渲染？

- 盡快呈現有意義的內容（直接回應 HTML，無需等待腳本和 AJAX 請求）
- 減少客戶端需要下載和執行的 JavaScript 體積
- 支持伺服器驅動的功能開關，客戶端只下載當前頁面所需內容
- 支持「空中更新」應用狀態和部署

## 為什麼使用 JSX？

早期版本使用模板字串構建 HTML。雖然可以通過輔助函數避免 XSS 攻擊，但容易出錯。

使用 JSX 後，字串值會自動轉義，有效防止動態內容的 XSS 攻擊。

## 為什麼不使用虛擬 DOM？

ts-liveview 使用 CSS 選擇器精確更新 DOM，減少伺服器記憶體需求，更好地支持大量並發連接。

可配合 [S.js](https://github.com/adamhaile/S)、[RxJS](https://github.com/ReactiveX/rxjs) 或 getter/setter 實現響應式狀態管理。

## 常用功能模板

- [x] 可折疊導航欄（響應式）
- [x] 可折疊側邊欄（響應式）
- [x] 底部標籤欄（Ionic）
- [x] 登入/註冊
- [ ] OAuth
- [x] 郵箱驗證
- [x] SMS 驗證
- [ ] 重設密碼
- [ ] 登入記錄

## 客戶端自定義代碼

雖然 ts-liveview 以伺服器為中心，但也支持複雜的客戶端交互：

**簡單代碼**：在頁面中直接編寫內聯 JavaScript。

**組織代碼**：使用 TypeScript 模組，通過 `loadClientPlugin` 函數加載：
- 使用 TypeScript（而非內聯 JavaScript 字串）
- 可導入其他文件和 npm 套件
- 按頁面打包，不影響其他頁面載入速度

**應用示例**：
- Canvas 動畫（confetti 粒子效果）
- 豐富的 UI 組件（sweetalert2 彈窗）
- 實時媒體處理（MediaPipe 人臉追蹤、TensorFlow.js 機器學習、WebRTC 視頻串流）

詳見 [demo-plugin.tsx](./server/app/pages/demo-plugin.tsx) 和 [demo-typescript-page.tsx](./server/app/pages/demo-typescript-page.tsx)。

## 用量限制

配置文件：[server/rate-limits.ts](./server/rate-limits.ts)

使用 token bucket 算法，支持 IP、用戶、目標（郵箱/電話）和全局維度的用量限制。

## 部署說明

部署到生產環境：

1. 配置 [scripts/config](./scripts/config)
2. 執行 `./scripts/deploy.sh`

這會自動構建並使用 knex migrate 和 pm2 部署伺服器。

### 開發 HTTPS

某些功能需要 HTTPS（如相機、麥克風）。開發環境設置：

1. 安裝 caddy：`./scripts/caddy-install.sh`（Mac/Linux）或 `./scripts/caddy-install.ps1`（Windows）
2. 在 `.env` 中啟用：`CADDY_PROXY=enable`

## 靈感來源

- [Phoenix LiveView](https://dockyard.com/blog/2018/12/12/phoenix-liveview-interactive-real-time-apps-no-need-to-write-javascript) - 初始 HTML 回應和 WebSocket 實時更新的概念
- [htmx](https://htmx.org) - 基於屬性的事件處理
- [Surplus](https://github.com/adamhaile/surplus)、[Stencil](https://stenciljs.com/docs/templating-jsx)、[React](https://reactjs.org/docs/react-without-jsx.html) - JSX 語法

## 版本記錄

詳情請參閱 [Changelog](./CHANGELOG.md)

## 授權條款

本項目採用 [BSD-2-Clause](./LICENSE) 授權。

這是自由開源軟體，您可以自由運行、研究、分發和修改。
