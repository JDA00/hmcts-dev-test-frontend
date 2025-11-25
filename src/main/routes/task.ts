/**
 * Task routes - handles task creation form display and submission.
 * Follows the existing route pattern established in home.ts.
 */

import { Application, Request, Response } from 'express';
import { TASK_STATUSES, TaskFormData } from '../types/task';
import { validateTask, buildDateTimeFromForm } from '../validators/taskValidator';
import { createTask, TaskServiceError } from '../services/taskService';

export default function (app: Application): void {
  /**
   * GET /task/create - Display the task creation form
   */
  app.get('/task/create', (req: Request, res: Response) => {
    res.render('task/create', {
      statuses: TASK_STATUSES,
    });
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
        errors,
        errorSummary: errors,
        values: formData,
        statuses: TASK_STATUSES,
      });
    }

    try {
      // Build the task request payload
      const taskRequest = {
        title: formData.title!.trim(),
        description: formData.description?.trim() || undefined,
        status: formData.status!,
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
        statuses: TASK_STATUSES,
      });
    }
  });
}
