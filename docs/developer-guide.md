# Project Team Onboarding

**Complete guide for new team members**

> **Note:** This document was AI-generated and has not been fully reviewed. It may
> contain errors or outdated information. Please take it with a grain of salt and
> verify against the codebase when in doubt.

---

## 🚀 Quick Start (5 Minutes)

```bash
# Create new project
npx create-ts-liveview@latest my-app

# Setup
cd my-app
./scripts/init.sh

# Start development server
npm start

# Visit http://localhost:8100
```

---

## Before You Start

The project uses **WebSocket** for real-time updates. The client keeps a connection open to the server. A few familiar patterns behave differently here:

- `alert()` and `confirm()` block the JS runtime and can disconnect the WebSocket — use DOM updates instead
- Client scripts run in global scope; elements with `id` become global variables
- JSX has a specific AST structure — use `mapArray()` or `[].map()` wrap for arrays (see Critical Patterns)

---

## 📋 What is this project?

This starter template helps you build fast, interactive web applications with:

- **Server-side rendering** with minimal client JavaScript (2.3KB gzipped)
- **Real-time updates** via WebSocket
- **JSX support** without Virtual DOM
- **Type-safe routing** with full TypeScript support
- **Progressive enhancement** - works without JS, enhanced with JS

### Why Use It?

- 102x-45x smaller than socket.io alone
- Server-first architecture reduces client complexity
- Real-time interactivity without heavy frontend frameworks
- Fast initial page load with HTML streaming
- Built on Express.js for Node.js ecosystem

---

## ⚠️ Critical Patterns (Must Read!)

### 1. Array Rendering - Use `mapArray()` or Wrap

❌ **WRONG:**
```typescript
{products.map(product => <div>{product.name}</div>)}
```

✅ **CORRECT Option 1:**
```typescript
import { mapArray } from '../components/fragment.js'

{mapArray(products, product => <div>{product.name}</div>)}
```

✅ **CORRECT Option 2:**
```typescript
{[products.map(product => <div>{product.name}</div>)]}
```

**Note:** The `key` attribute (e.g. `key={item.id}`) is optional. Use it when
child components need to track identity (e.g. `SingleFieldForm`), but it is not
required for simple list rendering.

### 2. Server Communication - Use `emit()`

Use the global `emit(url, ...args)` function (defined in client/index.ts) for
server communication. The server routes messages by URL.

### 3. Scripts - Define at Top Level

❌ **WRONG:**
```typescript
function Page() {
  return (
    <div>
      <button onclick="doSomething()">Click</button>
      <script>{`function doSomething() { ... }`}</script>
    </div>
  )
}
```

✅ **CORRECT:**
```typescript
import Script from '../components/script.js'

let script = Script(/* js */ `
function doSomething() {
  console.log('clicked')
}
`)

function Page() {
  return <>
    {script}
    <div>
      <button onclick="doSomething()">Click</button>
    </div>
  </>
}
```

### 4. Styles - Same Pattern

```typescript
import Style from '../components/style.js'

let style = Style(/* css */ `
#my-page {
  padding: 1rem;
}
`)

function Page() {
  return <>
    {style}
    <div id="my-page">Content</div>
  </>
}
```

---

## 📁 Project Structure

```
my-app/
├── server/
│   ├── app/
│   │   ├── pages/         # Your page components
│   │   ├── components/    # Reusable components
│   │   ├── routes.tsx      # Route definitions
│   │   └── app.ts
│   └── index.ts           # Server entry point
├── db/                    # Database schema & migrations
│   ├── erd.txt            # Schema (ERD format)
│   ├── proxy.ts           # Database proxy (typed, auto-generated)
│   └── ...
├── public/                # Static assets (css, js, images)
├── scripts/               # Setup & deployment scripts
└── package.json
```

---

## 🎯 Creating Your First Page

### Step 1: Create Page Component

**File:** `server/app/pages/hello.tsx`

```typescript
import { o } from '../jsx/jsx.js'
import Style from '../components/style.js'
import Script from '../components/script.js'

let style = Style(/* css */ `
#hello-page {
  padding: 2rem;
  text-align: center;
}
`)

let script = Script(/* js */ `
function sayHello() {
  greeting.textContent = 'Hello from the app!'
}
`)

export default function HelloPage() {
  return <>
    {style}
    <div id="hello-page">
      <h1>Hello!</h1>
      <span id="greeting"></span>
      <button onclick="sayHello()">Click Me</button>
    </div>
    {script}
  </>
}
```

### Step 2: Add Route

**File:** `server/app/routes.tsx`

