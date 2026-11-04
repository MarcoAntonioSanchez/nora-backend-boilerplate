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

| Variable | Default     | Description                                              |
| -------- | ----------- | -------------------------------------------------------- |
| NODE_ENV | development | Application environment: development, production or test |
| HOST     | 0.0.0.0     | Network interface used by the HTTP server                |
| PORT     | 3000        | HTTP server port                                         |

The application validates these values during startup and rejects invalid configurations.

## Available Scripts

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `pnpm dev`          | Starts the server in development mode with Node.js watch |
| `pnpm start`        | Starts the server                                        |
| `pnpm lint`         | Checks JavaScript code with ESLint                       |
| `pnpm lint:fix`     | Automatically fixes supported ESLint issues              |
| `pnpm format`       | Formats project files with Prettier                      |
| `pnpm format:check` | Checks formatting without modifying files                |

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

| Stage | Name             | Version | Scope                                                                                                       |
| ----- | ---------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| 01    | Foundation       | v0.0.1  | Project initialization, Fastify, environment configuration, application structure, ESLint and Prettier      |
| 02    | Database         | v0.0.2  | SQL Server connectivity, connection pool, database configuration, error handling and database health checks |
| 03    | API Architecture | v0.0.3  | Modular structure, routes, controllers, services, repositories, schemas and centralized error handling      |
| 04    | Authentication   | v0.0.4  | Technical user authentication, credentials management, JWT and protected endpoints                          |
| 05    | Security         | v0.0.5  | CORS, rate limiting, secure SQL queries, HTTPS deployment considerations and database permissions           |
| 06    | Integration      | v0.0.6  | Demonstration CRUD endpoints, API testing, VTAV integration and local/remote database validation            |
| 07    | Release          | v0.0.7  | Automated tests, documentation, Swagger/OpenAPI, Windows Server deployment and Cloudflare Tunnel            |

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

Key infrastructure principles:

- Node.js runs natively on Windows Server.
- Microsoft SQL Server remains isolated from public Internet access.
- NORA is the application layer responsible for database communication.
- Cloudflare Tunnel provides the external publication path for the API.
- HTTPS is used for external communication.
- Database credentials and application secrets remain outside the repository.
- SQL operations use parameterized queries.
- Database accounts follow the principle of least privilege.
- CORS and rate limiting provide additional application-level protections.

CORS is not an authentication mechanism and does not prevent direct HTTP requests from tools or other servers.

## Project Status

**Current milestone:** Stage 01 - Foundation

**Target version:** `v0.0.1`

The initial foundation includes:

- Node.js and pnpm project configuration.
- Fastify 5 application initialization.
- Environment variable validation.
- Separate application and server entry points.
- ESLint and Prettier configuration.
- Reproducible dependency installation.

Database connectivity, API modules, authentication, security hardening, integration and production deployment will be implemented in their respective roadmap stages.

## License

This project is licensed under the ISC License.
Copyright (c) 2026 Marco Antonio Sánchez Pérez (Raven D. Milosh)
