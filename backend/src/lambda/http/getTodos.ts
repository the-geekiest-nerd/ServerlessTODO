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

const getAllTodosHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const items = await getAllTodos(getUserId(event))

  return {
    statusCode: 200,
    body: JSON.stringify({ items })
  }
}

export const handler = middy(getAllTodosHandler).use(
  cors({ credentials: true })
)
