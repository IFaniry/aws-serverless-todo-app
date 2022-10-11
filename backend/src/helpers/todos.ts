// import * as AWSXRay from 'aws-xray-sdk'
// import { DocumentClientV3 } from '@typedorm/document-client'
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
// import { createConnection } from '@typedorm/core'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { z } from 'zod'
import * as createError from 'http-errors'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { createLogger } from '../utils/logger'
import { TodoEntity, todoItemSchema } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { getEntityManager } from './todosAccess'

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
// https://github.com/typedorm/typedorm#developing-with-typedorm
// const XDynamoDBClient = AWSXRay.captureAWSClient(DynamoDBClient)
// const documentClient = new DocumentClientV3(new XDynamoDBClient({}))

export async function getTodoItems(userId: string): Promise<TodoEntity[]> {
  const entityManager = getEntityManager()

  const { items: todoItems } = await entityManager.find(TodoEntity, { userId })

  return todoItems
}

export async function createTodoItem(payload: CreateTodoRequest) {
  const todoItemCreationSchema = todoItemSchema.pick({
    name: true,
    dueDate: true,
  })
  // Todo Create Payload Validation
  try {
    todoItemCreationSchema.parse(payload)  
  } catch(error) {
    // throw back error as 422 HTTP error
    // https://middy.js.org/docs/middlewares/http-error-handler/
    // https://github.com/jshttp/http-errors#new-createerrorcode--namemsg
    if (error instanceof ZodError) {
      throw new createError.UnprocessableEntity(
        fromZodError(error).message
      )
    }
  }

  const { name, dueDate } = payload

  const todoItem = new TodoEntity()
  todoItem.name = name
  todoItem.dueDate = dueDate

  logger.info(`Creating a Todo named: ${name} and due on ${dueDate}`)

  const entityManager = getEntityManager()

  await entityManager.create(todoItem)
}

export async function updateTodoItem(
  { userId, todoId }: { userId: string; todoId: string; },
  payload: UpdateTodoRequest
) {
  const userIdSchema = z.string({
    required_error: 'userId is required',
    invalid_type_error: 'userId must be a string',
  })
  const todoIdSchema = z.string({
    required_error: 'todoId is required',
    invalid_type_error: 'todoId must be a string',
  })

  const todoItemUpdateSchema = todoItemSchema.pick({
    name: true,
    dueDate: true,
    done: true,
    attachmentUrl: true,
  }).partial()
  // Todo Update Payload Validation
  try {
    userIdSchema.parse(userId)
    todoIdSchema.parse(todoId)
    todoItemUpdateSchema.parse(payload)
  } catch(error) {
    // throw back error as 422 HTTP error
    // https://middy.js.org/docs/middlewares/http-error-handler/
    // https://github.com/jshttp/http-errors#new-createerrorcode--namemsg
    if (error instanceof ZodError) {
      throw new createError.UnprocessableEntity(
        fromZodError(error).message
      )
    }
  }

  const entityManager = getEntityManager()

  logger.info('Updating a Todo with payload:', payload)

  await entityManager.update(
    TodoEntity,
    { userId, todoId },
    payload
  )
}

export async function deleteTodoItem(
  { userId, todoId }: { userId: string; todoId: string; }
) {
  const userIdSchema = z.string({
    required_error: 'userId is required',
    invalid_type_error: 'userId must be a string',
  })
  const todoIdSchema = z.string({
    required_error: 'todoId is required',
    invalid_type_error: 'todoId must be a string',
  })

  // Todo Delete Params Validation
  try {
    userIdSchema.parse(userId)
    todoIdSchema.parse(todoId)
  } catch(error) {
    // throw back error as 422 HTTP error
    // https://middy.js.org/docs/middlewares/http-error-handler/
    // https://github.com/jshttp/http-errors#new-createerrorcode--namemsg
    if (error instanceof ZodError) {
      throw new createError.UnprocessableEntity(
        fromZodError(error).message
      )
    }
  }

  const entityManager = getEntityManager()

  await entityManager.delete(TodoEntity, { userId, todoId })
}
