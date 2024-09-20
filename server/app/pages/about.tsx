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
import { Locale, isPreferZh } from '../components/locale.js'

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
      <Locale en="About Page" zh="關於頁面" />
    </h1>
    <p>
      <Locale
        en={
          <>
            This page is generated from README.md in the <code>markdown</code>{' '}
            format.
          </>
        }
        zh={
          <>
            此頁面是從 README.md 轉換成 <code>markdown</code> 格式生成的。
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
        zh={
          <>
            轉換是在伺服器端完成的，使用{' '}
            <a href="https://www.npmjs.com/package/marked">marked</a>，這是一個
            node.js 庫，無需將 JavaScript 庫發送到客戶端 ;)
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
        zh={
          <>
            此外，HTML 只需生成一次並緩存在記憶體中。這種技術稱為{' '}
            <abbr title="靜態網站生成">SSG</abbr>，比{' '}
            <abbr title="伺服器端渲染">SSR</abbr> 更適合靜態內容（即內容不會根據
            請求的 Session 改變）。
          </>
        }
      />
    </p>
    <SourceCode page="about.tsx" />
    <p>
      <Locale
        en="This page also demonstrates nested routes."
        zh="此頁面還展示了嵌套路由 (nested routes)。"
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
    menuText: <Locale en="About" zh="關於" />,
    menuUrl: '/about',
    menuMatchPrefix: true,
    streaming: true,
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: zh ? '關於 ts-liveview' : 'About ts-liveview',
        description: zh
          ? '關於 ts-liveview - 一個具有漸進增強功能的伺服器端渲染即時網頁應用框架'
          : 'About ts-liveview - a server-side rendering realtime webapp framework with progressive enhancement',
        node: About,
      }
    },
  },
  '/LICENSE': {
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: zh
          ? 'ts-liveview 的 BSD 2-Clause 授權條款'
          : 'BSD 2-Clause License of ts-liveview',
        description: zh
          ? 'ts-liveview 是一個基於 BSD 2-Clause 授權條款的免費開源項目'
          : 'ts-liveview is a free open source project licensed under the BSD 2-Clause License',
        node: License,
      }
    },
  },
  '/help.txt': {
    resolve(context) {
      let zh = isPreferZh(context)
      return {
        title: zh
          ? 'ts-liveview 新手入門指南'
          : 'Getting started on ts-liveview',
        description: zh
          ? 'ts-liveview 的新手入門指南，包含 bash 腳本和 npm 腳本'
          : 'Getting started guide of ts-liveview with bash scripts and npm scripts',
        node: Help,
      }
    },
  },
} satisfies Routes

export default { routes }
