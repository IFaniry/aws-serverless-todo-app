import { TodosAccess } from './todosAccess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import { nanoid } from 'nanoid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
// TODO: https://middy.js.org/docs/middlewares/cloudwatch-metrics
// TODO: https://middy.js.org/docs/middlewares/http-error-handler
// TODO: 401 Unauthorized response: Users can only view their images?