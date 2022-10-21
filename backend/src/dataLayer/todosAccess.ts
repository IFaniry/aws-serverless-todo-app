import * as AWSXRay from 'aws-xray-sdk'
// Uncomment to use AWS SDK v2
// import { DocumentClientV2 } from '@typedorm/document-client'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'

// Uncomment to use AWS SDK v3
import { DocumentClientV3 } from '@typedorm/document-client'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

import { createConnection, getEntityManager } from '@typedorm/core'
import { QUERY_ORDER } from '@typedorm/common'
import { z, ZodError } from 'zod'
import * as createError from 'http-errors'
import { fromZodError } from 'zod-validation-error'

import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { todosTable, TodoEntity, todoItemSchema, createdAtLSI } from '../models/TodoItem'


const logger = createLogger('TodosAccess')

export class TodosAccess {
  async getTodos(userId: string): Promise<TodoEntity[]> {
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

  async getTodo(
    { userId, todoId }: { userId: string; todoId: string; }
  ): Promise<TodoEntity | undefined> {
    const entityManager = getEntityManager()
    
    const todoItem = await entityManager.findOne(
      TodoEntity,
      { userId, todoId },
    )

    return todoItem
  }

  async createTodo(userId: string, payload: CreateTodoRequest) {
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

    const createdTodoItem = await entityManager.create<TodoEntity>(todoItem)

    return createdTodoItem
  }

  async updateTodo(
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

    logger.info('Updating a Todo with payload:', payload)

    const entityManager = getEntityManager()

    await entityManager.update(
      TodoEntity,
      { userId, todoId },
      payload
    )
  }

  async updateTodoAttachmentUrl(
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

    logger.info('Updating a Todo attachmentUrl with payload:', { attachmentUrl })

    const entityManager = getEntityManager()

    await entityManager.update(
      TodoEntity,
      { userId, todoId },
      { attachmentUrl }
    )
  }

  async deleteTodo(
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
}

// https://github.com/typedorm/typedorm#developing-with-typedorm
// https://www.npmjs.com/package/aws-xray-sdk-core
// Using AWS SDK v3
const dynamoDB = new DynamoDB({})
const XDynamoDBClient = AWSXRay.captureAWSv3Client(dynamoDB)
const documentClient = new DocumentClientV3(XDynamoDBClient)

// Uncomment to use AWS SDK v2
// const XDynamoDBClient = AWSXRay.captureAWSClient(DocumentClient)
// const documentClient = new DocumentClientV2(new XDynamoDBClient({}))

// https://craftsmenltd.com/blog/2022/07/15/improving-cost-and-efficiency-by-using-aws-lambda-cache/
export function createDbConnection() {
  logger.info(`TODOS_TABLE: "${process.env.TODOS_TABLE}"`)
  logger.info(`TODOS_CREATED_AT_INDEX: "${process.env.TODOS_CREATED_AT_INDEX}"`)

  createConnection({
    table: todosTable,
    entities: [TodoEntity],
    documentClient,
  })
}
