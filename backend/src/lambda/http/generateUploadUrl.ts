import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import errorLogger from '@middy/error-logger'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'

import { createAttachmentPresignedUrl } from '../../mediaLogic/todosAttachments'
import { updateTodoAttachmentUrl } from '../../businessLogic/todos'
import { createDbConnection } from '../../dataLayer/todosAccess'
import { getUserId } from '../auth/utils'

createDbConnection()

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event?.pathParameters?.todoId) {
      throw new createError.UnprocessableEntity('Missing route parameter')
    }

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId

    const { attachmentUrl, uploadUrl } = await createAttachmentPresignedUrl(todoId, userId)

    await updateTodoAttachmentUrl({ userId, todoId }, attachmentUrl)

    return {
      statusCode: 200,
      body: JSON.stringify({
        uploadUrl
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(errorLogger())
  .use(
    cors({
      credentials: true
    })
  )
