import { o } from '../jsx/jsx.js'
import { prerender } from '../jsx/html.js'
import { ResolvedPageRoute, Routes } from '../routes.js'
import { title } from '../../config.js'
import { Locale, LocaleVariants } from '../components/locale.js'
import { Page } from '../components/page.js'

let pageTitle = <Locale en="Privacy Policy" zh_hk="私隱政策" zh_cn="隐私政策" />

let page = (
  <Page id="privacy" title={pageTitle} backHref="/">
    <p>
      <Locale en="Last updated: " zh_hk="最後更新：" zh_cn="最后更新：" />
      {new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}
    </p>

    <h2>
      <Locale
        en="Information We Collect"
        zh_hk="我們收集的資訊"
        zh_cn="我们收集的信息"
      />
    </h2>

    <h3>
      <Locale en="Geolocation Data" zh_hk="地理位置數據" zh_cn="地理位置数据" />
    </h3>

    <p>
      <Locale
        en={
          <>
            When you visit our website, we may determine your approximate
            geographic location (country and city level) for the following
            purposes:
          </>
        }
        zh_hk={
          <>
            當您訪問我們的網站時，我們可能會確定您的大致地理位置（國家和城市級別），用於以下目的：
          </>
        }
        zh_cn={
          <>
            当您访问我们的网站时，我们可能会确定您的大致地理位置（国家和城市级别），用于以下目的：
          </>
        }
      />
    </p>

    <ul>
      <li>
        <Locale
          en="Analytics and statistics: To understand how visitors use our website and improve our services"
          zh_hk="分析和統計：了解訪客如何使用我們的網站並改善我們的服務"
          zh_cn="分析和统计：了解访客如何使用我们的网站并改善我们的服务"
        />
      </li>
      <li>
        <Locale
          en="Geolocation analysis: To analyze visitor locations for service optimization"
          zh_hk="地理位置分析：分析訪客位置以優化服務"
          zh_cn="地理位置分析：分析访客位置以优化服务"
        />
      </li>
    </ul>

    <p>
      <Locale
        en={
          <>
            <strong>Important:</strong> We do <strong>not</strong> store your IP
            address. We only store general geographic information (country and
            city level) derived from IP addresses for statistical purposes. This
            information is aggregated and anonymized, and we do not use it to
            identify individual users.
          </>
        }
        zh_hk={
          <>
            <strong>重要：</strong>我們<strong>不會</strong>存儲您的 IP
            地址。我們僅存儲從 IP
            地址衍生的一般地理位置資訊（國家和城市級別），用於統計目的。此資訊會被匯總和匿名化，我們不會使用它來識別個人用戶。
          </>
        }
        zh_cn={
          <>
            <strong>重要：</strong>我们<strong>不会</strong>存储您的 IP
            地址。我们仅存储从 IP
            地址衍生的一般地理位置信息（国家和城市级别），用于统计目的。此信息会被汇总和匿名化，我们不会使用它来识别个人用户。
          </>
        }
      />
    </p>

    <h3>
      <Locale
        en="User Agent and Browser Information"
        zh_hk="用戶代理和瀏覽器資訊"
        zh_cn="用户代理和浏览器信息"
      />
    </h3>

    <p>
      <Locale
        en={
          <>
            We collect browser user agent strings to understand browser
            compatibility and improve our website's functionality across
            different devices and browsers.
          </>
        }
        zh_hk={
          <>
            我們收集瀏覽器用戶代理字符串，以了解瀏覽器兼容性並改善我們網站在不同設備和瀏覽器上的功能。
          </>
        }
        zh_cn={
          <>
            我们收集浏览器用户代理字符串，以了解浏览器兼容性并改善我们网站在不同设备和浏览器上的功能。
          </>
        }
      />
    </p>

    <h3>
      <Locale en="Session Information" zh_hk="會話資訊" zh_cn="会话信息" />
    </h3>

    <p>
      <Locale
        en="We collect language preferences and timezone information to provide you with a personalized experience."
        zh_hk="我們收集語言偏好和時區資訊，以為您提供個性化體驗。"
        zh_cn="我们收集语言偏好和时区信息，以为您提供个性化体验。"
      />
    </p>

    <h2>
      <Locale
        en="How We Use Your Information"
        zh_hk="我們如何使用您的資訊"
        zh_cn="我们如何使用您的信息"
      />
    </h2>

    <p>
      <Locale
        en="The information we collect is used solely for:"
        zh_hk="我們收集的資訊僅用於："
        zh_cn="我们收集的信息仅用于："
      />
    </p>

    <ul>
      <li>
        <Locale
          en="Website security and fraud prevention"
          zh_hk="網站安全和防詐騙"
          zh_cn="网站安全和防诈骗"
        />
      </li>
      <li>
        <Locale
          en="Analytics and service improvement"
          zh_hk="分析和服務改善"
          zh_cn="分析和服务改善"
        />
      </li>
      <li>
        <Locale
          en="Personalization of your experience"
          zh_hk="個性化您的體驗"
          zh_cn="个性化您的体验"
        />
      </li>
    </ul>

    <h2>
      <Locale
        en="Data Storage and Retention"
        zh_hk="數據存儲和保留"
        zh_cn="数据存储和保留"
      />
    </h2>

    <p>
      <Locale
        en={
          <>
            We store request logs including user agents, session information,
            and geolocation data (country and city level) in our database. IP
            addresses are not stored. This data is retained for analytical
            purposes and may be anonymized or deleted after a reasonable period.
          </>
        }
        zh_hk={
          <>
            我們將請求日誌（包括用戶代理、會話資訊和地理位置數據（國家和城市級別））存儲在我們的數據庫中。IP
            地址不會被存儲。這些數據會保留用於分析目的，並可能在合理期限後被匿名化或刪除。
          </>
        }
        zh_cn={
          <>
            我们将请求日志（包括用户代理、会话信息和地理位置数据（国家和城市级别））存储在我们的数据库中。IP
            地址不会被存储。这些数据会保留用于分析目的，并可能在合理期限后被匿名化或删除。
          </>
        }
      />
    </p>

    <h2>
      <Locale en="Your Rights" zh_hk="您的權利" zh_cn="您的权利" />
    </h2>

    <p>
      <Locale
        en={
          <>
            Since we do not store personally identifiable information (such as
            IP addresses) and only collect anonymized, aggregated data, we
            cannot identify or delete individual user data. However, you have
            the right to:
          </>
        }
        zh_hk={
          <>
            由於我們不存儲個人身份識別資訊（例如 IP
            地址），並且僅收集匿名、匯總的數據，我們無法識別或刪除個人用戶數據。但是，您有權：
          </>
        }
        zh_cn={
          <>
            由于我们不存储个人身份识别信息（例如 IP
            地址），并且仅收集匿名、汇总的数据，我们无法识别或删除个人用户数据。但是，您有权：
          </>
        }
      />
    </p>

    <ul>
      <li>
        <Locale
          en="Request information about what types of data we collect and how we use it"
          zh_hk="要求我們提供我們收集的數據類型以及我們如何使用它的資訊"
          zh_cn="要求我们提供我们收集的数据类型以及我们如何使用它的信息"
        />
      </li>
      <li>
        <Locale
          en="Contact us with any privacy concerns or questions"
          zh_hk="就任何隱私問題或疑問與我們聯繫"
          zh_cn="就任何隐私问题或疑问与我们联系"
        />
      </li>
      <li>
        <Locale
          en="Use browser settings or extensions to limit data collection (though this may limit website functionality)"
          zh_hk="使用瀏覽器設置或擴展來限制數據收集（儘管這可能會限制網站功能）"
          zh_cn="使用浏览器设置或扩展来限制数据收集（尽管这可能会限制网站功能）"
        />
      </li>
    </ul>

    <h2>
      <Locale en="Contact Us" zh_hk="聯繫我們" zh_cn="联系我们" />
    </h2>

    <p>
      <Locale
        en={
          <>
            If you have any questions about this Privacy Policy, please contact
            us through the contact methods listed on{' '}
            <a
              href="https://beeno-tung.surge.sh/"
              target="_blank"
              rel="noopener"
            >
              https://beeno-tung.surge.sh/
            </a>
            . You can also raise issues at{' '}
            <a
              href="https://github.com/beenotung/ts-liveview/issues"
              target="_blank"
              rel="noopener"
            >
              https://github.com/beenotung/ts-liveview/issues
            </a>
            .
          </>
        }
        zh_hk={
          <>
            如果您對此私隱政策有任何疑問，請通過{' '}
            <a
              href="https://beeno-tung.surge.sh/"
              target="_blank"
              rel="noopener"
            >
              https://beeno-tung.surge.sh/
            </a>{' '}
            上列出的聯繫方式與我們聯繫。您也可以在{' '}
            <a
              href="https://github.com/beenotung/ts-liveview/issues"
              target="_blank"
              rel="noopener"
            >
              https://github.com/beenotung/ts-liveview/issues
            </a>{' '}
            提出問題。
          </>
        }
        zh_cn={
          <>
            如果您对此隐私政策有任何疑问，请通过{' '}
            <a
              href="https://beeno-tung.surge.sh/"
              target="_blank"
              rel="noopener"
            >
              https://beeno-tung.surge.sh/
            </a>{' '}
            上列出的联系方式与我们联系。您也可以在{' '}
            <a
              href="https://github.com/beenotung/ts-liveview/issues"
              target="_blank"
              rel="noopener"
            >
              https://github.com/beenotung/ts-liveview/issues
            </a>{' '}
            提出问题。
          </>
        }
      />
    </p>
  </Page>
)

let route: LocaleVariants<ResolvedPageRoute> = {
  en: {
    title: title('Privacy Policy'),
    description:
      'Privacy Policy - Information about how we collect and use visitor data including geolocation',
    node: prerender(page, { language: 'en' }),
  },
  zh_hk: {
    title: title('私隱政策'),
    description:
      '私隱政策 - 關於我們如何收集和使用訪客數據（包括地理位置）的資訊',
    node: prerender(page, { language: 'zh_hk' }),
  },
  zh_cn: {
    title: title('隐私政策'),
    description:
      '隐私政策 - 关于我们如何收集和使用访客数据（包括地理位置）的信息',
    node: prerender(page, { language: 'zh_cn' }),
  },
}

let routes = {
  '/privacy': {
    menuText: pageTitle,
    resolve(context) {
      return Locale(route, context)
    },
  },
} satisfies Routes

export default { routes }
