// https://github.com/typedorm/typedorm#installation
import 'reflect-metadata'
import 'source-map-support/register'

import { APIGatewayProxyResult, S3CreateEvent } from 'aws-lambda'
import middy from '@middy/core'
import httpErrorHandler from '@middy/http-error-handler'
import errorLogger from '@middy/error-logger'
// import cors from '@middy/http-cors'

import { createLogger } from '../../utils/logger'
import { updateTodoAttachmentUrl } from '../../helpers/todos'

const logger = createLogger('AttachmentUrlUpdate')

export const handler = middy(
  async (event: S3CreateEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`AWS_REGION: "${process.env.AWS_REGION}"`)
    logger.info(`ATTACHMENT_S3_BUCKET: "${process.env.ATTACHMENT_S3_BUCKET}"`)
    
    for (const record of event.Records) {
      logger.info(`Processing: "${record.s3.object.key}" S3 Object`)

      const [ todoId, userId ] = record.s3.object.key.split("/")
      
      const bucketName = process.env.ATTACHMENT_S3_BUCKET
      const regionCode = process.env.AWS_REGION

      // https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html
      const attachmentUrl = `https://${bucketName}.s3.${regionCode}.amazonaws.com/${userId}/${todoId}`

      // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
      await updateTodoAttachmentUrl({ userId, todoId }, attachmentUrl)
    }

    return {
      statusCode: 200,
      body: ''
    }
})

handler
  .use(httpErrorHandler())
  // .use(
  //   cors({
  //     credentials: true
  //   })
  // )
  .use(errorLogger())
