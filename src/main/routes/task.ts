/**
 * Task routes - handles task creation form display and submission.
 * Follows the existing route pattern established in home.ts.
 */

import { TaskServiceError, createTask } from '../services/taskService';
import { TaskFormData, ValidationError } from '../types/task';
import { buildDateTimeFromForm, validateTask } from '../validators/taskValidator';

import { Application, Request, Response } from 'express';

/**
 * Helper to extract error message for a specific field
 */
const getErrorMessage = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(e => e.field === field);
  return error?.text || null;
};

export default function (app: Application): void {
  /**
   * GET /task/create - Display the task creation form
   */
  app.get('/task/create', (req: Request, res: Response) => {
    res.render('task/create');
  });

  /**
   * POST /task/create - Handle task creation form submission
   */
  app.post('/task/create', async (req: Request, res: Response) => {
    const formData: TaskFormData = req.body;

    // Validate form data
    const errors = validateTask(formData);

    if (errors.length > 0) {
      return res.render('task/create', {
        errorSummary: errors,
        values: formData,
        titleError: getErrorMessage(errors, 'title'),
        descriptionError: getErrorMessage(errors, 'description'),
        dueDateError: getErrorMessage(errors, 'dueDate'),
        dueTimeError: getErrorMessage(errors, 'dueTime'),
      });
    }

    try {
      // Build the task request payload
      const taskRequest = {
        title: formData.title!.trim(),
        description: formData.description?.trim() || undefined,
        status: 'PENDING', // New tasks always start as pending
        dueDateTime: buildDateTimeFromForm(formData),
      };

      // Call the backend API
      const createdTask = await createTask(taskRequest);

      // Render confirmation page with created task
      res.render('task/confirmation', {
        task: createdTask,
      });
    } catch (error) {
      console.error('Error creating task:', error);

      // Determine error message
      let errorMessage = 'Unable to create task. Please try again.';
      if (error instanceof TaskServiceError) {
        errorMessage = error.message;
      }

      // Re-render form with error
      res.render('task/create', {
        errors: [{ field: 'form', text: errorMessage, href: '#' }],
        errorSummary: [{ field: 'form', text: errorMessage, href: '#' }],
        values: formData,
      });
    }
  });
}
