import * as AWSXRay from 'aws-xray-sdk'
import { S3, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TodosAccess } from '../dataLayer/todosAccess'
// https://github.com/ai/nanoid/issues/364#issuecomment-1150173952
const { nanoid } = require('nanoid')

import { createLogger } from '../utils/logger'

// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
// https://www.npmjs.com/package/aws-xray-sdk-core
const s3 = new S3({})
const s3Client = AWSXRay.captureAWSv3Client(s3)

const logger = createLogger('attachmentUtils')

const todosAccess = new TodosAccess()

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const regionCode = process.env.AWS_REGION
const urlExpiration = process.env.SIGNED_URL_EXPIRATION || '300'

export async function createAttachmentPresignedUrl(todoId: string, userId: string) {
  logger.info(`AWS_REGION: "${process.env.AWS_REGION}"`)
  logger.info(`ATTACHMENT_S3_BUCKET: "${process.env.ATTACHMENT_S3_BUCKET}"`)
  logger.info(`SIGNED_URL_EXPIRATION: "${process.env.SIGNED_URL_EXPIRATION}"`)

  // const entityManager = getEntityManager()

  const todoItem = await todosAccess.getTodo(
    { userId, todoId }
  )

  let attachmentKey: string
  let attachmentUrl:string

  if (todoItem?.attachmentUrl) {
    attachmentKey = todoItem.attachmentUrl.split('/')[3]
    attachmentUrl = todoItem.attachmentUrl
  } else {
    attachmentKey = nanoid()
    // https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html
    attachmentUrl = `https://${bucketName}.s3.${regionCode}.amazonaws.com/${attachmentKey}`
  }

  logger.info(`attachmentKey: "${attachmentKey}"`)
  
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
