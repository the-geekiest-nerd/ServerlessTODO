import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoAccessModel } from '../databaseAccess/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccessModel = new TodoAccessModel()

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

export async function update(
  todoId: string,
  updateTodoRequest: UpdateTodoRequest,
  userId: string
): Promise<void> {
  const todo = await todoAccessModel.getTodoItemById(todoId, userId)
  todoAccessModel.updateTodoItem(todo.todoId, todo.createdAt, updateTodoRequest)
}

export async function deleteTodo(
  todoId: string,
  userId: string
): Promise<void> {
  const todo = await todoAccessModel.getTodoItemById(todoId, userId)
  await todoAccessModel.deleteTodoItem(todo.todoId, todo.userId)
}

export async function setAttachmentUrl(
  todoId: string,
  attachmentUrl: string,
  userId: string
): Promise<void> {
  const todo = await todoAccessModel.getTodoItemById(todoId, userId)
  todoAccessModel.setTodoAttachmentUrl(todo.todoId, todo.userId, attachmentUrl)
}
