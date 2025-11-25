/**
 * Task type definitions for the HMCTS Task Management Frontend.
 * These interfaces match the Spring Boot backend API contract.
 */

export interface Task {
  id?: number;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDateTime: string; // ISO 8601 format
  createdDate?: string;
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface TaskFormData {
  title?: string;
  description?: string;
  status?: string;
  'dueDate-day'?: string;
  'dueDate-month'?: string;
  'dueDate-year'?: string;
  'dueTime-hour'?: string;
  'dueTime-minute'?: string;
}

export interface ValidationError {
  field: string;
  text: string;
  href: string;
}

export const TASK_STATUSES = [
  { value: 'PENDING', text: 'Pending' },
  { value: 'IN_PROGRESS', text: 'In Progress' },
  { value: 'COMPLETED', text: 'Completed' },
] as const;