```typescript
import HelloPage from './pages/hello.js'

let routes: Routes = {
  // ... existing routes

  '/hello': {
    title: 'Hello',
    description: 'My first page',
    resolve: () => ({
      title: 'Hello World',
      node: <HelloPage />
    })
  }
}
```

### Step 3: Test

Visit `http://localhost:8100/hello` - Done! 🎉

---

## 🔄 Real-Time Updates

### How It Works

1. Server sends initial HTML
2. WebSocket connects after page load
3. User interactions → WebSocket → Server
4. Server processes → generates updates → sends to client
5. Client applies updates to DOM

### Example: Live Task List with Database

```typescript
import { o } from '../jsx/jsx.js'
import Script from '../components/script.js'
import { Context } from '../context.js'
import { proxy } from '../../db/proxy.js'
import { mapArray } from '../components/fragment.js'
import { pick } from 'better-sqlite3-proxy'

let script = Script(/* js */ `
function addTask() {
  let input = document.getElementById('task-input')
  let text = input.value.trim()
  if (!text) return
  emit('/tasks/add', text)
  input.value = ''
}

function toggleTask(taskId) {
  emit('/tasks/toggle', taskId)
}
`)

export function TaskListPage() {
  // Query tasks from database
  let tasks = pick(proxy.task, ['id', 'text', 'completed'])

  return <>
    {script}
    <div id="task-list">
      <h1>My Tasks</h1>

      <div class="add-task">
        <input
          type="text"
          id="task-input"
          placeholder="What needs to be done?"
          onkeypress="if(event.key==='Enter') addTask()"
        />
        <button onclick="addTask()">Add Task</button>
      </div>

      <ul>
        {mapArray(tasks, task => (
          <li key={task.id} class={task.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={task.completed}
              onclick={`toggleTask(${task.id})`}
            />
            {task.text}
          </li>
        ))}
      </ul>
    </div>
  </>
}

// Server handler for adding task
export function handleAddTask(data: { text: string }, context: Context) {
  let userId = context.session.get('userId')

  // Save to database
  proxy.task.push({
    text: data.text,
    completed: false,
    user_id: userId,
    created_at: new Date().toISOString()
  })

  return <TaskListPage />
}

// Server handler for toggling task
export function handleToggleTask(data: { taskId: number }, context: Context) {
  let task = proxy.task.find(t => t.id === data.taskId)

  if (task) {
    task.completed = !task.completed
  }

  return <TaskListPage />
}
```

---

## 🗺️ Routing Patterns

### Static Route

Static routes can use either `node` directly or `resolve` when you need to return other fields (e.g. title):

```typescript
// Option 1: node directly
'/about': {
  title: 'About',
  node: <AboutPage />
}

// Option 2: resolve (when you need dynamic title, etc.)
'/about': {
  title: 'About',
  resolve: () => ({ node: <AboutPage /> })
}
```

### Dynamic Route

Use `context.routerMatch?.params` for route params (e.g. `:id` in `/user/:id`):

```typescript
'/user/:id': {
  title: 'User Profile',
  resolve: (context) => ({
    node: <UserProfile userId={context.routerMatch?.params.id} />
  })
}
```

### Protected Route

`context.session` is available in WebSocket/event handlers. For HTTP route
resolution (initial page load), use `context.req` and your session middleware
(e.g. `context.req.session?.userId`):

```typescript
'/dashboard': {
  resolve: (context) => {
    let userId = context.type === 'ws'
      ? context.session.get('userId')
      : context.req?.session?.userId
    if (!userId) return { redirect: '/login' }

    return { node: <Dashboard userId={userId} /> }
  }
}
```

### 404 Catch-All

```typescript
'*': {
  title: 'Page Not Found',
  resolve: () => ({ node: <NotFoundPage /> })
}
```

---

## 💾 Database (better-sqlite3-proxy)

The project includes **SQLite** with `better-sqlite3-proxy` for type-safe database access. This setup is ready out of the box — no ORM or other database needed. You can modify to use other databases if you prefer.

Use the proxy for type-safe CRUD and basic searching (`find`, `filter`, `pick`). For complex queries (joins, `ORDER BY`, `LIMIT`), use prepared statements on the underlying `db`.

### Setup

**File:** `db/proxy.ts` (auto-generated from erd.txt)

```typescript
import { proxySchema } from 'better-sqlite3-proxy'
import { db } from './db'

export type User = {
  id?: null | number
  name: string
  email: string
  created_at?: string
}

export let proxy = proxySchema<{
  user: User
  // ... other tables
}>({
  db,
  tableFields: {
    user: [],
    // ... other tables
  },
})
```

