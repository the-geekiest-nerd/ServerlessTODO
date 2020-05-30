import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo, getTodoById } from '../../businessLogic/todoController'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodoHandler')

const updateTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info(`Updating todo item: ${todoId}`)
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
          'User does not have sufficient permission to update this todo item'
      })
    }
  }

  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  await updateTodo(todoId, updatedTodo)
  logger.info(`Updated todo item ${todoId} successfully`)

  return {
    statusCode: 200,
    body: JSON.stringify({
      statusMessage: 'Todo item updated successfully'
    })
  }
}

export const handler = middy(updateTodoHandler).use(cors({ credentials: true }))
