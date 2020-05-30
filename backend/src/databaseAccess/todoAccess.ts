import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccessModel {
  public constructor(
    private readonly documentClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
  ) {}

  public async getAllTodoItems(userId: string): Promise<TodoItem[]> {
    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  public async getTodoItemById(todoId: string): Promise<TodoItem> {
    const result = await this.documentClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: { ':todoId': todoId }
      })
      .promise()

    const item = result.Items[0]
    return item as TodoItem
  }

  public async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.documentClient
      .put({ TableName: this.todosTable, Item: todoItem })
      .promise()

    return todoItem
  }

  public async updateTodoItem(
    todoId: string,
    todoUpdate: TodoUpdate
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.todosTable,
        Key: { todoId },
        UpdateExpression: 'set #n = :name, done = :done, dueDate = :dueDate',
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':done': todoUpdate.done,
          ':dueDate': todoUpdate.dueDate
        },
        ExpressionAttributeNames: { '#n': 'name' },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  }

  public async setTodoAttachmentUrl(
    todoId: string,
    attachmentUrl: string
  ): Promise<void> {
    this.documentClient
      .update({
        TableName: this.todosTable,
        Key: { todoId },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: { ':attachmentUrl': attachmentUrl },
        ReturnValues: 'UPDATED_NEW'
      })
      .promise()
  }

  public async deleteTodoItem(todoId: string): Promise<void> {
    this.documentClient
      .delete({ TableName: this.todosTable, Key: { todoId } })
      .promise()
  }
}
