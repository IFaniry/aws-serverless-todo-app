import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import errorLogger from '@middy/error-logger'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'

import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (!event?.pathParameters?.todoId) {
      throw new createError.UnprocessableEntity('Missing route parameter')
    }

    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const uploadUrl = await createAttachmentPresignedUrl(todoId)

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
  .use(
    cors({
      credentials: true
    })
  )
  .use(errorLogger())