### Query Data

```typescript
import { proxy } from '../../db/proxy.js'
import { filter, find } from 'better-sqlite3-proxy'

// Get all users
let users = proxy.user

// Find one user
let user = find(proxy.user, { id: userId })

// Filter users
let activeUsers = filter(proxy.user, { active: true })

// Custom query with pick
import { pick } from 'better-sqlite3-proxy'

let userNames = pick(proxy.user, ['id', 'name'])
// Returns: [{ id: 1, name: 'John' }, ...]
```

### Insert/Update/Delete

```typescript
import { proxy } from '../../db/proxy.js'

// Insert
let newUserId = proxy.user.push({
  name: 'John',
  email: 'john@example.com'
})

// Update
let user = find(proxy.user, { id: userId })
if (user) {
  user.name = 'Jane'
  user.email = 'jane@example.com'
}

// Delete
let user = find(proxy.user, { id: userId })
if (user) {
  proxy.user.splice(proxy.user.indexOf(user), 1)
}
```

### Example: User List Page

```typescript
import { o } from '../jsx/jsx.js'
import { proxy } from '../../db/proxy.js'
import { mapArray } from '../components/fragment.js'
import { pick } from 'better-sqlite3-proxy'

export function UsersPage() {
  // Get all users (select only needed fields)
  let users = pick(proxy.user, ['id', 'name', 'email'])

  return (
    <div id="users-page">
      <h1>Users</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {mapArray(users, user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 🎨 Complete Page Example

Same pattern as User List above: `pick()` for fields, `mapArray()` for rendering,
`emit(url, data)` for actions. See [Blog Posts Manager](examples/blog-posts-manager.md)
for a full CRUD example.

---

## ✅ Best Practices

### DO:
- ✅ Use `mapArray()` or `[array.map(...)]` for arrays
- ✅ Define scripts/styles at top level with `Script()` and `Style()`
- ✅ Use `emit(url, data)` for server communication
  (defined in client/index.ts)
- ✅ Use elements with `id` as global variables
  (e.g. `greeting` for `id="greeting"`)
- ✅ Use fragments `<>...</>` for multiple top-level elements
- ✅ Keep state on server when possible
- ✅ Validate all input on server
- ✅ Use TypeScript types for safety
- ✅ Use `pick()` to select only needed database fields
- ✅ Use descriptive component names

### DON'T:
- ❌ Use `.map()` directly in JSX without wrapping
  (plain array doesn't match JSX AST; see Critical Patterns above)
- ❌ Put `<script>` or `<style>` inline in component JSX
  (raw `<script>` works but `Script` component preferred for minification)
- ❌ Use `alert()` — the project keeps a WebSocket open for real-time updates;
  alert() blocks the JS runtime and can disconnect it. Use DOM updates
  (e.g. span.textContent = 'Error') or a toast component instead
- ❌ Trust client input (security: always validate on server)
- ❌ Store large objects in session (memory, serialization)
- ❌ Query all fields when you only need some (use pick() for performance)
- ❌ Forget error handling (validate, catch, show user-friendly messages)

---

## 🐛 Common Issues & Fixes

### WebSocket Not Connecting

```typescript
// Check in browser console
console.log('WS state:', ws.readyState)
// 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED

// Restart server
npm start
```

### JSX Not Rendering

```typescript
// Ensure correct imports
import { o } from '../jsx/jsx.js'

// Check for unclosed tags
```

### Database Schema Changes

Reviewing migrations before applying helps catch issues.

```bash
# Update db/erd.txt, then from db/ folder:
cd db
npm run plan                    # Generate migration script
# Review the migration in migrations/ directory
npm run update                  # Apply migration + regenerate proxy

# If migration needs changes after running:
npx knex migrate:down           # Rollback last migration
# Edit the migration file, then run npm run update again
```

For simple changes, you can use `npm run dev` to run plan, migrate, and update
in one step (review is still recommended but less likely to need edits). For
non-trivial schema changes, always use the manual workflow above and review
before applying.

### Hot Reload Not Working

```bash
# Restart dev server
npm start

# Clear browser cache
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

## 🎓 Learning Goals

Progress through these at your own pace:

- [ ] Understand the project structure
- [ ] Create 2-3 simple pages
- [ ] Implement routing between pages
- [ ] Build a form with validation
- [ ] Query and display database data
- [ ] Implement real-time features
- [ ] Create reusable components
- [ ] Add authentication
- [ ] Deploy to production

---

## 📚 Essential Imports

