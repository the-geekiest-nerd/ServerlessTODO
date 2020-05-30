import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todoController'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createToDohandler')

const createTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const userId = getUserId(event)
  logger.info(`Creating a new todo item for user ${userId}`)
  const newTodoItem = await createTodo(newTodo, userId)
  logger.info(
    `Successfully created todo item with id ${newTodoItem.todoId} for user ${newTodoItem.userId}`
  )

  return {
    statusCode: 201,
    body: JSON.stringify({ item: newTodoItem })
  }
}

export const handler = middy(createTodoHandler).use(cors({ credentials: true }))
