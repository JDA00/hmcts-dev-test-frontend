/**
 * Task Validator - server-side validation for task creation form.
 * Returns errors in GOV.UK Error Summary compatible format.
 */

import { TaskFormData, ValidationError } from '../types/task';

const MAX_TITLE_LENGTH = 255;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Validates task form data and returns an array of validation errors.
 * Returns an empty array if validation passes.
 */
export function validateTask(formData: TaskFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Title validation
  if (!formData.title?.trim()) {
    errors.push({
      field: 'title',
      text: 'Enter a task title',
      href: '#title',
    });
  } else if (formData.title.length > MAX_TITLE_LENGTH) {
    errors.push({
      field: 'title',
      text: `Task title must be ${MAX_TITLE_LENGTH} characters or fewer`,
      href: '#title',
    });
  }

  // Description validation (optional but has max length)
  if (formData.description && formData.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push({
      field: 'description',
      text: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`,
      href: '#description',
    });
  }

  // Date validation
  const dateErrors = validateDate(formData);
  errors.push(...dateErrors);

  // Time validation
  const timeErrors = validateTime(formData);
  errors.push(...timeErrors);

  return errors;
}

function validateDate(formData: TaskFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const day = formData['dueDate-day']?.trim();
  const month = formData['dueDate-month']?.trim();
  const year = formData['dueDate-year']?.trim();

  // Check if any date parts are missing
  if (!day && !month && !year) {
    errors.push({
      field: 'dueDate',
      text: 'Enter a due date',
      href: '#dueDate-day',
    });
    return errors;
  }

  // Check individual parts
  const missingParts: string[] = [];
  if (!day) missingParts.push('day');
  if (!month) missingParts.push('month');
  if (!year) missingParts.push('year');

  if (missingParts.length > 0) {
    errors.push({
      field: 'dueDate',
      text: `Due date must include a ${missingParts.join(' and ')}`,
      href: '#dueDate-day',
    });
    return errors;
  }

  // Validate numeric values
  const dayNum = parseInt(day!, 10);
  const monthNum = parseInt(month!, 10);
  const yearNum = parseInt(year!, 10);

  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
    errors.push({
      field: 'dueDate',
      text: 'Due date must be a real date',
      href: '#dueDate-day',
    });
    return errors;
  }

  // Validate ranges
  if (monthNum < 1 || monthNum > 12) {
    errors.push({
      field: 'dueDate',
      text: 'Due date must be a real date',
      href: '#dueDate-month',
    });
    return errors;
  }

  if (dayNum < 1 || dayNum > 31) {
    errors.push({
      field: 'dueDate',
      text: 'Due date must be a real date',
      href: '#dueDate-day',
    });
    return errors;
  }

  // Validate the actual date
  const date = new Date(yearNum, monthNum - 1, dayNum);
  if (
    date.getFullYear() !== yearNum ||
    date.getMonth() !== monthNum - 1 ||
    date.getDate() !== dayNum
  ) {
    errors.push({
      field: 'dueDate',
      text: 'Due date must be a real date',
      href: '#dueDate-day',
    });
    return errors;
  }

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date < today) {
    errors.push({
      field: 'dueDate',
      text: 'Due date must be today or in the future',
      href: '#dueDate-day',
    });
  }

  return errors;
}

function validateTime(formData: TaskFormData): ValidationError[] {
  const errors: ValidationError[] = [];
  const hour = formData['dueTime-hour']?.trim();
  const minute = formData['dueTime-minute']?.trim();

  // Check if any time parts are missing
  if (!hour && !minute) {
    errors.push({
      field: 'dueTime',
      text: 'Enter a due time',
      href: '#dueTime-hour',
    });
    return errors;
  }

  // Check individual parts
  const missingParts: string[] = [];
  if (!hour) missingParts.push('hour');
  if (!minute) missingParts.push('minute');

  if (missingParts.length > 0) {
    errors.push({
      field: 'dueTime',
      text: `Due time must include ${missingParts.join(' and ')}`,
      href: '#dueTime-hour',
    });
    return errors;
  }

  // Validate numeric values
  const hourNum = parseInt(hour!, 10);
  const minuteNum = parseInt(minute!, 10);

  if (isNaN(hourNum) || isNaN(minuteNum)) {
    errors.push({
      field: 'dueTime',
      text: 'Due time must be a real time',
      href: '#dueTime-hour',
    });
    return errors;
  }

  // Validate ranges
  if (hourNum < 0 || hourNum > 23) {
    errors.push({
      field: 'dueTime',
      text: 'Hour must be between 0 and 23',
      href: '#dueTime-hour',
    });
  }

  if (minuteNum < 0 || minuteNum > 59) {
    errors.push({
      field: 'dueTime',
      text: 'Minute must be between 0 and 59',
      href: '#dueTime-minute',
    });
  }

  return errors;
}

/**
 * Builds an ISO 8601 datetime string from form data.
 * Assumes validation has already passed.
 */
export function buildDateTimeFromForm(formData: TaskFormData): string {
  const year = formData['dueDate-year'];
  const month = formData['dueDate-month']!.padStart(2, '0');
  const day = formData['dueDate-day']!.padStart(2, '0');
  const hour = formData['dueTime-hour']!.padStart(2, '0');
  const minute = formData['dueTime-minute']!.padStart(2, '0');

  return `${year}-${month}-${day}T${hour}:${minute}:00`;
}
