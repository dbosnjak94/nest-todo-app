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

NPM libraries used in the project:

- @nestjs/common

- @nestjs/core

- @nestjs/platform-express

- @nestjs/typeorm

- typeorm

- @nestjs/jwt

- @nestjs/passport

- bcrypt

- class-validator

- class-transformer

- pg

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
