<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
  <a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
<!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
[![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with comprehensive backend infrastructure including MongoDB integration, health monitoring, security middleware, and environment configuration.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** / **pnpm**
- **MongoDB** (v6.0 or higher) - [Installation Guide](#mongodb-installation)

## MongoDB Installation

### Option 1: Local Installation

#### macOS

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Windows

Download and install MongoDB Community Server from the [official website](https://www.mongodb.com/try/download/community).

#### Linux (Ubuntu/Debian)

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create a list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update packages and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### Option 2: Docker (Recommended for Development)

```bash
# Run MongoDB in a Docker container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Stop MongoDB
docker stop mongodb

# Remove MongoDB container
docker rm mongodb
```

### Option 3: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string from the Atlas dashboard
4. Update `MONGO_URI` in your `.env` file

## Environment Configuration

The application uses environment variables for configuration. Follow these steps to set up your environment:

### 1. Copy the environment template

```bash
cp .env.example .env
```

### 2. Configure environment variables

Edit the `.env` file with your actual values:

```bash
# Application Environment
NODE_ENV=development

# Server Port
PORT=5000

# MongoDB Connection URI
# Local: mongodb://localhost:27017/authboiler
# Atlas: mongodb+srv://username:password@cluster.mongodb.net/database
MONGO_URI=mongodb://localhost:27017/authboiler

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Rate Limiting Configuration
THROTTLE_TTL=60
THROTTLE_LIMIT=60
```

### Environment Variables Reference

| Variable         | Type   | Default                 | Description                                             |
| ---------------- | ------ | ----------------------- | ------------------------------------------------------- |
| `NODE_ENV`       | string | `development`           | Application environment (development, production, test) |
| `PORT`           | number | `3000`                  | Server port number                                      |
| `MONGO_URI`      | string | -                       | MongoDB connection URI (required)                       |
| `CLIENT_URL`     | string | `http://localhost:3000` | Frontend URL for CORS                                   |
| `THROTTLE_TTL`   | number | `60`                    | Rate limiting time window in seconds                    |
| `THROTTLE_LIMIT` | number | `60`                    | Maximum requests per time window                        |

## Project Setup

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Health Endpoint

The application provides a health check endpoint at `/health` for monitoring.

### GET /health

Returns the current health status of the application.

**Response Example (Healthy):**

```json
{
  "status": 200,
  "status": "healthy",
  "timestamp": "2024-01-16T10:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "responseTime": 5
  },
  "memory": {
    "used": 100,
    "total": 500,
    "percentage": 20,
    "unit": "MB"
  },
  "environment": "development"
}
```

**Response Example (Unhealthy):**

```json
{
  "status": 503,
  "status": "unhealthy",
  "timestamp": "2024-01-16T10:00:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "disconnected"
  },
  "memory": {
    "used": 100,
    "total": 500,
    "percentage": 20,
    "unit": "MB"
  },
  "environment": "development"
}
```

### Health Response Fields

| Field                   | Type   | Description                                                       |
| ----------------------- | ------ | ----------------------------------------------------------------- |
| `status`                | number | HTTP status code (200 for healthy, 503 for unhealthy)             |
| `status`                | string | Health status ("healthy" or "unhealthy")                          |
| `timestamp`             | string | ISO 8601 timestamp of the health check                            |
| `uptime`                | number | Application uptime in seconds                                     |
| `database.status`       | string | Database connection status ("connected", "disconnected", "error") |
| `database.responseTime` | number | Database response time in milliseconds (only when connected)      |
| `memory.used`           | number | Used heap memory in MB                                            |
| `memory.total`          | number | Total heap memory in MB                                           |
| `memory.percentage`     | number | Memory usage percentage                                           |
| `memory.unit`           | string | Memory unit (always "MB")                                         |
| `environment`           | string | Current environment (development, production, test)               |

## API Endpoints

### Health Endpoints

| Method | Endpoint  | Description                   |
| ------ | --------- | ----------------------------- |
| GET    | `/health` | Get application health status |

### Root Endpoint

| Method | Endpoint | Description                              |
| ------ | -------- | ---------------------------------------- |
| GET    | `/`      | Default endpoint (returns "Hello World") |

## Security Features

The application includes several security features:

### 1. CORS (Cross-Origin Resource Sharing)

Configured to allow requests only from the specified `CLIENT_URL`.

### 2. Rate Limiting

Protects against brute force attacks by limiting the number of requests:

- Default: 60 requests per 60 seconds per IP
- Configurable via `THROTTLE_TTL` and `THROTTLE_LIMIT` environment variables

### 3. Helmet Security Headers

Adds security HTTP headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-DNS-Prefetch-Control: off`
- And more...

### 4. Global Validation Pipe

Validates all incoming DTOs:

- Strips unknown properties (`whitelist: true`)
- Throws error on unknown properties (`forbidNonWhitelisted: true`)
- Transforms payloads to DTO instances (`transform: true`)

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Code Quality

The project includes automated code quality tools:

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run build
```

## Troubleshooting

### MongoDB Connection Errors

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**

1. Ensure MongoDB is running:

   ```bash
   # Check if MongoDB is running
   mongod --version

   # Start MongoDB if not running
   # macOS with Homebrew
   brew services start mongodb-community

   # Docker
   docker start mongodb
   ```

2. Verify `MONGO_URI` in `.env` file is correct

3. Check if MongoDB is listening on the correct port (default: 27017)

### Environment Variable Errors

**Error:** `Validation failed` or `Missing required environment variable`

**Solutions:**

1. Ensure `.env` file exists in the backend directory
2. Copy `.env.example` to `.env` if missing
3. Verify all required variables are set in `.env`
4. Restart the application after changing `.env`

### Rate Limiting Errors

**Error:** `Too Many Requests` (HTTP 429)

**Solutions:**

1. Wait for the rate limit window to expire (default: 60 seconds)
2. Increase `THROTTLE_LIMIT` in `.env` for development
3. Increase `THROTTLE_TTL` to extend the time window

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solutions:**

1. Change the `PORT` in `.env` file
2. Kill the process using the port:

   ```bash
   # Find process using port 5000
   lsof -i :5000

   # Kill the process (replace PID with actual process ID)
   kill -9 PID
   ```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
npm install -g @nestjs/mau
mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
