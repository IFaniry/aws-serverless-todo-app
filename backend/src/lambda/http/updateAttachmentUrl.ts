// https://github.com/typedorm/typedorm#installation
import 'reflect-metadata'
import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, S3CreateEvent } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import errorLogger from '@middy/error-logger'
import cors from '@middy/http-cors'
import * as createError from 'http-errors'

import { updateTodoItem } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: S3CreateEvent): Promise<APIGatewayProxyResult> => {
    for (const record of event.Records) {
      const todoId = record.s3.object.key
      // TODO: get metadata
    }
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    await updateTodoItem({ userId, todoId }, updatedTodo)

    return {
      statusCode: 200,
      body: ''
    }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .use(errorLogger())
