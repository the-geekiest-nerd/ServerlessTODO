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

const updateTodoHandler: APIGatewayProxyHandler = async (
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
          'User does not have sufficient permission to update this todo item.'
      })
    }
  }

  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  await updateTodo(todoId, updatedTodo)

  return {
    statusCode: 200,
    body: JSON.stringify({
      statusMessage: 'Todo item updated successfully.'
    })
  }
}

export const handler = middy(updateTodoHandler).use(cors({ credentials: true }))
