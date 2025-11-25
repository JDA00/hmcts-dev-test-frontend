import { TaskFormData } from '../../main/types/task';
import { buildDateTimeFromForm, validateTask } from '../../main/validators/taskValidator';

import { expect } from 'chai';

describe('Task Validator', () => {
  // Helper to create valid form data
  const createValidFormData = (overrides: Partial<TaskFormData> = {}): TaskFormData => ({
    title: 'Test Task',
    description: 'Test description',
    'dueDate-day': '25',
    'dueDate-month': '12',
    'dueDate-year': '2025',
    'dueTime-hour': '14',
    'dueTime-minute': '30',
    ...overrides,
  });

  describe('title validation', () => {
    test('should return error when title is empty', () => {
      const formData = createValidFormData({ title: '' });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'title',
        text: 'Enter a task title',
        href: '#title',
      });
    });

    test('should return error when title is only whitespace', () => {
      const formData = createValidFormData({ title: '   ' });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'title',
        text: 'Enter a task title',
        href: '#title',
      });
    });

    test('should return error when title exceeds 255 characters', () => {
      const formData = createValidFormData({ title: 'a'.repeat(256) });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'title',
        text: 'Task title must be 255 characters or fewer',
        href: '#title',
      });
    });

    test('should pass when title is valid', () => {
      const formData = createValidFormData({ title: 'Valid Task Title' });
      const errors = validateTask(formData);
      const titleErrors = errors.filter(e => e.field === 'title');
      expect(titleErrors).to.have.length(0);
    });

    test('should pass when title is exactly 255 characters', () => {
      const formData = createValidFormData({ title: 'a'.repeat(255) });
      const errors = validateTask(formData);
      const titleErrors = errors.filter(e => e.field === 'title');
      expect(titleErrors).to.have.length(0);
    });
  });

  describe('description validation', () => {
    test('should pass when description is empty (optional field)', () => {
      const formData = createValidFormData({ description: '' });
      const errors = validateTask(formData);
      const descErrors = errors.filter(e => e.field === 'description');
      expect(descErrors).to.have.length(0);
    });

    test('should pass when description is undefined', () => {
      const formData = createValidFormData({ description: undefined });
      const errors = validateTask(formData);
      const descErrors = errors.filter(e => e.field === 'description');
      expect(descErrors).to.have.length(0);
    });

    test('should return error when description exceeds 1000 characters', () => {
      const formData = createValidFormData({ description: 'a'.repeat(1001) });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'description',
        text: 'Description must be 1000 characters or fewer',
        href: '#description',
      });
    });

    test('should pass when description is exactly 1000 characters', () => {
      const formData = createValidFormData({ description: 'a'.repeat(1000) });
      const errors = validateTask(formData);
      const descErrors = errors.filter(e => e.field === 'description');
      expect(descErrors).to.have.length(0);
    });
  });

  describe('date validation', () => {
    test('should return error when all date parts are missing', () => {
      const formData = createValidFormData({
        'dueDate-day': '',
        'dueDate-month': '',
        'dueDate-year': '',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueDate',
        text: 'Enter a due date',
        href: '#dueDate-day',
      });
    });

    test('should return error when day is missing', () => {
      const formData = createValidFormData({
        'dueDate-day': '',
        'dueDate-month': '12',
        'dueDate-year': '2025',
      });
      const errors = validateTask(formData);
      const dateError = errors.find(e => e.field === 'dueDate');
      expect(dateError?.text).to.include('day');
    });

    test('should return error when month is missing', () => {
      const formData = createValidFormData({
        'dueDate-day': '25',
        'dueDate-month': '',
        'dueDate-year': '2025',
      });
      const errors = validateTask(formData);
      const dateError = errors.find(e => e.field === 'dueDate');
      expect(dateError?.text).to.include('month');
    });

    test('should return error when year is missing', () => {
      const formData = createValidFormData({
        'dueDate-day': '25',
        'dueDate-month': '12',
        'dueDate-year': '',
      });
      const errors = validateTask(formData);
      const dateError = errors.find(e => e.field === 'dueDate');
      expect(dateError?.text).to.include('year');
    });

    test('should return error for invalid date (Feb 31)', () => {
      const formData = createValidFormData({
        'dueDate-day': '31',
        'dueDate-month': '02',
        'dueDate-year': '2025',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueDate',
        text: 'Due date must be a real date',
        href: '#dueDate-day',
      });
    });

    test('should return error for invalid month (13)', () => {
      const formData = createValidFormData({
        'dueDate-day': '25',
        'dueDate-month': '13',
        'dueDate-year': '2025',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueDate',
        text: 'Due date must be a real date',
        href: '#dueDate-month',
      });
    });

    test('should return error for past date', () => {
      const formData = createValidFormData({
        'dueDate-day': '01',
        'dueDate-month': '01',
        'dueDate-year': '2020',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueDate',
        text: 'Due date must be today or in the future',
        href: '#dueDate-day',
      });
    });

    test('should return error for non-numeric date values', () => {
      const formData = createValidFormData({
        'dueDate-day': 'abc',
        'dueDate-month': '12',
        'dueDate-year': '2025',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueDate',
        text: 'Due date must be a real date',
        href: '#dueDate-day',
      });
    });
  });

  describe('time validation', () => {
    test('should return error when all time parts are missing', () => {
      const formData = createValidFormData({
        'dueTime-hour': '',
        'dueTime-minute': '',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueTime',
        text: 'Enter a due time',
        href: '#dueTime-hour',
      });
    });

    test('should return error when hour is missing', () => {
      const formData = createValidFormData({
        'dueTime-hour': '',
        'dueTime-minute': '30',
      });
      const errors = validateTask(formData);
      const timeError = errors.find(e => e.field === 'dueTime');
      expect(timeError?.text).to.include('hour');
    });

    test('should return error when minute is missing', () => {
      const formData = createValidFormData({
        'dueTime-hour': '14',
        'dueTime-minute': '',
      });
      const errors = validateTask(formData);
      const timeError = errors.find(e => e.field === 'dueTime');
      expect(timeError?.text).to.include('minute');
    });

    test('should return error for invalid hour (24)', () => {
      const formData = createValidFormData({
        'dueTime-hour': '24',
        'dueTime-minute': '30',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueTime',
        text: 'Hour must be between 0 and 23',
        href: '#dueTime-hour',
      });
    });

    test('should return error for invalid hour (-1)', () => {
      const formData = createValidFormData({
        'dueTime-hour': '-1',
        'dueTime-minute': '30',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueTime',
        text: 'Hour must be between 0 and 23',
        href: '#dueTime-hour',
      });
    });

    test('should return error for invalid minute (60)', () => {
      const formData = createValidFormData({
        'dueTime-hour': '14',
        'dueTime-minute': '60',
      });
      const errors = validateTask(formData);
      expect(errors).to.deep.include({
        field: 'dueTime',
        text: 'Minute must be between 0 and 59',
        href: '#dueTime-minute',
      });
    });

    test('should pass for valid time (00:00)', () => {
      const formData = createValidFormData({
        'dueTime-hour': '0',
        'dueTime-minute': '0',
      });
      const errors = validateTask(formData);
      const timeErrors = errors.filter(e => e.field === 'dueTime');
      expect(timeErrors).to.have.length(0);
    });

    test('should pass for valid time (23:59)', () => {
      const formData = createValidFormData({
        'dueTime-hour': '23',
        'dueTime-minute': '59',
      });
      const errors = validateTask(formData);
      const timeErrors = errors.filter(e => e.field === 'dueTime');
      expect(timeErrors).to.have.length(0);
    });
  });

  describe('buildDateTimeFromForm', () => {
    test('should build ISO datetime string correctly', () => {
      const formData = createValidFormData();
      const result = buildDateTimeFromForm(formData);
      expect(result).to.equal('2025-12-25T14:30:00');
    });

    test('should pad single digit values', () => {
      const formData = createValidFormData({
        'dueDate-day': '5',
        'dueDate-month': '3',
        'dueTime-hour': '9',
        'dueTime-minute': '5',
      });
      const result = buildDateTimeFromForm(formData);
      expect(result).to.equal('2025-03-05T09:05:00');
    });
  });

  describe('multiple errors', () => {
    test('should return multiple errors when multiple fields are invalid', () => {
      const formData: TaskFormData = {
        title: '',
        'dueDate-day': '',
        'dueDate-month': '',
        'dueDate-year': '',
        'dueTime-hour': '',
        'dueTime-minute': '',
      };
      const errors = validateTask(formData);
      expect(errors.length).to.be.greaterThan(1);
      expect(errors.some(e => e.field === 'title')).to.be.true;
      expect(errors.some(e => e.field === 'dueDate')).to.be.true;
      expect(errors.some(e => e.field === 'dueTime')).to.be.true;
    });
  });
});
