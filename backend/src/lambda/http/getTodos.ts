import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils'
import { getAllTodos } from '../../businessLogic/todoController'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getAllTodosHandler')

const getAllTodosHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event)
  logger.info(`Fetching all todo items for user: ${userId}`)
  const items = await getAllTodos(userId)
  logger.info(`Fetch completed for all todo items for user: ${userId}`)

  return {
    statusCode: 200,
    body: JSON.stringify({ items })
  }
}

export const handler = middy(getAllTodosHandler).use(
  cors({ credentials: true })
)
