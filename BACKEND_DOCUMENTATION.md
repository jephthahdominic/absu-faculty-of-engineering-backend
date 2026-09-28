# ABSU Faculty Management Backend Documentation

**Repository:** `jephthahdominic/absu-faculty-of-engineering-backend`  
**Purpose:** REST API for managing Abia State University Faculty of Engineering data and administration.

> This document is a print-ready documentation source. Open it on GitHub and use **Print → Save as PDF** to create the PDF version.

## 1. Overview

The backend is a TypeScript/Node.js REST API built with Express and MongoDB through Mongoose. It provides authentication, role-based authorization, department-scoped access, CRUD operations, file uploads, dashboard statistics, email-based password recovery, API documentation, validation, logging, and pagination.

The main user roles are:

- `super_admin`
- `dean`
- `department_admin`
- `lecturer`
- `student`

The application is started by `src/server.ts`, which connects to MongoDB, starts the HTTP server, exposes the Express application from `src/app.ts`, and performs graceful shutdown on `SIGTERM` and `SIGINT`.

## 2. Technology stack

- **Language:** TypeScript
- **Runtime:** Node.js
- **Web framework:** Express 4
- **Database:** MongoDB with Mongoose 8
- **Authentication:** JWT access and refresh tokens
- **Password security:** bcryptjs
- **Validation:** express-validator
- **Uploads/storage:** Multer and Cloudflare R2 integration
- **Documentation:** Swagger UI and swagger-jsdoc
- **Security:** Helmet, CORS, compression, and express-rate-limit
- **Logging:** Winston and Morgan
- **Email:** Nodemailer

## 3. Repository structure

```text
src/
├── app.ts                 Express middleware, health check, docs, routes, errors
├── server.ts              HTTP server startup and graceful shutdown
├── config/                Environment, database, and Swagger configuration
├── constants/             Roles, HTTP status codes, and application messages
├── controllers/           HTTP request handlers
├── interfaces/            TypeScript domain and response contracts
├── middlewares/           Authentication, authorization, validation, uploads, errors
├── models/                Mongoose schemas and database models
├── repositories/          Data-access abstractions and query operations
├── routes/                Endpoint definitions and route composition
├── seeders/               Initial data seeding
├── services/              Business logic, email, storage, and domain services
├── types/                 Express request type augmentation
├── utils/                  Tokens, pagination, logging, sanitization, and responses
└── validators/             Request validation rules
```

Additional repository files:

- `.env.example`: environment variable template.
- `package.json`: scripts and dependencies.
- `tsconfig.json`: strict TypeScript compiler configuration and path aliases.
- `FRONTEND_INTEGRATION_GUIDE.md`: frontend API integration reference.
- `CLAUDE_WIRING_PROMPT.md`: frontend wiring instructions.
- `postman/`: API testing resources.
- `logs/`: runtime log output.

## 4. Application flow

1. `src/server.ts` loads the environment configuration.
2. MongoDB connection is established through `config/database.ts`.
3. Express is created and configured in `src/app.ts`.
4. Security, CORS, compression, request logging, JSON parsing, and rate limiting are applied.
5. Requests under the configured API prefix (normally `/api`) are delegated to `routes/index.ts`.
6. Routes apply authentication, role authorization, department access checks, validation, and upload middleware as required.
7. Controllers call services and repositories.
8. Services use Mongoose models and external integrations such as email and object storage.
9. Responses use shared response and pagination utilities.
10. Unknown routes and application errors are handled centrally.

## 5. Configuration

Copy `.env.example` to `.env` and provide real values. Important settings include:

- `NODE_ENV`, `PORT`, and `API_PREFIX`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and token expiration values
- Password-reset secret and expiration
- SMTP connection and sender settings
- Cloudflare R2 credentials, bucket, and public URL
- `ALLOWED_ORIGINS`
- Rate-limit window and maximum requests
- Default super-admin credentials for seeding

Secrets must never be committed to the repository or included in the PDF.

## 6. HTTP application features

`src/app.ts` configures:

- Helmet security headers and content-security policy.
- CORS with an allowlist from `ALLOWED_ORIGINS`.
- Gzip-style compression.
- Morgan request logging through Winston.
- JSON and URL-encoded request bodies with a 10 MB limit.
- Global rate limiting.
- `GET /health` health check.
- Swagger UI at `/api/docs`.
- OpenAPI JSON at `/api/docs.json`.
- Central 404 and error handling.

## 7. API modules

The route modules are:

- `auth.routes.ts`: login, refresh, logout, password change, and password recovery.
- `dashboard.routes.ts`: role-aware dashboard statistics.
- `department.routes.ts`: department listing and super-admin CRUD.
- `user.routes.ts`: profile and administrative user CRUD.
- `student.routes.ts`: student operations.
- `lecturer.routes.ts`: lecturer listing, management, verification, and profile images.
- `publication.routes.ts`: academic publication CRUD.
- `lectureNote.routes.ts`: lecture-note listing, upload, update, and deletion.
- `news.routes.ts`: news listing, details, publishing, and media management.
- `event.routes.ts`: event listing, details, publishing, and media management.
- `academicSession.routes.ts`: academic-session operations.

