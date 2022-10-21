import { TodosAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'


const todosAccess = new TodosAccess()

export async function getTodoItems(userId: string) {
  const todoItems = await todosAccess.getTodos(userId)

  return todoItems
}

export async function createTodoItem(userId: string, payload: CreateTodoRequest) {
  const createdTodoItem = await todosAccess.createTodo(userId, payload)

  return createdTodoItem
}

export async function updateTodoItem(
  { userId, todoId }: { userId: string; todoId: string; },
  payload: UpdateTodoRequest
) {
  await todosAccess.updateTodo(
    { userId, todoId },
    payload
  )
}

export async function updateTodoAttachmentUrl(
  { userId, todoId }: { userId: string; todoId: string; },
  attachmentUrl: string
) {
  await todosAccess.updateTodoAttachmentUrl(
    { userId, todoId },
    attachmentUrl
  )
}

export async function deleteTodoItem(
  { userId, todoId }: { userId: string; todoId: string; }
) {
  await todosAccess.deleteTodo({ userId, todoId })
}
