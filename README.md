# NORA Backend Boilerplate

Node.js and Fastify based. Think of it as a reusable boilerplate for scalable, modular REST API projects powered by Microsoft SQL Server.

## Overview

NORA is a reusable backend boilerplate designed to provide a consistent foundation for building modular, scalable REST APIs.

The project uses a Modular Monolith architecture, with a clear separation of responsibilities between routes, controllers, services, and repositories.

Its primary database engine is Microsoft SQL Server, accessed through a dedicated connection pool and parameterized T-SQL queries.

NORA is designed to serve as the backend layer for frontend applications such as VTAV, keeping database access isolated from the client.

## Technology Stack

| Technology           | Purpose                            |
| -------------------- | ---------------------------------- |
| Node.js LTS          | JavaScript runtime                 |
| Fastify 5            | HTTP server and REST API framework |
| JavaScript + JSDoc   | Application development            |
| pnpm                 | Package management                 |
| Microsoft SQL Server | Relational database                |
| mssql (Tedious)      | SQL Server connectivity            |
| JSON Schema          | Request validation                 |
| Pino                 | Structured logging                 |
| Swagger / OpenAPI    | API documentation                  |
| Node.js Test Runner  | Automated testing                  |

## Requirements

Before getting started, make sure you have installed:

- Node.js LTS
- pnpm
- Git
- Access to a Microsoft SQL Server instance (required for database-related stages)

## Installation

Clone the repository:

```bash
git clone https://github.com/MarcoAntonioSanchez/nora-backend-boilerplate.git
cd nora-backend-boilerplate
```

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Copy the example environment file:

```powershell
Copy-Item .env.example .env
```

Configure the required application, database and authentication variables in `.env` before starting the server.

Never commit `.env` or expose its secrets.

Start the development server:

```bash
pnpm dev
```

The default development server listens on:

```text
http://localhost:3000
```

## Environment Variables

NORA reads its runtime configuration from environment variables.

Copy `.env.example` to `.env` and configure the required values before starting the application.

### Application

| Variable | Default     | Description                                              |
| -------- | ----------- | -------------------------------------------------------- |
| NODE_ENV | development | Application environment: development, production or test |
| HOST     | 0.0.0.0     | Network interface used by the HTTP server                |
| PORT     | 3000        | HTTP server port                                         |

### Microsoft SQL Server

| Variable                    | Default  | Description                                                                                                                   |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| DB_SERVER                   | Required | SQL Server hostname or IP address                                                                                             |
| DB_PORT                     | 1433     | SQL Server TCP port                                                                                                           |
| DB_NAME                     | Required | Database name                                                                                                                 |
| DB_USER                     | Required | Database username                                                                                                             |
| DB_PASSWORD                 | Required | Database password                                                                                                             |
| DB_ENCRYPT                  | true     | Enables encrypted database connections                                                                                        |
| DB_TRUST_SERVER_CERTIFICATE | false    | Allows trusting the SQL Server certificate without validation. Use `true` only in development with a self-signed certificate. |

### Authentication

| Variable           | Default  | Description                           |
| ------------------ | -------- | ------------------------------------- |
| AUTH_USERNAME      | Required | Technical account username            |
| AUTH_PASSWORD_HASH | Required | Argon2id password hash                |
| JWT_SECRET         | Required | Secret used to sign JWT access tokens |
| JWT_EXPIRES_IN     | 15m      | JWT access token expiration time      |

### CORS

| Variable     | Default                              | Description                                      |
| ------------ | ------------------------------------ | ------------------------------------------------ |
| CORS_ORIGINS | http://localhost:4321 in development | Comma-separated list of allowed frontend origins |

The application validates these values during startup and rejects invalid configurations.

Production requirements:

- `CORS_ORIGINS` must contain explicitly configured HTTPS origins.
- `DB_ENCRYPT` must be `true`.
- `DB_TRUST_SERVER_CERTIFICATE` must be `false`.
- Application credentials and secrets must never be committed to the repository.

## Available Scripts

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Starts the server in development mode with Node.js watch |
| `pnpm start`        | Starts the server                                        |
| `pnpm lint`         | Checks JavaScript code with ESLint                       |
| `pnpm lint:fix`     | Automatically fixes supported ESLint issues              |
| `pnpm format`       | Formats project files with Prettier                      |
| `pnpm format:check` | Checks formatting without modifying files                |
| `pnpm test`         | Runs the automated test suite with Node.js Test Runner   |

## API Documentation

NORA provides interactive API documentation through Swagger UI.

When the development server is running, access:

| Resource     | URL                                      |
| ------------ | ---------------------------------------- |
| Swagger UI   | http://localhost:3000/documentation      |
| OpenAPI JSON | http://localhost:3000/documentation/json |

Swagger UI and the OpenAPI JSON endpoint are disabled in production.

The API currently exposes the following endpoints:

| Method | Endpoint      | Authentication | Description                                          |
| ------ | ------------- | -------------- | ---------------------------------------------------- |
| GET    | `/health`     | Public         | Checks application and database availability         |
| POST   | `/auth/login` | Public         | Authenticates the technical account and issues a JWT |
| POST   | `/users`      | Bearer JWT     | Creates a user record                                |

## Architecture

NORA follows a Modular Monolith architecture.