The route modules are mounted by `src/routes/index.ts` beneath the configured API prefix.

## 8. Authentication and authorization

Authentication uses JWT access and refresh tokens. Passwords are hashed with bcrypt before persistence. The authentication middleware reads the bearer token, verifies it, and attaches the authenticated user to the Express request.

Authorization is implemented through:

- `authenticate.middleware.ts`: requires a valid access token.
- `optionalAuthenticate.middleware.ts`: attaches a user when a token is supplied but permits anonymous access.
- `authorize.middleware.ts`: restricts routes to specific roles.
- `departmentAccess.middleware.ts`: applies department-level restrictions.
- `requireVerifiedLecturer.middleware.ts`: restricts operations to verified lecturers.

The API uses role-aware and department-aware access rather than relying only on client-side checks.

## 9. Data models

The principal Mongoose models are:

- `User`: administrative users and role assignments.
- `Student`: student identity, matriculation number, level, department, and account status.
- `Lecturer`: staff identity, designation, department, verification, and profile details.
- `Department`: faculty department metadata.
- `AcademicSession`: academic session records.
- `LectureNote`: course material metadata and uploaded file information.
- `Publication`: research publication metadata, authors, lecturer, and department.
- `News`: news content, category, publication state, slug, department, and image.
- `Event`: event content, venue, date, publication state, department, and image.
- `Token`: refresh-token/session persistence.

Common relationships include:

```text
Student.departmentId       → Department._id
Lecturer.departmentId      → Department._id
User.departmentId          → Department._id
Lecturer.verifiedBy        → User._id
Publication.lecturerId     → Lecturer._id
LectureNote.lecturerId     → Lecturer._id
News.departmentId          → Department._id
Event.departmentId         → Department._id
```

Timestamps are enabled on the main content and user schemas. Sensitive passwords are excluded from JSON responses.

## 10. Services and repositories

Services contain business rules and coordinate persistence or integrations. Important services include authentication, dashboard statistics, departments, users, students, lecturers, publications, lecture notes, news, events, academic sessions, email, and R2 storage.

Repositories provide reusable database access. The repository layer includes a base repository plus domain repositories for users, students, lecturers, departments, tokens, academic sessions, lecture notes, publications, news, and events.

## 11. Validation and error handling

Validators use `express-validator` and cover authentication, users, students, lecturers, departments, academic sessions, lecture notes, publications, news, and events. `validate.middleware.ts` converts validation failures into the API error format.

API errors expose a message, HTTP status, and optional field-level errors. `errorHandler.middleware.ts` handles known application errors, validation errors, Mongoose errors, and unexpected failures consistently.

## 12. File uploads and external services

`upload.middleware.ts` handles multipart form data and file constraints. Uploaded profile images, news images, event images, and lecture-note documents are processed by the storage service. `r2.service.ts` integrates with Cloudflare R2 and returns public file URLs.

Nodemailer is used for email delivery, including password-reset messages and other account-related notifications.

## 13. Utility modules

- `asyncHandler.util.ts`: wraps asynchronous controllers.
- `arrayField.util.ts`: normalizes array-like request fields.
- `logger.util.ts`: Winston logger and rotating log files.
- `objectId.util.ts`: MongoDB ObjectId validation.
- `pagination.util.ts`: page, limit, and pagination metadata.
- `password.util.ts`: password generation and hashing helpers.
- `response.util.ts`: consistent success responses.
- `sanitize.util.ts`: HTML/content sanitization.
- `slug.util.ts`: URL slug generation.
- `token.util.ts`: JWT creation and verification.

## 14. Development commands

```bash
npm install
npm run dev
npm run build
npm start
npm run seed
npm run lint
```

The default development configuration uses port `8080` and API prefix `/api`, so the main endpoints are available under `http://localhost:8080/api`. Swagger UI is available at `http://localhost:8080/api/docs` when the server is running.

A local MongoDB instance or another MongoDB connection is required. SMTP and Cloudflare R2 settings are required for email and file-storage features.

## 15. Security considerations

- Replace all example secrets before deployment.
- Use HTTPS in production.
- Restrict `ALLOWED_ORIGINS` to trusted frontend origins.
- Keep access-token and refresh-token secrets separate.
- Do not expose password fields in responses or logs.
- Keep R2 and SMTP credentials outside source control.
- Review rate limits and upload limits for the deployment environment.
- Use the role and department middleware on every protected management route.

## 16. Related documentation

- [Frontend Integration Guide](./FRONTEND_INTEGRATION_GUIDE.md)
- [Claude Wiring Prompt](./CLAUDE_WIRING_PROMPT.md)
- [Swagger UI](http://localhost:8080/api/docs) when running locally

## 17. PDF export

To produce the requested PDF:

1. Open this file on GitHub.
2. Select the browser print command (`Ctrl+P` or `Cmd+P`).
3. Choose **Save as PDF**.
4. Enable background graphics if desired and save as `absu-faculty-of-engineering-backend-documentation.pdf`.
