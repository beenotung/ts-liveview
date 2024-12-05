import { o } from '../jsx/jsx.js'
import { existsSync, readFileSync } from 'fs'
import { Switch } from '../components/router.js'
import { Raw } from '../components/raw.js'
import { prerender } from '../jsx/html.js'
import { Menu } from '../components/menu.js'
import SourceCode from '../components/source-code.js'
import { markdownToHtml } from '../format/markdown.js'
import { Routes } from '../routes.js'
import { StaticFile } from '../components/static-file.js'
import { Locale } from '../components/locale.js'

let text = readFileSync('README.md').toString()

let html = Raw(await markdownToHtml(text))
let markdown = <pre style="white-space: break-spaces">{text}</pre>
markdown = (
  <pre>
    <code class="language-markdown">{text}</code>
  </pre>
)

// The JSX expression don't need to be re-built on every render
let About = (
  <div id="about">
    <h1>
      <Locale en="About Page" zh_hk="關於頁面" zh_cn="关于页面" />
    </h1>
    <p>
      <Locale
        en={
          <>
            This page is generated from README.md in the <code>markdown</code>{' '}
            format.
          </>
        }
        zh_hk={
          <>
            此頁面是從 README.md 轉換成 <code>markdown</code> 格式生成的。
          </>
        }
        zh_cn={
          <>
            此页面是从 README.md 转换成 <code>markdown</code> 格式生成的。
          </>
        }
      />
    </p>
    <p>
      <Locale
        en={
          <>
            The conversion is done on the server powered by{' '}
            <a href="https://www.npmjs.com/package/marked">marked</a>, a node.js
            library. No need to ship JavaScript library to the client ;)
          </>
        }
        zh_hk={
          <>
            轉換是在伺服器端完成的，使用{' '}
            <a href="https://www.npmjs.com/package/marked">marked</a>，這是一個
            node.js 庫，無需將 JavaScript 庫發送到客戶端 ;)
          </>
        }
        zh_cn={
          <>
            转换是在服务器端完成的，使用{' '}
            <a href="https://www.npmjs.com/package/marked">marked</a>，这是一个
            node.js 库，无需将 JavaScript 库发送到客户端 ;)
          </>
        }
      />
    </p>
    <p>
      <Locale
        en={
          <>
            Also, the HTML is generated only once and cached in memory. This
            technique is known as{' '}
            <abbr title="Static Site Generation">SSG</abbr>, which is more
            efficient than <abbr title="Server-Side Rendering">SSR</abbr> for
            static content (that doesn't change based on the request session).
          </>
        }
        zh_hk={
          <>
            此外，HTML 只需生成一次並緩存在記憶體中。這種技術稱為{' '}
            <abbr title="靜態網站生成">SSG</abbr>，比{' '}
            <abbr title="伺服器端渲染">SSR</abbr> 更適合靜態內容（即內容不會根據
            請求的 Session 改變）。
          </>
        }
        zh_cn={
          <>
            此外，HTML 只需生成一次并缓存在内存中。这种技术称为{' '}
            <abbr title="静态网站生成">SSG</abbr>，比{' '}
            <abbr title="服务器端渲染">SSR</abbr> 更适合静态内容（即内容不会根据
            请求的 Session 改变）。
          </>
        }
      />
    </p>
    <SourceCode page="about.tsx" />
    <p>
      <Locale
        en="This page also demonstrates nested routes."
        zh_hk="此頁面還展示了嵌套路由 (nested routes)。"
        zh_cn="此页面还展示了嵌套路由 (nested routes)。"
      />
    </p>
    <fieldset>
      <legend>
        <Menu
          routes={[
            { url: '/about', menuText: 'Rendered HTML' },
            { url: '/about/markdown', menuText: 'Source Markdown' },
          ]}
          separator=" / "
        />
      </legend>
      {Switch({
        '/about': html,
        '/about/markdown': markdown,
      })}
    </fieldset>
  </div>
)

const License = prerender(
  <p style="white-space:pre-wrap">
    {existsSync('LICENSE')
      ? readFileSync('LICENSE').toString()
      : 'LICENSE file is missing. You can put it in the project root directory, alone-side with the package.json'}
  </p>,
)

// StaticFile is a helper function, it is functionally identical to above code for the license file
const Help = StaticFile('help.txt')

let routes = {
  '/about/:mode?': {
    menuText: <Locale en="About" zh_hk="關於" zh_cn="关于" />,
    menuUrl: '/about',
    menuMatchPrefix: true,
    streaming: true,
    title: (
      <Locale
        en="About ts-liveview"
        zh_hk="關於 ts-liveview"
        zh_cn="关于 ts-liveview"
      />
    ),
    description: (
      <Locale
        en="About ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement"
        zh_hk="關於 ts-liveview - 一個具有漸進增強功能的伺服器端渲染即時網頁應用框架"
        zh_cn="关于 ts-liveview - 一个具有渐进增强功能的伺服器端渲染即时网页应用框架"
      />
    ),
    node: About,
  },
  '/LICENSE': {
    title: (
      <Locale
        en="BSD 2-Clause License of ts-liveview"
        zh_hk="ts-liveview 的 BSD 2-Clause 授權條款"
        zh_cn="ts-liveview 的 BSD 2-Clause 授权条款"
      />
    ),
    description: (
      <Locale
        en="ts-liveview is a free open source project licensed under the BSD 2-Clause License"
        zh_hk="ts-liveview 是一個基於 BSD 2-Clause 授權條款的免費開源項目"
        zh_cn="ts-liveview 是一个基于 BSD 2-Clause 授权条款的免费开源项目"
      />
    ),
    node: License,
  },
  '/help.txt': {
    title: (
      <Locale
        en="Getting started on ts-liveview"
        zh_hk="ts-liveview 新手入門指南"
        zh_cn="ts-liveview 新手入门指南"
      />
    ),
    description: (
      <Locale
        en="Getting started guide of ts-liveview with bash scripts and npm scripts"
        zh_hk="ts-liveview 的新手入門指南，包含 bash 腳本和 npm 腳本"
        zh_cn="ts-liveview 的新手入门指南，包含 bash 脚本和 npm 脚本"
      />
    ),
    node: Help,
  },
} satisfies Routes

export default { routes }
