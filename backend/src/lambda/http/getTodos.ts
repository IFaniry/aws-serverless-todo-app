import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import errorLogger from '@middy/error-logger'
import cors from '@middy/http-cors'

import { getTodoItems } from '../../helpers/todos'
import { getUserId } from '../utils';
import { createDbConnection } from '../../helpers/todosAccess'

createDbConnection()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userId = getUserId(event)
    
    const todos = await getTodoItems(userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        items: todos
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
