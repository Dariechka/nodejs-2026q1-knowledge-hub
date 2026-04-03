# Nest.js Knowledge Hub API

This project is a REST API built with **NestJS** as part of the RS School Node.js assignment.

It implements full CRUD functionality for core entities such as **Users, Articles, Categories, and Comments**, includes **OpenAPI (Swagger) documentation**, and is covered with **end-to-end tests**.

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
