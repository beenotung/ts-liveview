import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import Style from '../components/style.js'
import { title } from '../../config.js'
import { proxy } from '../../../db/proxy.js'
import {
  DynamicContext,
  getContextFormBody,
  getId,
  getStringCasual,
} from '../context.js'
import { EarlyTerminate } from '../../exception.js'
import { Redirect } from '../components/router.js'
import SourceCode from '../components/source-code.js'
import { mapArray } from '../components/fragment.js'
import { apiRoute } from '../api-route.js'

let style = Style(/* css */ `
#task-demo form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
#task-demo input[type="text"] {
  flex: 1;
  max-width: 24rem;
}
#task-demo ul {
  list-style: none;
  padding: 0;
}
#task-demo li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-bottom: 1px solid #ddd;
}
#task-demo li .task-title {
  max-width: 24rem;
}
#task-demo li .delete-button {
  flex-shrink: 0;
}
#task-demo li.completed .task-title {
  opacity: 0.6;
  text-decoration: line-through;
}
#task-demo li input[type="text"] {
  width: 100%;
}
`)

function TaskList(attrs: {}, context: DynamicContext) {
  let tasks = proxy.task
  return (
    <>
      {style}
      <div id="task-demo">
        <h1>Task Demo</h1>
        <p>
          A simple example demonstrating database usage with CRUD operations.
        </p>

        <form method="POST" action="/task/add" onsubmit="emitForm(event)">
          <input
            type="text"
            name="title"
            placeholder="Enter task title..."
            required
          />
          <button type="submit">Add</button>
        </form>

        <ul>
          {mapArray(tasks, task => (
            <li class={task.completed ? 'completed' : ''}>
              <button onclick={`emit('/task/toggle', {id: ${task.id}})`}>
                {task.completed ? 'Undo' : 'Done'}
              </button>
              <input
                type="text"
                class="task-title"
                value={task.title}
                onblur={`emit('/task/update', {id: ${task.id}, title: this.value})`}
                onkeydown={`if(event.key==='Enter') this.blur()`}
              />
              <button
                class="delete-button"
                onclick={`emit('/task/delete', {id: ${task.id}})`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && <p>No tasks yet. Add one above!</p>}

        <SourceCode page="task-demo.tsx" />
      </div>
    </>
  )
}

function AddTask(context: DynamicContext) {
  let body = getContextFormBody(context)
  let title = getStringCasual(body, 'title')
  if (!title) {
    throw EarlyTerminate
  }
  proxy.task.push({
    title,
    completed: false,
  })
  return <Redirect href="/task-demo" />
}

function ToggleTask(context: DynamicContext) {
  let body = getContextFormBody(context)
  let id = getId(body, 'id')
  let task = proxy.task[id]
  if (task) {
    task.completed = !task.completed
  }
  return <Redirect href="/task-demo" />
}

function UpdateTask(context: DynamicContext) {
  let body = getContextFormBody(context)
  let id = getId(body, 'id')
  let title = getStringCasual(body, 'title')
  if (!title) {
    throw EarlyTerminate
  }
  let task = proxy.task[id]
  if (task) {
    task.title = title
  }
  return <Redirect href="/task-demo" />
}

function DeleteTask(context: DynamicContext) {
  let body = getContextFormBody(context)
  let id = getId(body, 'id')
  delete proxy.task[id]
  return <Redirect href="/task-demo" />
}

let routes = {
  '/task-demo': {
    title: title('Task Demo'),
    description: 'Simple CRUD example with database',
    menuText: 'Task Demo',
    node: <TaskList />,
  },
  '/task/add': apiRoute({
    description: 'add a new task item',
    api: AddTask,
  }),
  '/task/toggle': apiRoute({
    description: 'toggle the completed status of a task item',
    api: ToggleTask,
  }),
  '/task/update': apiRoute({
    description: 'update a task item',
    api: UpdateTask,
  }),
  '/task/delete': apiRoute({
    description: 'delete a task item',
    api: DeleteTask,
  }),
} satisfies Routes

export default { routes }
