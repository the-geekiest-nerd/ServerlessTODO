import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { deleteTodo, getTodoById } from '../../businessLogic/todoController'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodoHandler')

const deleteTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info(`Deleting todo item: ${todoId}`)
  const todoItem = await getTodoById(todoId)

  if (!todoItem) {
    logger.error(`No todo item with id ${todoId} exists`)
    return {
      statusCode: 404,
      body: JSON.stringify({
        statusMessage: 'No such todo item exists'
      })
    }
  }

  const userId = getUserId(event)
  if (todoItem.userId !== userId) {
    logger.error(
      `Todo item with id ${todoId} does not belong to user ${userId}`
    )
    return {
      statusCode: 403,
      body: JSON.stringify({
        statusMessage:
          'User does not have sufficient permission to delete this todo item'
      })
    }
  }

  await deleteTodo(todoId)
  logger.info(`Successfully deleted todo item: ${todoId}`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      statusMessage: 'Item removed successfully'
    })
  }
}

export const handler = middy(deleteTodoHandler).use(cors({ credentials: true }))
