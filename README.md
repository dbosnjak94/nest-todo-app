# NestJS Todo App - REST API

## Table of contents

- [General info](#general-info)

- [Technologies](#technologies)

- [Setup](#setup)

- [API Documentation](#api-documentation)

- [Authorization](#authorization)

- [Docker Setup](#docker-setup)

## General info

This project is a REST API built with NestJS that serves as a Todo application. It allows users to create, read, update, and delete tasks, as well as manage categories for those tasks. Task can have different statuses: "TODO", "IN_PROGRESS", "DONE". They can have deadlines. If tasks have deadlines, user can set a reminder on a task which will send user an task reminder email. Tasks with reminders will be archived automatically after 3 days. If task doesn't have a reminder, it will be archived automatically after deadline has expired. The API includes user authentication and authorization features.

## Technologies

Project is created with:

- NestJS

- TypeScript

- TypeORM

- PostgreSQL

- Docker

Libraries

- @nestjs/common: ^10.0.0

- @nestjs/config: ^3.2.3
- @nestjs/core: ^10.0.0

- @nestjs/jwt: ^10.2.0

- @nestjs/passport: ^10.0.3

- @nestjs/platform-express: ^10.0.0
- @nestjs/schedule: ^4.1.1

- @nestjs/swagger: ^7.4.2

- @nestjs/typeorm: ^10.0.2

- bcrypt: ^5.1.1
- class-validator: ^0.14.1
- nodemailer: ^6.9.15
- passport: ^0.7.0
- pg: ^8.13.0
- typeorm: ^0.3.20

Development tools:

- Jest: ^29.5.0

- ESLint: ^8.42.0

- Prettier: ^3.0.0

- TypeScript: ^5.1.3

## Setup

To run this project locally:

1. Clone the repository

2. Install dependencies:

`yarn`

3. Create a `.env` file in the root directory with the following content:

```

DB_TYPE=postgres

DB_HOST=localhost

DB_PORT=5432

DB_USERNAME= <your db username>

DB_PASSWORD= <your db password>

DB_DATABASE= <your database name>

DB_SYNCHRONIZE=true

HOST=localhost

PORT=3000

JWT_SECRET= <your JWT secret>

EMAIL_USER= <needed by nodemailer for sending an reminder email>

EMAIL_PASS= <needed by nodemailer for sending an reminder email>

```

4. Start the development server:

`yarn start:dev`

## API Documentation

API documentation is available via Swagger UI.

After starting the server, visit:

`http://localhost:3000/api`

## Authorization

All protected routes require a valid JWT token. To obtain a token:

1. Register a new user at `/auth/register`

2. Login with the registered user at `/auth/login`

3. Use the returned token in the Authorization header as a Bearer token on Swagger API page

## Testing

To run the tests:

`yarn test`

This will execute the unit tests for the application.

## Completed features

Main requirements

- [x] Secure user account creation with email and password

- [x] Login-protected access to the application

- [x] Task management across different statuses of completion

- [x] Automatic archiving of completed tasks

- [x] Archiving of past due tasks without reminders

- [x] Ability to assign categories to tasks

- [x] Task search functionality by summary, title, or description

- [x] Task filtering by deadline date and user tasks

- [x] Optional deadline setting for tasks

- [x] Ability to add reminder times for tasks with deadlines

- [x] Email notifications for tasks with set reminders

- [x] Automatic archiving of pending tasks three days after the deadline

Tests

- [x] Unit Tests implemented

Bonus Requirements

- [ ] Docker (implemented Dockerfile and docker-compose.yml, not finished)

- [ ] CI/CD
