# Nest.js Knowledge Hub API

This project is a REST API built with **NestJS** as part of the RS School Node.js assignment.

It implements full CRUD functionality for core entities such as **Users, Articles, Categories, and Comments**, includes **OpenAPI (Swagger) documentation**, and is covered with **end-to-end tests**.

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
