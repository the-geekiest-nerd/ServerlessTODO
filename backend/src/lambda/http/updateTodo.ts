import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS from 'aws-sdk'
import { getUserId } from '../utils'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const updateTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  const updatedItem = {
    todoId: todoId,
    userId: getUserId(event),
    ...updatedTodo
  }

  await documentClient
    .put({ TableName: todosTable, Item: updatedItem })
    .promise()

  return {
    statusCode: 200,
    body: JSON.stringify({
      updatedItem
    })
  }
}

export const handler = middy(updateTodoHandler).use(cors({ credentials: true }))
