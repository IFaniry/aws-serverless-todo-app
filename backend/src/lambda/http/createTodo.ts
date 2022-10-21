import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import errorLogger from '@middy/error-logger'
import cors from '@middy/http-cors'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../auth/utils';
import { createTodoItem } from '../../businessLogic/todos'
import { createDbConnection } from '../../dataLayer/todosAccess'

createDbConnection()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body as string)

    const userId = getUserId(event)

    const createdTodo = await createTodoItem(userId, newTodo)
    
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: createdTodo
      })
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
