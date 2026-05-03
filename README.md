# Nest.js Knowledge Hub API

This project is a REST API built with **NestJS** as part of the RS School Node.js assignment.
---

## AI Integration & Setup

This project uses the **Gemini 3.1 Flash Lite Preview** model for high-speed, cost-effective content generation.
Th list of models you can se for example here [Gemini API Rate Limit](https://aistudio.google.com/rate-limit?timeRange=last-28-days).

### 1. Obtain a Gemini API Key
To use the AI features, you must have a valid API key from Google:
1.  Visit the [Google AI Studio](https://aistudio.google.com/).
2.  Sign in with your Google Account.
3.  Click on **"Get API key"** in the top left sidebar.
4.  Click **"Create API key in new project"**.
5.  Copy your unique key.

### 2. Environment Configuration
After cloning the repository, you need to set up your environment variables:

1.  Locate the `.env.example` file in the root directory.
2.  Duplicate it and rename the copy to `.env`.
3.  Open the `.env` file and locate the `GEMINI_API_KEY` field.
4.  Paste your key there:
    ```env
    # .env file
    GEMINI_API_KEY=your_copied_api_key_here
    GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta/models
    GEMINI_MODEL=gemini-3.1-flash-lite-preview
    AI_RATE_LIMIT_RPM=15
    AI_CACHE_TTL_SEC=300
    ```

**Testing the AI Endpoints:**
You can test the implementation using the built-in Swagger UI at `http://localhost:3000/api` (or your configured port). Look for the following routes:
*   `POST /ai/articles/:articleId/analyze`: Generates quality checks and suggestions.
*   `POST /ai/articles/:articleId/summarize`: Returns a deterministic, cached summary.
*   `POST /ai/articles/:articleId/translate`: Translate context *sourceLanguage* (for example **English**) to *targetLanguage* (for example **Russian**)
*   `POST /ai/generate`: Free-form generation for general prompts.

## Core AI Architecture & Performance

This project features a robust AI processing pipeline designed for reliability and observability.

### 1. Rate Limiting (`ThrottlerGuard`)
To protect against API abuse and stay within Gemini's free-tier limits, we use a custom `AiThrottlerGuard`.
*   **Configuration:** You can adjust the limit by changing `AI_RATE_LIMIT_RPM` (Requests Per Minute) in your `.env` file.
*   **Behavior:** When the limit is reached, the API returns a `429 Too Many Requests` status and a `Retry-After` header indicating how many seconds to wait.

### 2. Response Caching (`AiCacheService`)
To minimize costs and latency, article-related responses (Summarize/Translate) are cached.
*   **Deterministic Keys:** Cache keys are generated based on the `articleId` and request parameters.
*   **TTL Control:** The cache duration is controlled via `AI_CACHE_TTL_SEC` in the `.env` file (default is 300 seconds).

### 3. Usage Tracking & Metrics (`AiMetricsService`)
All AI interactions, including token usage and endpoint hits, are tracked internally.
*   **How to test:**
  1.  Perform 2 or more AI requests (e.g., `POST /ai/articles/:articleId/summarize`).
  2.  Call the metrics endpoint: `GET http://localhost:4000/ai/usage`.
  3.  You will receive a JSON breakdown of total requests and token consumption per endpoint.

### 4. Error Handling & Resilience
*   **Graceful Recovery:** All Gemini API errors (network timeouts, safety blocks, or service interruptions) are handled gracefully using RxJS `catchError` logic within `gemini.service.ts`.
*   **Exponential Backoff:** The system is configured to retry failed requests 3 times, doubling the wait time between each attempt ($1s \to 2s \to 4s$).

### 5. AI Observability & Diagnostics

To monitor performance and cost-efficiency, the project includes built-in observability tools:

#### 1. Real-Time Latency Tracking (`AiLoggingInterceptor`)
Every request made to the AI controller is intercepted to measure execution time.
*   **What to look for:** Check your terminal/console after an AI request. You will see a log entry:  
    `[AI Diagnostics] POST /ai/summarize/1 took 1250ms`
*   **Why it matters:** This helps you distinguish between a slow AI response from Google and internal processing overhead.

#### 2. Cache Performance & Metrics (`AiMetricsService`)
We track how effectively the `AiCacheService` is reducing our API dependency through a **Cache Hit Ratio**.
*   **Tracked Endpoints:** Specifically monitors the `summarize` and `analyze` routes.
*   **Calculation:** `(Total Cache Hits / Total Cacheable Requests) * 100`.

  How to Test Diagnostics
To verify that caching and metrics are working correctly:
1.  **Step 1:** Perform a `POST` request to `http://localhost:4000/ai/summarize/1`. (Console should show ~1-2s latency).
2.  **Step 2:** Perform the **same request 3 more times**. (Console should show <10ms latency).
3.  **Step 3:** Open your browser or Postman and call:
    `GET http://localhost:4000/ai/usage`
4.  **The Result:** You will see a JSON response showing the total number of cached hits and a high `cacheHitRatio`, proving the efficiency of the implementation.

### 6. Structured AI output validation
Data Integrity & Output Validation
One of the biggest challenges with AI is "hallucination" or malformed JSON. To solve this, we implemented the AiValidationService.

---

## How to Run and Test

Follow these steps to get the environment running with the AI integration features:

### 1. Clone and Prepare the Branch
```bash
# Clone the repository
$ git clone <your-repo-url>
$ cd <your-repo-name>

# Switch to the AI integration branch
$ git checkout AI-integration
```

### 2. Environment Setup
1.  Create your `.env` file from the example: `cp .env.example .env`.
2.  Paste your **Gemini API Key** into the `GEMINI_API_KEY` variable.
3.  Ensure `AI_RATE_LIMIT_RPM` and `AI_CACHE_TTL_SEC` are set to your preference.

### 3. Start Infrastructure & Database
This project uses Docker for the database and Prisma for ORM.
```bash
# Start Docker containers (Database, Redis, etc.)
$ docker-compose up --build -d

# Generate Prisma Client
$ npx prisma generate

# Run database migrations
$ npx prisma migrate dev

# Seed the database with initial data (Articles, Users)
$ npx prisma db seed
```

### 4. Launch the Application
```bash
$ npm run start:dev
```

### 5. Testing with Postman
Once the server is running at `http://localhost:4000`:

*   **Metric Tracking:**
  *   Make 2 or more POST requests to any AI endpoint (Summarize, Analyze, or Translate).
  *   Send a `GET` request to `http://localhost:4000/ai/usage` to verify that `AiMetricsService` is correctly logging token usage and hits.
*   **Response Caching:**
  *   Send a `POST` request to `http://localhost:4000/articles/:articleId/summarize`.
  *   Repeat the same request immediately. The second response should be near-instant, served by `AiCacheService`.
*   **Rate Limiting:**
  *   Rapidly send requests to exceed the `AI_RATE_LIMIT_RPM` value.
  *   The API should return a `429 Too Many Requests` response via the `ThrottlerGuard`.
*   **Error Resilience:**
  *   Check `gemini.service.ts` to see how `catchError` and `retry` handle potential API failures gracefully.

---

### Known Limitations & Constraints
As this project currently utilizes the **Free Tier** of the Gemini API, please be aware of the following:

*   **Rate Limits:** The `gemini-3.1-flash-lite-preview` model has a strict quota (typically 15 Requests Per Minute). Exceeding this will trigger a `429 Too Many Requests` error with a `Retry-After` header.
*   **Latency:** Response times may vary based on server load. Large articles may take 2–5 seconds to process.
*   **Regional Availability:** Google AI Studio services are not available in all countries. If you are in a restricted region, the API calls will fail.
*   **Data Usage:** In the Free Tier, Google may use your inputs and outputs to improve their models. Do not process sensitive or PII (Personally Identifiable Information) data.

---

## Docker Setup

This application is fully containerized using Docker and Docker Compose, making it easy to run in any environment.

## Docker Image

The application image is available on Docker Hub:

https://hub.docker.com/r/dariechka/nodejs-2026q1-knowledge-hub-app

You can pull and run it directly:

```bash
docker pull dariechka/nodejs-2026q1-knowledge-hub-app:latest
docker run -p 4000:4000 dariechka/nodejs-2026q1-knowledge-hub-app:latest
```

## Dockerfile

The `Dockerfile` defines how the application image is built.

### Key features:

* Uses a **multi-stage build**:

  * **Builder stage** – installs dependencies and builds the application
  * **Production stage** – includes only compiled code and production dependencies
* Based on a lightweight image (`node:24-alpine`)
* Sets environment variables:

  * `NODE_ENV=production`
  * `PORT=4000`
* Runs the app as a **non-root user (`node`)** for better security
* Exposes port `4000`


## .dockerignore

The `.dockerignore` file prevents unnecessary files from being included in the Docker image.

### Typical ignored files:

* `node_modules`
* `dist` (if rebuilt inside container)
* `.git`
* logs and temporary files

This helps:

* Reduce image size
* Speed up builds
* Improve security


## Docker Compose

The `docker-compose.yml` file defines and runs the full application stack.

### Services

#### app (NestJS API)

* Built from the local `Dockerfile`
* Runs on port `4000`
* Uses environment variables from `.env`
* Depends on the database service
* Includes a health check
* Restart policy: `on-failure`

---

#### db (PostgreSQL)

* Uses `postgres:16-alpine`
* Configured via environment variables:

  * `POSTGRES_USER`
  * `POSTGRES_PASSWORD`
  * `POSTGRES_DB`
* Exposes port `5432`
* Stores data in a **named volume**
* Restart policy: `unless-stopped`
* Includes a health check using `pg_isready`

#### adminer

* Lightweight database UI
* Available only in **debug profile**
* Runs on port `8080`

## ▶️ Running the Application

```bash
docker-compose up --build
```

### Run with Adminer (debug mode):

```bash
docker compose --profile debug up
```

## Access

* API: http://localhost:4000
* Adminer (debug): http://localhost:8080

---

## Security

* Application runs as a **non-root user**
* Uses minimal base image for reduced attack surface

---


## Features

* RESTful API with proper HTTP methods and status codes
* CRUD operations for:

    * Users
    * Articles
    * Categories
    * Comments
* Request validation using `class-validator`
* UUID-based entities
* Swagger (OpenAPI) documentation
* Filtering (articles & comments)
* Entity relationships:

    * User → Articles / Comments
    * Article → Comments
    * Category → Articles
* Cascade behavior:

    * Deleting user → removes comments & unlinks articles
    * Deleting article → removes comments
    * Deleting category → unlinks articles
* Comprehensive e2e tests + additional custom tests

---

## Tech Stack

* **Node.js**
* **NestJS**
* **TypeScript**
* **Jest** (testing)
* **Swagger** (`@nestjs/swagger`)
* **class-validator**

---

## Installation

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

---

## Running the App

```bash
# development
npm run start:dev

# production build
npm run build
npm run start:prod
```

---

## API Documentation

Swagger documentation is available at:

```
http://localhost:4000/doc
```

It provides:

* Endpoint descriptions
* Request/response schemas
* Ability to test endpoints directly

---

## Testing

Run all tests:

```bash
npm run test
```

My personal preferring:

```bash
jest --testMatch "<rootDir>/(articles|comments|categories|users|my-user-tests|my-article-tests|my-category-tests|my-comment-tests).e2e.spec.ts" --noStackTrace --runInBand
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

---

## API Overview

### Users

* `POST /user` – create user
* `GET /user` – get all users
* `GET /user/:id` – get user by ID
* `PUT /user/:id` – update password
* `DELETE /user/:id` – delete user

---

### Articles

* `POST /article` – create article
* `GET /article` – get all articles
* `GET /article?status=published&tag=nodejs` - get all articles with filters
* `GET /article/:id` – get article by ID
* `PUT /article/:id` – update article
* `DELETE /article/:id` – delete article

---

### Categories

* `POST /category` – create category
* `GET /category` – get all categories
* `GET /category/:id` – get category by ID
* `PUT /category/:id` – update category
* `DELETE /category/:id` – delete category

---

### Comments

* `POST /comment` – create comment
* `GET /comment={articleId}` – get comments by articleId
* `GET /comment/:id` – get comment by ID
* `DELETE /comment/:id` – delete comment

---

## Relationships & Behavior

* **User deletion**

    * `article.authorId → null`
    * user comments → deleted

* **Article deletion**

    * all related comments → deleted

* **Category deletion**

    * `article.categoryId → null`

---

## Notes

* All IDs are UUID v4
* Returns **200 OK** on successful request
* Returns **201 Created** when a resource is successfully created
* Returns **204 No Content** when a resource is successfully deleted
* Validation errors return **400 Bad Request**
* Non-existing resources return **404 Not Found**
* Returns **403 Forbidden** if the old password is incorrect
* Business logic violations return **422 Unprocessable Entity**

---
