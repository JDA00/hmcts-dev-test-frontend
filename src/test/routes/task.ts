import { app } from '../../main/app';
import { expect } from 'chai';
import request from 'supertest';
import nock from 'nock';

describe('Task routes', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.restore();
  });

  describe('GET /task/create', () => {
    test('should return the task creation form', async () => {
      await request(app)
        .get('/task/create')
        .expect(res => {
          expect(res.status).to.equal(200);
          expect(res.text).to.include('Create a new task');
          expect(res.text).to.include('Task title');
          expect(res.text).to.include('Status');
          expect(res.text).to.include('Due date');
          expect(res.text).to.include('Due time');
        });
    });

    test('should display all status options', async () => {
      await request(app)
        .get('/task/create')
        .expect(res => {
          expect(res.text).to.include('Pending');
          expect(res.text).to.include('In Progress');
          expect(res.text).to.include('Completed');
        });
    });
  });

  describe('POST /task/create', () => {
    describe('validation errors', () => {
      test('should show error when title is missing', async () => {
        await request(app)
          .post('/task/create')
          .send({
            status: 'PENDING',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('There is a problem');
            expect(res.text).to.include('Enter a task title');
          });
      });

      test('should show error when status is missing', async () => {
        await request(app)
          .post('/task/create')
          .send({
            title: 'Test Task',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('There is a problem');
            expect(res.text).to.include('Select a task status');
          });
      });

      test('should show error when due date is missing', async () => {
        await request(app)
          .post('/task/create')
          .send({
            title: 'Test Task',
            status: 'PENDING',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('There is a problem');
            expect(res.text).to.include('Enter a due date');
          });
      });

      test('should show error when due time is missing', async () => {
        await request(app)
          .post('/task/create')
          .send({
            title: 'Test Task',
            status: 'PENDING',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('There is a problem');
            expect(res.text).to.include('Enter a due time');
          });
      });

      test('should preserve form values when validation fails', async () => {
        await request(app)
          .post('/task/create')
          .send({
            title: 'My Test Task',
            description: 'A description',
            status: 'IN_PROGRESS',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            // Missing time fields
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('My Test Task');
            expect(res.text).to.include('A description');
          });
      });
    });

    describe('successful submission', () => {
      test('should create task and show confirmation', async () => {
        nock('http://localhost:4000')
          .post('/tasks')
          .reply(201, {
            id: 123,
            title: 'Test Task',
            description: 'Test description',
            status: 'PENDING',
            dueDateTime: '2025-12-25T14:30:00',
            createdDate: '2025-01-15T10:00:00',
          });

        await request(app)
          .post('/task/create')
          .send({
            title: 'Test Task',
            description: 'Test description',
            status: 'PENDING',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('Task created');
            expect(res.text).to.include('123');
            expect(res.text).to.include('Test Task');
          });
      });

      test('should handle optional description being empty', async () => {
        nock('http://localhost:4000')
          .post('/tasks')
          .reply(201, {
            id: 456,
            title: 'Task Without Description',
            status: 'PENDING',
            dueDateTime: '2025-12-25T14:30:00',
            createdDate: '2025-01-15T10:00:00',
          });

        await request(app)
          .post('/task/create')
          .send({
            title: 'Task Without Description',
            status: 'PENDING',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('Task created');
            expect(res.text).to.include('Task Without Description');
            expect(res.text).to.include('Not provided');
          });
      });
    });

    describe('backend errors', () => {
      test('should show error message when backend returns 500', async () => {
        nock('http://localhost:4000').post('/tasks').reply(500);

        await request(app)
          .post('/task/create')
          .send({
            title: 'Test Task',
            status: 'PENDING',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('There is a problem');
          });
      });

      test('should show error message when backend is unavailable', async () => {
        nock('http://localhost:4000').post('/tasks').replyWithError({ code: 'ECONNREFUSED' });

        await request(app)
          .post('/task/create')
          .send({
            title: 'Test Task',
            status: 'PENDING',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('There is a problem');
            expect(res.text).to.include('Unable to connect');
          });
      });

      test('should preserve form values when backend fails', async () => {
        nock('http://localhost:4000').post('/tasks').reply(500);

        await request(app)
          .post('/task/create')
          .send({
            title: 'My Important Task',
            description: 'Important details',
            status: 'IN_PROGRESS',
            'dueDate-day': '25',
            'dueDate-month': '12',
            'dueDate-year': '2025',
            'dueTime-hour': '14',
            'dueTime-minute': '30',
          })
          .expect(res => {
            expect(res.status).to.equal(200);
            expect(res.text).to.include('My Important Task');
            expect(res.text).to.include('Important details');
          });
      });
    });
  });
});