See [Import Patterns](#import-patterns) in Quick Reference below.

---

## 🔗 Resources

### Official
- **GitHub**: [github.com/beenotung/ts-liveview](https://github.com/beenotung/ts-liveview)
- **Website**: [liveviews.cc](https://liveviews.cc/)
- **npm**: [npmjs.com/package/ts-liveview](https://www.npmjs.com/package/ts-liveview)

### Examples
- Thermostat Demo: [liveviews.cc/thermostat](https://liveviews.cc/thermostat)
- Form Demo: [liveviews.cc/form](https://liveviews.cc/form)
- Chat Room: [liveviews.cc/chatroom](https://liveviews.cc/chatroom)
- User Agents: [liveviews.cc/user-agents](https://liveviews.cc/user-agents)

### Related
- **TypeScript**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs/)
- **Express.js**: [expressjs.com](https://expressjs.com/)
- **better-sqlite3**: [github.com/WiseLibs/better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **better-sqlite3-proxy**: [github.com/beenotung/better-sqlite3-proxy](https://github.com/beenotung/better-sqlite3-proxy)

---

## 🚀 Next Steps

1. **Clone/Create Project**
   ```bash
   npx create-ts-liveview@latest my-first-app
   cd my-first-app
   ./scripts/init.sh
   npm start
   ```

2. **Explore Code**
   - `server/app/pages/home.tsx`
   - `server/app/routes.tsx`
   - `db/proxy.ts` (generated from erd.txt)

3. **Build Something**
   - User list from database
   - Task tracker with real-time updates
   - Contact form saving to database

4. **Review Examples**
   - Study demo pages in the repo
   - Check official examples at liveviews.cc

---

## 💡 Key Takeaways

- **Server-first**: Logic lives on the server
- **Minimal client**: 2.3KB client runtime
- **Real-time**: WebSocket for live updates
- **Type-safe**: Full TypeScript support + proxy types
- **Fast**: HTML streaming, efficient updates
- **Progressive**: Works without JS, better with JS

---

**Document Version**: 3.0
**Last Updated**: February 2026
**Based on**: ts-liveview template + better-sqlite3-proxy patterns

---

## 📖 Quick Reference

### Commands Cheat Sheet

```bash
# Setup
npx create-ts-liveview@latest my-app
./scripts/init.sh

# Development
npm start              # Start dev server
npm run build          # Build for production
npm run format         # Format code
npm run fix            # Add .js extensions

# Database (from db/ folder)
cd db && npm run plan  # Generate migration from erd.txt
# Review migrations/, then:
npm run update         # Apply migration + gen-proxy

# Deploy
./scripts/deploy.sh    # Deploy to server
```

### Import Patterns

```typescript
// Core (paths from server/app/pages/)
import { o } from '../jsx/jsx.js'
import Style from '../components/style.js'
import Script from '../components/script.js'
import { mapArray } from '../components/fragment.js'

// Context
import { Context } from '../context.js'

// Database
import { proxy } from '../../db/proxy.js'
import { find, filter, pick } from 'better-sqlite3-proxy'

// Routing (Routes type from ../routes.js when in pages/)
import { Routes } from '../routes.js'
```

### Common Patterns Quick Copy

#### Basic Page
(See [Creating Your First Page](#-creating-your-first-page) for full example.)

```typescript
import { o } from '../jsx/jsx.js'

export default function MyPage() {
  return (
    <div id="my-page">
      <h1>My Page</h1>
    </div>
  )
}
```

#### Page with Style & Script
(See [Creating Your First Page](#-creating-your-first-page).)

```typescript
import { o } from '../jsx/jsx.js'
import Style from '../components/style.js'
import Script from '../components/script.js'

let style = Style(/* css */ `
#my-page { padding: 1rem; }
`)

let script = Script(/* js */ `
function handleClick() {
  output.textContent = 'Clicked!'
}
`)

export default function MyPage() {
  return <>
    {style}
    <div id="my-page">
      <span id="output"></span>
      <button onclick="handleClick()">Click</button>
    </div>
    {script}
  </>
}
```

#### List from Database
```typescript
import { o } from '../jsx/jsx.js'
import { proxy } from '../../db/proxy.js'
import { mapArray } from '../components/fragment.js'
import { pick } from 'better-sqlite3-proxy'

export default function ListPage() {
  let items = pick(proxy.items, ['id', 'name'])
  
  return (
    <div>
      <ul>
        {mapArray(items, item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### Form Handler
```typescript
// In routes.tsx or api handler
app.post('/api/contact', (req, res) => {
  let { name, email, message } = req.body
  
  // Validate
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' })
  }
  
  // Save to database
  proxy.contact.push({ name, email, message })
  
  res.json({ success: true })
})
```

### Database Quick Reference

```typescript
// Get all
let users = proxy.user

// Find one
let user = find(proxy.user, { id: 123 })

// Filter
let active = filter(proxy.user, { active: true })

// Select specific fields
let names = pick(proxy.user, ['id', 'name'])

// Insert
let newId = proxy.user.push({ name: 'John', email: 'j@ex.com' })

// Update
let user = find(proxy.user, { id: 123 })
if (user) {
  user.name = 'Jane'
}

// Delete
let user = find(proxy.user, { id: 123 })
if (user) {
  proxy.user.splice(proxy.user.indexOf(user), 1)
}
```

### Routes Quick Reference

```typescript
let routes: Routes = {
  // Static
  '/': {
    title: 'Home',
    resolve: () => ({ node: <HomePage /> })
  },
  
  // Dynamic (use routerMatch.params for route params)
  '/post/:id': {
    resolve: (ctx) => ({ node: <Post id={ctx.routerMatch?.params.id} /> })
  },
  
  // Protected (session from ctx.session for ws, ctx.req?.session for express)
  '/admin': {
    resolve: (ctx) => {
      let admin = ctx.type === 'ws'
        ? ctx.session.get('admin')
        : ctx.req?.session?.admin
      if (!admin) return { redirect: '/login' }
      return { node: <AdminPage /> }
    }
  },
  
  // 404
  '*': {
    resolve: () => ({ node: <NotFound /> })
  }
}
```

### WebSocket Communication

```typescript
// Client to Server
let script = Script(/* js */ `
function sendData(data) {
  emit('/my-event', data)
}
`)

// Server Handler (in your event handler file)
export function handleMyEvent(data, context) {
  // Process data
  context.session.set('someValue', data.value)
  
  // Return updated component
  return <UpdatedComponent />
}
```

### DO / DON'T Summary

| ✅ DO | ❌ DON'T |
|-------|----------|
| `{mapArray(arr, ...)}` | `{arr.map(...)}` |
| `{[arr.map(...)]}` | Direct `.map()` |
| `let script = Script(...)` | Inline `<script>` |
| `let style = Style(...)` | Inline `<style>` |
| Top-level definitions | Inline definitions |
| `proxy.user.push({...})` | `db.insert(...)` |
| `find(proxy.user, {...})` | `await db.query...` |
| Server validation | Client-only validation |
| `pick()` for fields | Query all fields |

---

## 🎯 Common Tasks

### Add a New Page

1. Create `server/app/pages/my-page.tsx`
2. Add route in `server/app/routes.tsx`
3. Add navigation link if needed

### Add Database Table

1. Edit `db/erd.txt` (see [db/README.md](../db/README.md) for schema format)
2. Run `cd db && npm run plan`, review the migration in `migrations/`,
   then `npm run update`
   - If migration needs changes after running: `npx knex migrate:down`,
     edit migration, then `npm run update`
3. Import and use `proxy.tableName`

### Add Real-Time Feature

1. Use `emit(url, data)` in client script (defined in client/index.ts)
2. Add route handler for the URL in routes
3. Return updated component from handler

### Wire emit() to Route Handlers

When the client calls `emit('/posts/create', data)`, the server routes by URL.
Add a route whose `resolve` invokes your handler:

```typescript
// In your page file, export routes and add to routeDict in routes.tsx:
let routes = {
  '/posts': { title: 'Posts', node: <BlogPostsPage /> },
  '/posts/create': {
    resolve: (ctx) => {
      let data = ctx.args?.[0]
      return handleCreatePost(data, ctx)
    }
  },
}
export default { routes }
```

Then in `server/app/routes.tsx`: `...BlogPosts.routes,`

### Deploy

1. Update `scripts/config`
2. Run `./scripts/deploy.sh`
3. Server deploys with pm2

---

## 🆘 Getting Help

1. **Check Examples**: Review demo pages at [liveviews.cc](https://liveviews.cc/)
2. **Read Source**: Look at existing pages in `server/app/pages/`
3. **GitHub Issues**: [github.com/beenotung/ts-liveview/issues](https://github.com/beenotung/ts-liveview/issues)
4. **Official Docs**: [github.com/beenotung/ts-liveview](https://github.com/beenotung/ts-liveview)

---

## 💼 Complete Real-World Example: Blog Posts Manager

See [Blog Posts Manager example](examples/blog-posts-manager.md) for a complete
CRUD example with database, real-time updates, session management, and route wiring.

---

**That's everything you need to get started! Welcome to the team! 🚀**

