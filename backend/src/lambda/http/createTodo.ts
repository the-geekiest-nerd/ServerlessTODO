import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '../utils'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

const createTodoHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = uuid.v4()
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  const item = {
    todoId: todoId,
    userId: getUserId(event),
    ...newTodo
  }

  await documentClient.put({ TableName: todosTable, Item: item }).promise()
  return {
    statusCode: 201,
    body: JSON.stringify({ item: newTodo })
  }
}

export const handler = middy(createTodoHandler).use(cors({ credentials: true }))
