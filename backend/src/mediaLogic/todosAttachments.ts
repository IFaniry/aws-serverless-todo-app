import * as AWSXRay from 'aws-xray-sdk'
import { S3, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { entityManager } from '../dataAccess/todosAccess'
// https://github.com/ai/nanoid/issues/364#issuecomment-1150173952
const { nanoid } = require('nanoid')

import { TodoEntity } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
// https://www.npmjs.com/package/aws-xray-sdk-core
const s3 = new S3({})
const s3Client = AWSXRay.captureAWSv3Client(s3)

const logger = createLogger('attachmentUtils')

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const regionCode = process.env.AWS_REGION
const urlExpiration = process.env.SIGNED_URL_EXPIRATION || '300'

export async function createAttachmentPresignedUrl(todoId: string, userId: string) {
  logger.info(`AWS_REGION: "${process.env.AWS_REGION}"`)
  logger.info(`ATTACHMENT_S3_BUCKET: "${process.env.ATTACHMENT_S3_BUCKET}"`)
  logger.info(`SIGNED_URL_EXPIRATION: "${process.env.SIGNED_URL_EXPIRATION}"`)

  const todoItem = await entityManager.findOne(
    TodoEntity,
    { userId, todoId },
    { select: ['attachmentUrl'] }
  )

  const attachmentKey = todoItem?.attachmentUrl || nanoid()

  logger.info(`attachmentKey: "${attachmentKey}"`)

  // https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html
  const attachmentUrl = `https://${bucketName}.s3.${regionCode}.amazonaws.com/${attachmentKey}`
  
  const bucketParams: PutObjectCommandInput = {
    Bucket: bucketName,
    Key: attachmentKey,
  };

  // Create a command to put the object in the S3 bucket.
  const putCommand = new PutObjectCommand(bucketParams);
  // Create the presigned URL.
  const uploadUrl = await getSignedUrl(s3Client, putCommand, {
    expiresIn: parseInt(urlExpiration, 10),
  });

  return { uploadUrl, attachmentUrl }
}
