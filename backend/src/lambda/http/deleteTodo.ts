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

const deleteTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const todoItem = await getTodoById(todoId)

  if (!todoItem) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        statusMessage: 'No such todo item exists.'
      })
    }
  }

  if (todoItem.userId !== getUserId(event)) {
    return {
      statusCode: 403,
      body: JSON.stringify({
        statusMessage:
          'User does not have sufficient permission to delete this todo item.'
      })
    }
  }

  await deleteTodo(todoId)

  return {
    statusCode: 200,
    body: JSON.stringify({
      statusMessage: 'Item removed successfully'
    })
  }
}

export const handler = middy(deleteTodoHandler).use(cors({ credentials: true }))
