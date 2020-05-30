import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS from 'aws-sdk'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const deleteTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  await documentClient
    .delete({ TableName: todosTable, Key: { todoId: todoId } })
    .promise()

  return {
    statusCode: 200,
    body: JSON.stringify({
      statusMessage: 'Item removed successfully'
    })
  }
}

export const handler = middy(deleteTodoHandler).use(cors({ credentials: true }))
