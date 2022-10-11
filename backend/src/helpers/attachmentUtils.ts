// import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { createLogger } from '../utils/logger'

// Set the AWS Region.
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_s3_code_examples.html
// Create an Amazon S3 service client object.
const XS3Client = AWSXRay.captureAWSClient(S3Client)
const s3Client = new XS3Client({});

const logger = createLogger('attachmentUtils')

// TODO: Implement the fileStogare logic
// const s3 = new XAWS.S3({
//   signatureVersion: 'v4'
// })

// const todosTableName = process.env.TODOS_TABLE || 'Todos-dev'
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION || '300'

export async function createAttachmentPresignedUrl(todoId: string) {
  logger.info(`AWS_REGION: "${process.env.AWS_REGION}"`)
  logger.info(`ATTACHMENT_S3_BUCKET: "${process.env.ATTACHMENT_S3_BUCKET}"`)
  logger.info(`SIGNED_URL_EXPIRATION: "${process.env.SIGNED_URL_EXPIRATION}"`)

  // Set parameters
  // Create a random name for the Amazon Simple Storage Service (Amazon S3) bucket and key
  const bucketParams = {
    Bucket: bucketName,
    Key: todoId,
  };

  // Create a command to put the object in the S3 bucket.
  const putCommand = new PutObjectCommand(bucketParams);
  // Create the presigned URL.
  const signedUrl = await getSignedUrl(s3Client, putCommand, {
    expiresIn: parseInt(urlExpiration, 10),
  });

  // https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html
  // `https://${bucketName}.s3.${regionCode}.amazonaws.com/${keyName}`
  return signedUrl
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getSignedUrl-property
  // return s3.getSignedUrl('putObject', {
  //   Bucket: bucketName,
  //   // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#createPresignedPost-property
  //   Key: nanoid(),
  //   Expires: urlExpiration
  // })
}
