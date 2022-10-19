import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import errorLogger from '@middy/error-logger'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'

import { updateTodoItem } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../auth/utils'
import { createDbConnection } from '../../dataAccess/todosAccess'

createDbConnection()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event?.pathParameters?.todoId) {
      throw new createError.UnprocessableEntity('Missing route parameter')
    }

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body as string)
    
    await updateTodoItem({ userId, todoId }, updatedTodo)

    return {
      statusCode: 200,
      body: ''
    }
})

handler
  .use(httpErrorHandler())
  .use(errorLogger())
  .use(
    cors({
      credentials: true
    })
  )
