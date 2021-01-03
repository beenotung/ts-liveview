import { c, h } from 'ts-liveview'
import { defaultTitle } from '../config'
import { router } from '../router'
import { comments } from '../store'
import { feedList } from '../views/feed-list'
import { userList } from '../views/user-list'

enum Tab {
  feeds = 'feeds',
  users = 'users',
}

router.add('/', (context, cb) => {
  const defaultTab: Tab = comments().length > 0 ? Tab.feeds : Tab.users
  let activeTab: Tab =
    'hash' in context ? (context.hash?.replace('#', '') as Tab) : defaultTab
  if (!Tab[activeTab]) {
    activeTab = defaultTab
  }
  cb(
    c(
      'main',
      h`<main>
<a href="/">${defaultTitle}</a>
<h1>Home Page</h1>
<style>
.tabs {
  display: flex;
}
.tab {
  flex-grow: 1;
  border: 1px solid transparent;
  border-bottom: 1px solid black;
  width: 10em;
  text-align: center;
  padding-top: 0.5em;
  padding-bottom: 0.25em;
}
.tab.active {
  border: 1px solid black;
}
</style>
<div class="tabs">
    <a class="tab ${
      activeTab === Tab.feeds ? 'active' : ''
    }" href="#feeds">Feeds</a>
    <a class="tab ${
      activeTab === Tab.users ? 'active' : ''
    }" href="#users">Users</a>
</div>
${(() => {
  switch (activeTab) {
    case Tab.feeds:
      return feedList()
    case Tab.users:
      return userList()
  }
})()}
</main>`,
    ),
  )
})
