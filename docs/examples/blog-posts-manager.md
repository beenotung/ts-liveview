# Blog Posts Manager Example

Complete CRUD example with database, real-time updates, and session.

[Back to Developer Guide](../developer-guide.md)

---

## What This Example Demonstrates

- Database CRUD operations (Create, Read, Update, Delete)
- Real-time updates via WebSocket
- Proper use of `pick()` for efficient queries
- Security checks (user ownership)
- Form handling
- Conditional rendering
- Array rendering with `mapArray()`
- Top-level style and script definitions
- Session management
- Input validation
- DOM-based feedback instead of alert/confirm
  (avoids blocking the WebSocket)

---

## Full Example

```typescript
import { o } from '../jsx/jsx.js'
import Style from '../components/style.js'
import Script from '../components/script.js'
import { proxy } from '../../db/proxy.js'
import { mapArray } from '../components/fragment.js'
import { pick, find } from 'better-sqlite3-proxy'
import { Context } from '../context.js'

let style = Style(/* css */ `
.post-list {
  max-width: 800px;
  margin: 0 auto;
}
.post-item {
  border: 1px solid #ddd;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
.post-form {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}
.post-form input,
.post-form textarea {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
`)

let script = Script(/* js */ `
function createPost() {
  let title = document.getElementById('post-title').value
  let content = document.getElementById('post-content').value

  if (!title || !content) {
    formError.textContent = 'Please fill in all fields'
    return
  }
  formError.textContent = ''
  emit('/posts/create', { title, content })
}

let pendingDeleteId = null
function deletePost(postId) {
  pendingDeleteId = postId
  deleteConfirmMessage.textContent = 'Delete post ' + postId + '?'
  deleteConfirmDiv.style.display = 'block'
}
function confirmDelete() {
  if (pendingDeleteId) {
    emit('/posts/delete', pendingDeleteId)
    pendingDeleteId = null
    deleteConfirmDiv.style.display = 'none'
  }
}
function cancelDelete() {
  pendingDeleteId = null
  deleteConfirmDiv.style.display = 'none'
}

function editPost(postId, title, content) {
  document.getElementById('post-title').value = title
  document.getElementById('post-content').value = content
  document.getElementById('editing-id').value = postId
  document.getElementById('submit-btn').textContent = 'Update Post'
}

function cancelEdit() {
  document.getElementById('post-title').value = ''
  document.getElementById('post-content').value = ''
  document.getElementById('editing-id').value = ''
  document.getElementById('submit-btn').textContent = 'Create Post'
}
`)

export function BlogPostsPage(attrs: {}, context: Context) {
  let userId = context.session.get('userId')

  if (!userId) {
    return { redirect: '/login' }
  }

  // Query posts from database - only fields we need
  let posts = pick(proxy.post, ['id', 'title', 'content', 'created_at'])
    .filter(post => post.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  return <>
    {style}
    {script}
    <div class="post-list">
      <h1>My Blog Posts</h1>

      <div class="post-form">
        <h2>Create New Post</h2>
        <span id="formError"></span>
        <input type="hidden" id="editing-id" value="" />
        <input
          type="text"
          id="post-title"
          placeholder="Post title"
        />
        <textarea
          id="post-content"
          rows="6"
          placeholder="Post content"
        />
        <button id="submit-btn" onclick="createPost()">Create Post</button>
        <button onclick="cancelEdit()">Cancel</button>
      </div>

      <div id="deleteConfirmDiv" style="display:none">
        <span id="deleteConfirmMessage"></span>
        <button onclick="confirmDelete()">Confirm</button>
        <button onclick="cancelDelete()">Cancel</button>
      </div>

      <h2>Your Posts ({posts.length})</h2>

      {posts.length === 0 ? (
        <p>No posts yet. Create your first post above!</p>
      ) : (
        <div>
          {mapArray(posts, post => (
            <div key={post.id} class="post-item">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>
                Posted: {new Date(post.created_at).toLocaleDateString()}
              </small>
              <div class="post-actions">
                <button onclick={`editPost(${post.id}, ${JSON.stringify(post.title)}, ${JSON.stringify(post.content)})`}>
                  Edit
                </button>
                <button onclick={`deletePost(${post.id})`}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </>
}

// Server handler: Create post
export function handleCreatePost(data: { title: string; content: string }, context: Context) {
  let userId = context.session.get('userId')

  // Validate
  if (!data.title || !data.content) {
    return { error: 'Missing required fields' }
  }

  // Insert into database
  proxy.post.push({
    title: data.title,
    content: data.content,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  // Return updated page (framework passes context when rendering)
  return <BlogPostsPage />
}

// Server handler: Delete post
export function handleDeletePost(data: { postId: number }, context: Context) {
  let userId = context.session.get('userId')

  // Find the post
  let post = find(proxy.post, { id: data.postId })

  // Security check: only delete own posts
  if (post && post.user_id === userId) {
    let index = proxy.post.indexOf(post)
    proxy.post.splice(index, 1)
  }

  // Return updated page (framework passes context when rendering)
  return <BlogPostsPage />
}

// Server handler: Update post
export function handleUpdatePost(
  data: { postId: number; title: string; content: string },
  context: Context
) {
  let userId = context.session.get('userId')

  // Find the post
  let post = find(proxy.post, { id: data.postId })

  // Security check and update
  if (post && post.user_id === userId) {
    post.title = data.title
    post.content = data.content
    post.updated_at = new Date().toISOString()
  }

  // Return updated page (framework passes context when rendering)
  return <BlogPostsPage />
}
```

---

## Wiring Routes

Add to your page's routes and spread into `routeDict` in `server/app/routes.tsx`:

```typescript
let routes = {
  '/posts': { title: 'Posts', node: <BlogPostsPage /> },
  '/posts/create': {
    resolve: (ctx) => {
      let data = ctx.args?.[0]
      return handleCreatePost(data, ctx)
    }
  },
  '/posts/delete': {
    resolve: (ctx) => {
      let postId = ctx.args?.[0]
      return handleDeletePost({ postId }, ctx)
    }
  },
  // ... similar for /posts/update
}
export default { routes }
```
