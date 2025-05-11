import { count } from 'better-sqlite3-proxy'
import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  getContextSearchParams,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { object, string, values } from 'cast.ts'
import { Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { getAuthUser, getAuthUserRole } from '../auth/user.js'
import { Locale, Title } from '../components/locale.js'
import { Page } from '../components/page.js'
import { toRouteUrl } from '../../url.js'
import { ContentReport, proxy } from '../../../db/proxy.js'
import { BackToLink } from '../components/back-to-link.js'
import { Script } from '../components/script.js'
import { db } from '../../../db/db.js'
import { IonButton } from '../components/ion-button.js'
import DateTimeText from '../components/datetime.js'
import { getDisplayName } from './profile.js'
import { HttpError, MessageException } from '../../exception.js'
import httpStatus from 'http-status'
import { ionicStyle } from '../styles/ionic-style.js'

let pageTitle = <Locale en="Report Content" zh_hk="檢舉內容" zh_cn="检举内容" />

type ReasonCategory = {
  code: string
  en: string
  zh_hk: string
  zh_cn: string
  types: ReasonType[]
}

type ReasonType = {
  code: string
  en: string
  zh_hk: string
  zh_cn: string
}

let reasonCategories: ReasonCategory[] = [
  {
    code: 'emergency',
    en: 'Emergency & Safety',
    zh_hk: '緊急及安全',
    zh_cn: '紧急及安全',
    types: [
      {
        code: 'child_safety',
        en: 'Problem involving someone under 18',
        zh_hk: '涉及未成年人士的問題',
        zh_cn: '涉及未成年人士的问题',
      },
      {
        code: 'self_harm',
        en: 'Suicide or self-harm',
        zh_hk: '自殺或自殘',
        zh_cn: '自杀或自残',
      },
      {
        code: 'violence',
        en: 'Violence or gore',
        zh_hk: '暴力或血腥內容',
        zh_cn: '暴力或血腥内容',
      },
    ],
  },
  {
    code: 'harassment',
    en: 'Abuse & Harassment',
    zh_hk: '濫用及騷擾',
    zh_cn: '滥用及骚扰',
    types: [
      {
        code: 'harassment',
        en: 'Bullying, harassment or abuse',
        zh_hk: '欺凌、騷擾或虐待',
        zh_cn: '欺凌、骚扰或虐待',
      },
      {
        code: 'hate',
        en: 'Hate speech or discrimination',
        zh_hk: '仇恨言論或歧視',
        zh_cn: '仇恨言论或歧视',
      },
      {
        code: 'disturbing',
        en: 'Disturbing or distressing content',
        zh_hk: '令人不安或困擾的內容',
        zh_cn: '令人不安或困扰的内容',
      },
    ],
  },
  {
    code: 'scams',
    en: 'Scams & Deception',
    zh_hk: '詐騙及欺詐',
    zh_cn: '诈骗及欺诈',
    types: [
      {
        code: 'scam',
        en: 'Scam or fraud',
        zh_hk: '詐騙或欺詐',
        zh_cn: '诈骗或欺诈',
      },
      {
        code: 'impersonation',
        en: 'Impersonation or fake accounts',
        zh_hk: '冒充或假冒帳號',
        zh_cn: '冒充或假冒账号',
      },
      {
        code: 'misinformation',
        en: 'False or misleading information',
        zh_hk: '虛假或誤導性資訊',
        zh_cn: '虚假或误导性信息',
      },
    ],
  },
  {
    code: 'prohibited',
    en: 'Prohibited Content & Activities',
    zh_hk: '違規內容及行為',
    zh_cn: '违规内容及行为',
    types: [
      {
        code: 'illegal',
        en: 'Illegal content or activities',
        zh_hk: '非法內容或活動',
        zh_cn: '非法内容或活动',
      },
      {
        code: 'restricted_items',
        en: 'Selling or promoting restricted items or services',
        zh_hk: '銷售或推廣受限制物品或服務',
        zh_cn: '销售或推广受限制物品或服务',
      },
      {
        code: 'adult',
        en: 'Adult content',
        zh_hk: '成人內容',
        zh_cn: '成人内容',
      },
      {
        code: 'ip',
        en: 'Intellectual property violation',
        zh_hk: '侵犯知識產權',
        zh_cn: '侵犯知识产权',
      },
    ],
  },
  {
    code: 'quality',
    en: 'Content Quality & Relevance',
    zh_hk: '內容質素及相關性',
    zh_cn: '内容质量及相关性',
    types: [
      {
        code: 'spam',
        en: 'Spam or irrelevant content',
        zh_hk: '垃圾訊息或不相關內容',
        zh_cn: '垃圾信息或不相关内容',
      },
      {
        code: 'unwanted',
        en: "I don't want to see this",
        zh_hk: '我不想看到這個內容',
        zh_cn: '我不想看到这个内容',
      },
    ],
  },
]

let script = Script(/* js */ `
ReportContentForm.addEventListener('ionChange', event => {
  if (event.target.name != 'type') return
  let form = event.target.closest('form')
  let submitButton = form.querySelector('ion-button[type="submit"]')
  submitButton.disabled = !event.detail.value
})
`)

// TODO obtain foreign key from url
// TODO implement web version
function ReportPage(attrs: {}, context: Context) {
  let role = getAuthUserRole(context)
  let params = getContextSearchParams(context)
  let return_url = params?.get('return_url') // required
  let return_title = params?.get('return_title') // optional
  return (
    <Page
      id="ReportContent"
      title={pageTitle}
      toolbarExtra={
        role == 'admin' ? (
          <ion-buttons slot="end">
            <IonButton url={toRouteUrl(routes, '/report-content/review')}>
              <Locale en="Review" zh_hk="審查" zh_cn="审查" />
            </IonButton>
          </ion-buttons>
        ) : null
      }
    >
      {ionicStyle}
      <p>
        <ion-icon name="warning" color="warning" size="large" />{' '}
        <Locale
          en="If someone is in immediate danger, call your local emergency services immediately."
          zh_hk="如發現有人處於危險狀態，請即撥打當地緊急救援電話。"
          zh_cn="如发现有人处于危险状态，请即拨打当地紧急救援电话。"
        />
      </p>

      <form
        id="ReportContentForm"
        action={toRouteUrl(routes, '/report-content/submit')}
        method="post"
        onsubmit="emitForm(event)"
      >
        <input type="hidden" name="return_url" value={return_url} />
        <input type="hidden" name="return_title" value={return_title} />
        <ion-list>
          <ion-list-header>
            <Locale en="Problem Categories" zh_hk="問題分類" zh_cn="问题分类" />
          </ion-list-header>
          <ion-radio-group name="type">
            {mapArray(reasonCategories, category => (
              <ion-item-group>
                <ion-item-divider>
                  <Locale
                    en={category.en}
                    zh_hk={category.zh_hk}
                    zh_cn={category.zh_cn}
                  />
                </ion-item-divider>
                {mapArray(category.types, type => (
                  <ion-item>
                    <ion-radio value={type.code}>
                      <Locale
                        en={type.en}
                        zh_hk={type.zh_hk}
                        zh_cn={type.zh_cn}
                      />
                    </ion-radio>
                  </ion-item>
                ))}
              </ion-item-group>
            ))}
          </ion-radio-group>
          <ion-list-header>
            <Locale en="Additional Details" zh_hk="補充資料" zh_cn="补充资料" />
          </ion-list-header>
          <ion-item>
            <ion-textarea
              name="remark"
              placeholder={Locale(
                {
                  en: 'Any details that can help us review this report',
                  zh_hk: '任何有助我們審視此檢舉的資料',
                  zh_cn: '任何有助我们审视此检举的资料',
                },
                context,
              )}
            ></ion-textarea>
          </ion-item>
        </ion-list>
        <ion-button shape="round" expand="full" type="submit" disabled>
          <Locale en="Submit Report" zh_hk="發送回報" zh_cn="发送报告" />
        </ion-button>
      </form>

      <p>
        <ion-icon name="shield-checkmark" color="primary" size="large" />{' '}
        <Locale
          en="We will review your report and take appropriate action if we find any violations. Your report will be kept confidential. We may contact you for follow-up if needed."
          zh_hk="我們會審查您的回報，如發現用戶的內容違規，我們將會作出適當處理。請放心，回報的資料會保密處理。與此同時，我們亦可能會聯絡閣下以便跟進問題。"
          zh_cn="我们会审查您的报告，如发现用户的内容违规，我们将会作出适当处理。请放心，报告的资料会保密处理。与此同时，我们也可能会联系阁下以便跟进问题。"
        />
      </p>
      {script}
    </Page>
  )
}

let submitParser = object({
  return_url: string({ nonEmpty: true }),
  return_title: string({ nonEmpty: false }),
  type: values(
    reasonCategories.flatMap(category => category.types.map(type => type.code)),
  ),
  remark: string({ nonEmpty: false }),
})

function Submit(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  let body = getContextFormBody(context)
  let input = submitParser.parse(body)
  proxy.content_report.push({
    reporter_id: user?.id || null,
    type: input.type,
    remark: input.remark,
    submit_time: Date.now(),
    reviewer_id: null,
    review_time: null,
    accept_time: null,
    reject_time: null,
  })
  return (
    <Redirect
      href={toRouteUrl(routes, '/report-content/result', {
        query: {
          return_url: input.return_url,
          return_title: input.return_title,
        },
      })}
    />
  )
}

function SubmitResult(attrs: {}, context: DynamicContext) {
  let params = getContextSearchParams(context)
  let return_url = params?.get('return_url')!
  let return_title = params?.get('return_title')!
  return (
    <Page id="SubmitResult" title={pageTitle}>
      <p>
        <ion-icon name="shield-checkmark" color="primary" size="large" />{' '}
        <Locale
          en="Thank you for your report. We will review it and take appropriate action."
          zh_hk="感謝您的檢舉。我們會審視並採取適當行動。"
          zh_cn="感谢您的检举。我们会审视并采取适当行动。"
        />
      </p>
      <BackToLink href={return_url} title={return_title} />
    </Page>
  )
}

let ReviewPageTitle = (
  <Locale en="Review Content Report" zh_hk="審視檢舉" zh_cn="审查检举" />
)

let reviewStyle = Style(/* css */ `
.report-card {
  font-size: 1rem;
}
.report-card section {
  margin-bottom: 0.5rem;
}
.report-remark {
  display: inline-block;
  white-space: pre-wrap;
}
`)

function selectPendingReports() {
  // return filter(proxy.content_report, {
  //   accept_time: null,
  //   reject_time: null,
  // })
  return proxy.content_report
}

function countPendingReports() {
  return count(proxy.content_report, {
    accept_time: null,
    reject_time: null,
  })
}

// TODO show determined reports in different segments
function ReviewPage(attrs: {}, context: DynamicContext) {
  let role = getAuthUserRole(context)
  if (role != 'admin') {
    return (
      <Page id="Review" title={ReviewPageTitle}>
        {renderError('This page is only available to admins', context)}
      </Page>
    )
  }
  let reports = selectPendingReports()
  return (
    <Page id="Review" title={ReviewPageTitle} class="ion-padding-vertical">
      {ionicStyle}
      {reviewStyle}
      <p class="ion-padding-horizontal">
        Total <span class="pending-count">{countPendingReports()}</span> reports
        pending for review
      </p>
      <ion-list>
        {mapArray(reports, report => {
          let type_code = report.type
          let category = reasonCategories.find(category =>
            category.types.some(type => type.code == type_code),
          )
          let reason_type = category?.types.find(type => type.code == type_code)
          let reporter = report.reporter
          return (
            <ion-card class="report-card" data-report-id={report.id}>
              <ion-card-content>
                <section>
                  <Locale en="Category" zh_hk="分類" zh_cn="分类" />:{' '}
                  {category && Locale(category, context)}
                </section>
                <section>
                  <Locale en="Type" zh_hk="類型" zh_cn="类型" />:{' '}
                  {reason_type && Locale(reason_type, context)}
                </section>
                <section>
                  <Locale en="Submitted at" zh_hk="提交時間" zh_cn="提交时间" />
                  : <DateTimeText time={report.submit_time} />
                </section>
                <section>
                  <Locale en="Reporter" zh_hk="檢舉者" zh_cn="检举者" />:{' '}
                  {reporter ? (
                    getDisplayName(reporter)
                  ) : (
                    <Locale en="Guest" zh_hk="訪客" zh_cn="访客" />
                  )}
                </section>
                <section>
                  <Locale en="Remark" zh_hk="備註" zh_cn="备注" />:{' '}
                  <div class="report-remark">
                    {report.remark || (
                      <Locale en="None" zh_hk="無" zh_cn="无" />
                    )}
                  </div>
                </section>
                <ion-buttons>
                  <IonButton
                    class="review-button"
                    no-history
                    color="primary"
                    url={toRouteUrl(routes, '/report-content/:id/review', {
                      params: {
                        id: report.id!,
                      },
                    })}
                    fill={report.review_time ? 'solid' : 'outline'}
                  >
                    <ion-icon name="eye" slot="start" />
                    <Locale en="Review" zh_hk="審視" zh_cn="审查" />
                  </IonButton>
                  <IonButton
                    class="accept-button"
                    no-history
                    color="danger"
                    url={toRouteUrl(routes, '/report-content/:id/accept', {
                      params: {
                        id: report.id!,
                      },
                    })}
                    fill={report.accept_time ? 'solid' : 'outline'}
                  >
                    <ion-icon name="checkmark" slot="start" />
                    <Locale en="Accept" zh_hk="接受" zh_cn="接受" />
                  </IonButton>
                  <IonButton
                    class="reject-button"
                    no-history
                    color="dark"
                    url={toRouteUrl(routes, '/report-content/:id/reject', {
                      params: {
                        id: report.id!,
                      },
                    })}
                    fill={report.reject_time ? 'solid' : 'outline'}
                  >
                    <ion-icon name="close" slot="start" />
                    <Locale en="Reject" zh_hk="拒絕" zh_cn="拒绝" />
                  </IonButton>
                </ion-buttons>
              </ion-card-content>
            </ion-card>
          )
        })}
      </ion-list>
    </Page>
  )
}

function reviewByAdmin(
  context: DynamicContext,
  update: (report: ContentReport) => void,
) {
  let user = getAuthUser(context)
  if (!user?.is_admin) {
    throw new HttpError(
      httpStatus.FORBIDDEN,
      'This page is only available to admins',
    )
  }
  let id = context.routerMatch?.params.id
  let report = proxy.content_report[id]
  if (!report) {
    throw new HttpError(httpStatus.NOT_FOUND, 'Report not found')
  }
  db.transaction(() => {
    report.reviewer_id = user.id!
    update(report)
  })()
  return updateReportList(report)
}

function Review(attrs: {}, context: DynamicContext) {
  reviewByAdmin(context, report => {
    report.review_time = Date.now()
  })
}

function Accept(attrs: {}, context: DynamicContext) {
  reviewByAdmin(context, report => {
    let now = Date.now()
    report.review_time ||= now
    report.accept_time = now
    if (report.reject_time) {
      report.reject_time = null
    }
  })
}

function Reject(attrs: {}, context: DynamicContext) {
  reviewByAdmin(context, report => {
    let now = Date.now()
    report.review_time ||= now
    report.reject_time = now
    if (report.accept_time) {
      report.accept_time = null
    }
  })
}

function updateReportList(report: ContentReport) {
  throw new MessageException([
    'batch',
    [
      ['update-text', '.pending-count', countPendingReports()],
      [
        'update-props',
        `[data-report-id="${report.id}"] .review-button`,
        {
          fill: report.review_time ? 'solid' : 'outline',
        },
      ],
      [
        'update-props',
        `[data-report-id="${report.id}"] .accept-button`,
        {
          fill: report.accept_time ? 'solid' : 'outline',
        },
      ],
      [
        'update-props',
        `[data-report-id="${report.id}"] .reject-button`,
        {
          fill: report.reject_time ? 'solid' : 'outline',
        },
      ],
    ],
  ])
}

let routes = {
  '/report-content': {
    menuText: pageTitle,
    resolve(context) {
      return {
        title: <Title t={pageTitle} />,
        description: (
          <Locale
            en="Report inappropriate, offensive, or harmful content to help keep our community safe"
            zh_hk="檢舉不當、冒犯或有害的內容，以協助維護社區安全"
            zh_cn="检举不当、冒犯或有害的内容，以协助维护社区安全"
          />
        ),
        node: <ReportPage />,
      }
    },
  },
  '/report-content/submit': {
    title: apiEndpointTitle,
    description: 'Submit content report w/wo login',
    node: <Submit />,
  },
  '/report-content/result': {
    title: apiEndpointTitle,
    description: 'Submit content report w/wo login',
    node: <SubmitResult />,
  },
  '/report-content/review': {
    menuText: ReviewPageTitle,
    title: <Title t={ReviewPageTitle} />,
    description: 'Review content report submitted by users',
    node: <ReviewPage />,
  },
  '/report-content/:id/review': {
    title: apiEndpointTitle,
    description: 'Review content report',
    node: <Review />,
  },
  '/report-content/:id/accept': {
    title: apiEndpointTitle,
    description: 'Accept content report',
    node: <Accept />,
  },
  '/report-content/:id/reject': {
    title: apiEndpointTitle,
    description: 'Reject content report',
    node: <Reject />,
  },
} satisfies Routes

export default { routes }
