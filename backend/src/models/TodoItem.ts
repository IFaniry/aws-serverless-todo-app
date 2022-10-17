// https://github.com/typedorm/typedorm#installation
import 'reflect-metadata'
import * as dotenv from 'dotenv'
import {
  Table,
  INDEX_TYPE,
  Attribute,
  Entity,
  AutoGenerateAttribute,
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
} from '@typedorm/common'
import { z } from 'zod'

dotenv.config()

export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
}

// Todo item Zod Schema
export const todoItemSchema = z.object({
  userId: z.string(),
  todoId: z.string(),
  createdAt: z.string(),
  name: z.string(),
  dueDate: z.string(),
  done: z.boolean(),
  attachmentUrl: z.string().optional(),
})

export const createdAtLSI = process.env.TODOS_CREATED_AT_INDEX || 'CreatedAtIndex'

// Todos typedorm Table
export const todosTable = new Table({
  name: process.env.TODOS_TABLE || 'tahina-todos-dev',
  partitionKey: 'userId',
  sortKey: 'todoId',
  indexes: {
    [createdAtLSI]: {
      type: INDEX_TYPE.LSI,
      sortKey: 'createdAt',
    },
  },
})

// TodoItem typedorm Entity
@Entity({
  name: 'todo',
  primaryKey: {
    partitionKey: 'TODO-BY-{{userId}}',
    sortKey: 'TODO-{{todoId}}',
  },
  indexes: {
    [createdAtLSI]: {
      sortKey: 'TODOS-CREATED_AT-{{createdAt}}',
      type: INDEX_TYPE.LSI,
    },
  },
})
export class TodoEntity {
  @Attribute()
  userId!: string

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  todoId!: string

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.EPOCH_DATE,
  })
  createdAt!: number

  @Attribute()
  name!: string

  @Attribute()
  dueDate!: string

  @Attribute()
  done!: boolean

  @Attribute()
  attachmentUrl!: string
}
