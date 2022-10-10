import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClientV3 } from '@typedorm/document-client'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { createConnection, getEntityManager } from '@typedorm/core'
// import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { todosTable, TodoEntity, todoItemSchema } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
// https://github.com/typedorm/typedorm#developing-with-typedorm
const XDynamoDBClient = AWSXRay.captureAWSClient(DynamoDBClient)
const documentClient = new DocumentClientV3(new XDynamoDBClient({}))

export async function getTodoItems(userId: string): Promise<TodoEntity[]> {
  createConnection({
    table: todosTable,
    entities: [TodoEntity],
    documentClient,
  })

  const entityManager = getEntityManager()

  const { items: todoItems } = await entityManager.find(TodoEntity, { userId })

  return todoItems
}

export async function createTodoItem(payload: CreateTodoRequest) {
	const todoItemCreationSchema = todoItemSchema.pick({
		name: true,
		dueDate: true,
	})
  // Create Todo Payload Validation
	todoItemCreationSchema.parse(payload)

	const { name, dueDate } = payload

	const todoItem = new TodoEntity()
	todoItem.name = name
	todoItem.dueDate = dueDate

  logger.info(`Creating a Todo named: ${name} and due on ${dueDate}`)

  createConnection({
    table: todosTable,
    entities: [TodoEntity],
    documentClient,
  })

	const entityManager = getEntityManager()

	await entityManager.create(todoItem)
}

export async function updateTodoItem(userId: string, payload: UpdateTodoRequest) {
	const todoItemUpdateSchema = todoItemSchema.pick({
		name: true,
		dueDate: true,
		done: true,
    attachmentUrl: true,
	}).partial()
  // Update Todo Payload Validation
	todoItemUpdateSchema.parse(payload)

  createConnection({
    table: todosTable,
    entities: [TodoEntity],
    documentClient,
  })

	const entityManager = getEntityManager()

  logger.info('Updating a Todo with payload:', payload)

	await entityManager.update(
		TodoEntity,
		{ userId },
		payload
	)
}

export async function deleteTodoItem(todoId: string) {
  createConnection({
    table: todosTable,
    entities: [TodoEntity],
    documentClient,
  })

  const entityManager = getEntityManager()

  await entityManager.delete(TodoEntity, { todoId })
}
