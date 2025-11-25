/**
 * Task Service - handles communication with the Spring Boot backend API.
 * Separated from routes to allow easy mocking in tests and centralised error handling.
 */

import { Task } from '../types/task';

import axios, { AxiosError } from 'axios';

const BACKEND_URL = 'http://localhost:4000';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: string;
  dueDateTime: string;
}

export class TaskServiceError extends Error {
  public statusCode: number;
  public details?: string;

  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.name = 'TaskServiceError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Creates a new task via the backend API.
 * @param taskData - The task data to create
 * @returns The created task with ID and timestamps
 * @throws TaskServiceError if the API request fails
 */
export async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  try {
    const response = await axios.post<Task>(`${BACKEND_URL}/tasks`, taskData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status || 500;
      const message = getErrorMessage(axiosError);
      throw new TaskServiceError(message, statusCode);
    }
    throw new TaskServiceError('An unexpected error occurred', 500);
  }
}

function getErrorMessage(error: AxiosError): string {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid task data. Please check your input.';
      case 500:
        return 'The server encountered an error. Please try again later.';
      default:
        return 'Failed to create task. Please try again.';
    }
  }
  if (error.code === 'ECONNREFUSED') {
    return 'Unable to connect to the server. Please ensure the backend is running.';
  }
  return 'A network error occurred. Please check your connection.';
}
