import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClientV3 } from '@typedorm/document-client'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { createConnection, getEntityManager as getTypedormEntityManager } from '@typedorm/core'

import { createLogger } from '../utils/logger'
import { todosTable, TodoEntity } from '../models/TodoItem'

const logger = createLogger('TodosAccess')

// https://github.com/typedorm/typedorm#developing-with-typedorm
const XDynamoDBClient = AWSXRay.captureAWSClient(DynamoDBClient)
const documentClient = new DocumentClientV3(new XDynamoDBClient({}))

export function getEntityManager() {
  logger.info(`TODOS_TABLE: "${process.env.TODOS_TABLE}"`)

  createConnection({
    table: todosTable,
    entities: [TodoEntity],
    documentClient,
  })

  const entityManager = getTypedormEntityManager()

  return entityManager
}
