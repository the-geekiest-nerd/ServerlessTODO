import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

const documentClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const imageId = uuid.v4()
  const s3 = new AWS.S3({
    signatureVersion: 'v4'
  })

  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })
  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`

  const updateUrlOnTodo = {
    TableName: todosTable,
    Key: { todoId: todoId },
    UpdateExpression: 'set attachmentUrl = :a',
    ExpressionAttributeValues: {
      ':a': imageUrl
    },
    ReturnValues: 'UPDATED_NEW'
  }

  await documentClient.update(updateUrlOnTodo).promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      imageUrl: imageUrl,
      uploadUrl: url
    })
  }
}