The intended request flow is:

```text
HTTP Request
    |
    v
Routes
    |
    v
Controllers
    |
    v
Services
    |
    v
Repositories
    |
    v
Microsoft SQL Server
```

Each layer has a specific responsibility:

- **Routes:** Define HTTP endpoints and request schemas.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Implement application and business logic.
- **Repositories:** Encapsulate database operations and SQL queries.

The application entry point is separated from the HTTP server startup:

- `src/app.js` creates and configures the Fastify application.
- `src/server.js` starts the HTTP listener.
- `src/config/` contains application configuration.

This separation allows the application to be tested independently from the server lifecycle.

## Development Roadmap

NORA development is organized into seven incremental stages.

Each completed stage receives its own patch release, preserving the project's implementation history.

| Stage | Name             | Version | Scope                                                                                                            |
| ----- | ---------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| 01    | Foundation       | v0.0.1  | Project initialization, Fastify, environment configuration, application structure, ESLint and Prettier           |
| 02    | Database         | v0.0.2  | SQL Server connectivity, connection pool, database configuration, error handling and database health checks      |
| 03    | API Architecture | v0.0.3  | Modular structure, routes, controllers, services, repositories, schemas and centralized error handling           |
| 04    | Authentication   | v0.0.4  | Technical user authentication, credentials management, JWT and protected endpoints                               |
| 05    | Security         | v0.0.5  | CORS, rate limiting, secure SQL queries, HTTPS deployment considerations and database permissions                |
| 06    | Integration      | v0.0.6  | SQL Server integration, user creation endpoint, API testing, least-privilege permissions and database validation |
| 07    | Release          | v0.0.7  | Automated tests, documentation, Swagger/OpenAPI, Windows Server deployment and Cloudflare Tunnel                 |

### Versioning Strategy

- Each completed roadmap stage produces one patch release.
- Every stage must be validated before moving to the next.
- Git tags are preserved as immutable historical references.
- The first functional release, ready to receive requests from VTAV, will be `v0.1.0`.

## Authentication Strategy

The initial authentication model uses a technical user intended for controlled application integrations and demonstrations.

NORA will validate credentials and issue JWT access tokens. Protected endpoints will require a valid token.

The architecture will remain prepared for future individual user authentication.

Client applications must not expose permanent credentials or secrets in browser-side JavaScript.

## Security and Infrastructure

The initial production environment is designed around Windows Server.

### Infrastructure

- Node.js runs natively on Windows Server.
- Microsoft SQL Server remains isolated from public Internet access.
- NORA is the application layer responsible for database communication.
- Cloudflare Tunnel provides the external publication path for the API.
- HTTPS is used for external communication.
- Database credentials and application secrets remain outside the repository.

### Application Security

- CORS allows only explicitly configured frontend origins.
- Production CORS origins must use HTTPS.
- CORS does not provide authentication or prevent direct HTTP requests from external tools.
- Global rate limiting restricts clients to 100 requests per 15-minute window.
- Authentication endpoints restrict login attempts to 5 requests per 15-minute window.
- JWT protects endpoints that require authentication.
- Argon2id is used for password verification.
- Request validation uses Fastify JSON Schema.

### Database Security

- SQL Server connections use encrypted communication.
- Production requires certificate validation.
- Production database connections must use `DB_ENCRYPT=true` and `DB_TRUST_SERVER_CERTIFICATE=false`.
- SQL operations must use parameterized queries.
- Database accounts must follow the principle of least privilege.
- SQL Server must not be exposed directly to the public Internet.

### Reverse Proxy Considerations

When deploying behind Cloudflare Tunnel, Fastify proxy trust settings must be explicitly configured according to the trusted proxy connection.

Unrestricted proxy trust must not be enabled because client IP identification affects rate limiting and request metadata.

The production proxy configuration will be finalized during deployment.

## Project Status

**Current milestone:** Stage 07 - Release

**Target version:** `v0.0.7`

**Functional release:** `v0.1.0`

Completed milestones:

- Stage 01 - Foundation (`v0.0.1`)
- Stage 02 - Database (`v0.0.2`)
- Stage 03 - API Architecture (`v0.0.3`)
- Stage 04 - Authentication (`v0.0.4`)
- Stage 05 - Security (`v0.0.5`)
- Stage 06 - Integration (`v0.0.6`)

Current implementation:

- Modular Monolith architecture using Fastify.
- Microsoft SQL Server connection pool.
- Technical account authentication using Argon2id.
- JWT access token generation and verification.
- Protected user creation endpoint with SQL Server persistence.
- Duplicate email detection and conflict handling.
- Explicit CORS origin configuration.
- Global and authentication-specific rate limiting.
- Production database TLS enforcement.
- SQL Server least-privilege permissions.
- Centralized HTTP error handling.
- OpenAPI 3.0.3 documentation and Swagger UI.
- Documented request and response schemas for all implemented endpoints.
- Automated test suite covering configuration, authentication, users, CORS and rate limiting.

Pending release work:

- Complete README and deployment documentation.
- Prepare and validate Windows Server deployment.
- Configure Cloudflare Tunnel.
- Finalize trusted proxy configuration.
- Perform production environment validation.
- Complete release checks before publishing `v0.0.7` and preparing `v0.1.0`.
