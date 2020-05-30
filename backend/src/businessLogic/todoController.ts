import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccessModel } from '../databaseAccess/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccessModel = new TodoAccessModel()

export async function getTodoById(todoId: string): Promise<TodoItem> {
  return todoAccessModel.getTodoItemById(todoId)
}

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
  return todoAccessModel.getAllTodoItems(userId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const itemId = uuid.v4()

  return todoAccessModel.createTodoItem({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false
  })
}

export async function updateTodo(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  await todoAccessModel.updateTodoItem(todoId, updateTodoRequest)
}

export async function deleteTodo(todoId: string): Promise<void> {
  await todoAccessModel.deleteTodoItem(todoId)
}

export async function setAttachmentUrl(
  todoId: string,
  attachmentUrl: string
): Promise<void> {
  await todoAccessModel.setTodoAttachmentUrl(todoId, attachmentUrl)
}
