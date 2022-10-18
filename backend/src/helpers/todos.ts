// import * as AWSXRay from 'aws-xray-sdk'
// import { DocumentClientV3 } from '@typedorm/document-client'
// import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
// import { createConnection } from '@typedorm/core'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { z } from 'zod'
import * as createError from 'http-errors'
import { fromZodError } from 'zod-validation-error'
import { ZodError } from 'zod'
import { getEntityManager } from '@typedorm/core'
import { QUERY_ORDER } from '@typedorm/common'

import { createLogger } from '../utils/logger'
import { TodoEntity, todoItemSchema } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createdAtLSI } from '../models/TodoItem'

const logger = createLogger('TodosAccess')

export async function getTodoItems(userId: string): Promise<TodoEntity[]> {
  const entityManager = getEntityManager()

  const { items: todoItems } = await entityManager.find(
    TodoEntity,
    { userId },
    {
      queryIndex: createdAtLSI,
      orderBy: QUERY_ORDER.DESC,
    },
  )

  return todoItems
}

export async function createTodoItem(userId: string, payload: CreateTodoRequest) {
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
  todoItem.userId = userId

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

export async function updateTodoAttachmentUrl(
  { userId, todoId }: { userId: string; todoId: string; },
  attachmentUrl: string
) {
  const userIdSchema = z.string({
    required_error: 'userId is required',
    invalid_type_error: 'userId must be a string',
  })
  const todoIdSchema = z.string({
    required_error: 'todoId is required',
    invalid_type_error: 'todoId must be a string',
  })
  const attachmentUrlSchema = z.string({
    required_error: 'attachmentUrl is required',
    invalid_type_error: 'attachmentUrl must be a string',
  })

logger.info('todoId: ', todoId)

  // Todo Update Payload Validation
  try {
    userIdSchema.parse(userId)
    todoIdSchema.parse(todoId)
    attachmentUrlSchema.parse(attachmentUrl)
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

  logger.info('Updating a Todo attachmentUrl with payload:', { attachmentUrl })

  await entityManager.update(
    TodoEntity,
    { userId, todoId },
    { attachmentUrl }
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
