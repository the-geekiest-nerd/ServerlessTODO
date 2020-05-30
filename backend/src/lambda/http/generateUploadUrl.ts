import 'source-map-support/register'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import {
  setAttachmentUrl,
  getTodoById
} from '../../businessLogic/todoController'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateSignedURLHandler')
const bucketName = process.env.S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const generateSignedURLHandler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  logger.info(`Attaching image to todo item: ${todoId}`)
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
          'User does not have sufficient permission to add attachment image to this todo item'
      })
    }
  }

  const imageId = uuid.v4()
  const s3 = new AWS.S3({
    signatureVersion: 'v4'
  })

  const imageUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
  setAttachmentUrl(todoId, imageUrl)
  logger.info(`Attached image url to todo item: ${todoId}`)
  logger.info('Generating signed url for S3 upload')

  const url = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: urlExpiration
  })

  return {
    statusCode: 201,
    body: JSON.stringify({
      imageUrl: imageUrl,
      uploadUrl: url
    })
  }
}

export const handler = middy(generateSignedURLHandler).use(
  cors({ credentials: true })
)
