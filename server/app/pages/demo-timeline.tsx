import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { Context } from '../context.js'
import { Locale, Title } from '../components/locale.js'
import { Style } from '../components/style.js'
import { mapArray } from '../components/fragment.js'
import { groupByDate } from '../format/timeline.js'
import { avatar_url } from '../components/placeholder.js'

let pageTitle = (
  <Locale en="Timeline Demo" zh_hk="時間軸示例" zh_cn="时间轴示例" />
)

type DemoMessage = {
  author: string
  text: string
  at: string
}

// Made-up chat from the layout sketch in format/timeline.ts, extended across days
let messages: DemoMessage[] = [
  {
    author: 'Jordan',
    text: 'Can we ship the timeline demo this week?',
    at: '2026-06-30T22:10:00',
  },
  {
    author: 'Jordan',
    text: 'Need the sticky date header in place first.',
    at: '2026-06-30T22:10:45',
  },
  {
    author: 'Riley',
    text: 'I added the sticky date header styles.',
    at: '2026-06-30T22:18:00',
  },
  {
    author: 'Jordan',
    text: 'Nice — groupByDate should handle multiple days.',
    at: '2026-06-30T22:20:00',
  },
  {
    author: 'Sam',
    text: 'I can review the PR tonight.',
    at: '2026-06-30T22:20:00',
  },
  {
    author: 'Alex',
    text: 'Hey, did you see the new API updates?',
    at: '2026-07-01T00:51:00',
  },
  {
    author: 'Alex',
    text: 'They just dropped the changelog.',
    at: '2026-07-01T00:51:00',
  },
  {
    author: 'Taylor',
    text: 'Yeah, looking at it now.',
    at: '2026-07-01T00:53:00',
  },
  {
    author: 'Taylor',
    text: 'Looks promising.',
    at: '2026-07-01T00:53:00',
  },
  {
    author: 'Sam',
    text: 'I will review the migration guide tonight.',
    at: '2026-07-01T09:30:00',
  },
  {
    author: 'Casey',
    text: 'Timeline page is live.',
    at: '2026-07-02T08:00:00',
  },
  {
    author: 'Casey',
    text: 'Please sanity-check on mobile.',
    at: '2026-07-02T08:05:00',
  },
]

let items = messages
  .map(message => {
    return {
      author: message.author,
      text: message.text,
      timestamp: new Date(message.at).getTime(),
    }
  })
  .sort((a, b) => a.timestamp - b.timestamp)

let style = Style(/* css */ `
#demo-timeline .timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
#demo-timeline .timeline-avatar {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  object-fit: cover;
}
#demo-timeline .timeline-body {
  flex: 1;
  min-width: 0;
}
#demo-timeline .timeline-meta {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
}
#demo-timeline .timeline-note {
  font-size: 0.85em;
  color: #666;
}
#demo-timeline .timeline-text {
  margin: 0;
}
#demo-timeline .timeline-text + .timeline-text {
  margin-top: 0.25rem;
}
#demo-timeline .timeline-date {
  text-align: start;
  margin: 1rem 0;
}
`)

function timelineEntryNote(
  entry: { time: string; items: { author: string }[] },
  entries: { time: string; items: { author: string }[] }[],
) {
  if (entry.items.length > 1) {
    return (
      <Locale
        en="merged: same sender, same minute"
        zh_hk="已合併：同一發送者、同一分鐘"
        zh_cn="已合并：同一发送者、同一分钟"
      />
    )
  }
  let sameMinuteEntries = entries.filter(row => row.time === entry.time)
  if (sameMinuteEntries.length > 1) {
    return (
      <Locale
        en="separate row: different sender, same minute"
        zh_hk="分開顯示：不同發送者、同一分鐘"
        zh_cn="分开显示：不同发送者、同一分钟"
      />
    )
  }
  let entryIndex = entries.indexOf(entry)
  if (entryIndex > 0) {
    let previous = entries[entryIndex - 1]
    if (
      previous.items[0].author === entry.items[0].author &&
      previous.time !== entry.time
    ) {
      return (
        <Locale
          en="separate row: same sender, different minute"
          zh_hk="分開顯示：同一發送者、不同分鐘"
          zh_cn="分开显示：同一发送者、不同分钟"
        />
      )
    }
  }
  return null
}

function timelineEntryNoteSpan(
  entry: { time: string; items: { author: string }[] },
  entries: { time: string; items: { author: string }[] }[],
) {
  let note = timelineEntryNote(entry, entries)
  if (!note) return null
  return <span class="timeline-note">[ {note} ]</span>
}

function DemoTimeline(attrs: {}, context: Context) {
  let groups = groupByDate({ items, mergeKey: item => item.author }, context)
  return (
    <div id="demo-timeline">
      <h1>{pageTitle}</h1>
      <p>
        <Locale
          en="Messages are grouped by date, time (to the minute), and sender. Several lines from the same sender in the same minute are merged into one row; different senders at the same minute stay on separate rows."
          zh_hk="訊息按日期、時間（至分鐘）和發送者分組。同一發送者在同一分鐘的多句會合併為一行；同一分鐘的不同發送者會分開顯示。"
          zh_cn="消息按日期、时间（至分钟）和发送者分组。同一发送者在同一分钟的多句会合并为一行；同一分钟的不同发送者会分开显示。"
        />
      </p>
      {style}
      {mapArray(groups, group => (
        <section class="timeline-group">
          <h2 class="timeline-date">{group.date}</h2>
          {mapArray(group.groups, entry => (
            <article class="timeline-item">
              <img class="timeline-avatar" src={avatar_url} alt="" />
              <div class="timeline-body">
                <div class="timeline-meta">
                  <span class="timeline-author">{entry.items[0].author}</span>
                  <time class="timeline-time">{entry.time}</time>
                  {timelineEntryNoteSpan(entry, group.groups)}
                </div>
                {mapArray(entry.items, item => (
                  <p class="timeline-text">{item.text}</p>
                ))}
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  )
}

let routes = {
  '/timeline': {
    menuText: <Locale en="Timeline" zh_hk="時間軸" zh_cn="时间轴" />,
    title: <Title t={pageTitle} />,
    description: 'Demonstrate timeline component',
    node: <DemoTimeline />,
  },
} satisfies Routes

export default { routes }
