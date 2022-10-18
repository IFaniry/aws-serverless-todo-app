import * as AWSXRay from 'aws-xray-sdk'
// Uncomment to use AWS SDK v2
// import { DocumentClientV2 } from '@typedorm/document-client'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'

// Uncomment to use AWS SDK v3
import { DocumentClientV3 } from '@typedorm/document-client'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

import { createConnection } from '@typedorm/core'

import { createLogger } from '../utils/logger'
import { todosTable, TodoEntity } from '../models/TodoItem'

const logger = createLogger('TodosAccess')

// https://github.com/typedorm/typedorm#developing-with-typedorm
// https://www.npmjs.com/package/aws-xray-sdk-core
// Using AWS SDK v3
const dynamoDB = new DynamoDB({})
const XDynamoDBClient = AWSXRay.captureAWSv3Client(dynamoDB)
const documentClient = new DocumentClientV3(XDynamoDBClient)

// Uncomment to use AWS SDK v2
// const XDynamoDBClient = AWSXRay.captureAWSClient(DocumentClient)
// const documentClient = new DocumentClientV2(new XDynamoDBClient({}))

// https://craftsmenltd.com/blog/2022/07/15/improving-cost-and-efficiency-by-using-aws-lambda-cache/
export function createDbConnection() {
  logger.info(`TODOS_TABLE: "${process.env.TODOS_TABLE}"`)
  logger.info(`TODOS_CREATED_AT_INDEX: "${process.env.TODOS_CREATED_AT_INDEX}"`)

  createConnection({
    table: todosTable,
    entities: [TodoEntity],
    documentClient,
  })
}
