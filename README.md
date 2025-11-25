# HMCTS Task Management Frontend

A Node.js/Express frontend application for the HMCTS task management system. This application allows caseworkers to create tasks via a web form and submit them to a Spring Boot backend API.

## Technology Stack

- Node.js (>=18.0.0)
- Express.js 4.18.2
- TypeScript 5.1.6
- Nunjucks templating engine
- GOV.UK Frontend 4.10.0
- Webpack 5 for asset bundling
- Jest for testing

## Project Structure

```
src/
├── main/
│   ├── app.ts                 # Express application setup
│   ├── server.ts              # Server entry point
│   ├── routes/
│   │   ├── home.ts            # Home page route
│   │   └── task.ts            # Task creation routes
│   ├── services/
│   │   └── taskService.ts     # Backend API client
│   ├── validators/
│   │   └── taskValidator.ts   # Form validation logic
│   ├── types/
│   │   └── task.ts            # TypeScript interfaces
│   └── views/
│       ├── template.njk       # Base template
│       ├── home.njk           # Home page
│       └── task/
│           ├── create.njk     # Task creation form
│           └── confirmation.njk # Success confirmation
└── test/
    ├── routes/
    │   ├── home.ts            # Home route tests
    │   └── task.ts            # Task route tests
    └── unit/
        └── taskValidator.ts   # Validation unit tests
```

## Features

### Task Creation

The application provides a task creation form at `/task/create` with the following fields:

- Title (required, max 255 characters)
- Description (optional, max 1000 characters)
- Due Date (required): Day, month, year inputs
- Due Time (required): Hour and minute inputs in 24-hour format

Status is automatically set to PENDING when a task is created. Status values (PENDING, IN_PROGRESS, COMPLETED) are preserved for viewing existing tasks but are not user-selectable during creation.

### Validation

Server-side validation is performed on all form submissions with GOV.UK-compliant error messaging:

- Required field validation
- Character length validation
- Date validity checking (real dates only)
- Future date enforcement
- Time range validation (0-23 hours, 0-59 minutes)

### Error Handling

- Validation errors are displayed using the GOV.UK Error Summary component
- Form values are preserved when validation fails
- Backend API errors are caught and displayed to users
- Connection errors provide helpful feedback

## Backend Integration

The frontend communicates with a Spring Boot backend at `http://localhost:4000`.

### API Endpoint

POST `/tasks`

Request body:
```json
{
  "title": "string",
  "description": "string (optional)",
  "status": "PENDING | IN_PROGRESS | COMPLETED",
  "dueDateTime": "2025-12-25T14:30:00"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "title": "string",
  "description": "string",
  "status": "PENDING",
  "dueDateTime": "2025-12-25T14:30:00",
  "createdDate": "2025-01-15T10:00:00"
}
```

## Installation

```bash
yarn install
```

## Running the Application

Development mode with hot reload:
```bash
yarn start:dev
```

Production mode:
```bash
yarn build:prod
yarn start
```

The application runs on port 3100 by default.

## Testing

### Unit Tests

Tests for validation logic:
```bash
yarn test:unit
```

Covers all validation rules including:
- Title validation (required, max length)
- Description validation (optional, max length)
- Date validation (required, valid date, future date)
- Time validation (required, valid ranges)

### Route Tests

Integration tests for HTTP endpoints:
```bash
yarn test:routes
```

Covers:
- GET /task/create - Form display
- POST /task/create - Validation error handling
- POST /task/create - Successful submission (mocked backend)
- POST /task/create - Backend error handling
- Form value preservation on errors

### Running All Tests

```bash
yarn test:unit && yarn test:routes
```

## GOV.UK Components Used

- govukInput - Text input fields
- govukTextarea - Multi-line text input
- govukDateInput - Date picker (day/month/year)
- govukButton - Form submission
- govukErrorSummary - Validation error display
- govukPanel - Success confirmation
- govukSummaryList - Task details display

## Linting

```bash
yarn lint        # Check for issues
yarn lint:fix    # Auto-fix issues
```

## Configuration

Environment configuration files are in the `config/` directory:
- `default.json` - Default settings
- `dev.json` - Development overrides
- `production.json` - Production overrides
- `test.json` - Test overrides
