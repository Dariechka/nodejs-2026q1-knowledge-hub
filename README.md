# Nest.js Knowledge Hub API

This project is a REST API built with **NestJS** as part of the RS School Node.js assignment.
---
## Please add the following to the `migration.sql` file for the project to work correctly (I forgot to include it in the previous push).
```
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('question', 'answer');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "contentType" "MessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```




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
    
    GEMINI_EMBEDDING_MODEL=gemini-embedding-2
    RAG_VECTOR_DB_PROVIDER=qdrant
    RAG_VECTOR_DB_URL=http://localhost:6333
    RAG_VECTOR_COLLECTION=knowledge_hub_articles
    RAG_CHUNK_SIZE=800
    RAG_CHUNK_OVERLAP=200
    RAG_CONVERSATION_MAX_MESSAGES=10
    ```

**Testing the AI Endpoints:**
You can test the implementation using the built-in Swagger UI at `http://localhost:3000/api` (or your configured port). Look for the following routes:
*   `POST /ai/articles/:articleId/analyze`: Generates quality checks and suggestions.
*   `POST /ai/articles/:articleId/summarize`: Returns a deterministic, cached summary.
*   `POST /ai/articles/:articleId/translate`: Translate context *sourceLanguage* (for example **English**) to *targetLanguage* (for example **Russian**)
*   `POST /ai/generate`: Free-form generation for general prompts.
*   `POST /ai/rag/index`: indexes Knowledge Hub article data into vector storage
*   `POST /ai/rag/search`: performs semantic search and returns ranked chunks with article attribution
*   `POST /ai/rag/chat`: implements end-to-end RAG (retrieve relevant chunks, build grounded prompt, return answer + sources)
*   `DELETE /ai/rag/index/articles/:articleId`: removes article vectors from index correctly
*   `GET /ai/rag/chat/:conversationId/history`: inspecting RAG conversation memory

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
4.  Use `GEMINI_MODEL=gemini-3.1-flash-lite-preview` and `GEMINI_EMBEDDING_MODEL=gemini-embedding-2`

### 3. Start Infrastructure & Database
This project uses Docker for the database and Prisma for ORM.
```bash
# Start Docker containers (Database, Redis, etc.)
$ docker-compose up --build -d
```
This starts:

* backend application
* PostgreSQL
* Qdrant vector database

```bash
# Generate Prisma Client
$ npx prisma generate

# Run database migrations
$ npx prisma migrate dev

# Seed the database with initial data (Articles, Users)
$ npx prisma db seed
```

Check Container Health Status
```bash
docker ps
```


### 4. Launch the Application
```bash
$ npm run start:dev
```

# Vector Database

The project uses Qdrant as the vector database provider.

Configuration:

```env
RAG_VECTOR_DB_PROVIDER=qdrant
RAG_VECTOR_DB_URL=http://localhost:6333
RAG_VECTOR_COLLECTION=knowledge_hub_articles
```

Qdrant data is persisted in a Docker volume:

```txt
/qdrant/storage
```

## 5. Build Vector Index

Endpoint:

```http
POST /ai/rag/index
```

Example request:

```json
{
  "onlyPublished": false
}
```

Example response:

```json
{
  "indexedArticles": 5,
  "indexedChunks": 9,
  "vectorCollection": "knowledge_hub_articles"
}
```

---

# Sample RAG Requests

## Semantic Search

Endpoint:

```http
POST /ai/rag/search
```

Example request:

```json
{
  "query": "research approaches",
  "articleStatus": "published",
  "tags": ["chromatography"]
}
```

---

## Conversational RAG Chat

Endpoint:

```http
POST /ai/rag/chat
```

Example request:

```json
{
  "question": "Give me an example of organic synthesis and its conditions",
  "conversationId": "optional-session-id"
}
```

Example response:

```json
{
  "answer": "An example of organic synthesis is...",
  "sources": [
    {
      "articleId": "...",
      "articleTitle": "...",
      "relevantChunk": "..."
    }
  ],
  "conversationId": "..."
}
```

---

## Conversation History

Endpoint:

```http
GET /ai/rag/chat/:conversationId/history
```

Returns recent conversation messages for the specified session.
Conversation history is persistently stored using:

* Prisma ORM
* PostgreSQL

The system stores:

* user questions
* generated AI answers
* conversation sessions
* timestamps

Recent messages are automatically loaded and injected into the RAG prompt to provide conversational context and short-term memory.

Maximum active history size is configurable:

```env id="hist2"
RAG_CONVERSATION_MAX_MESSAGES=10
```

Older messages remain stored in PostgreSQL but are excluded from active prompt context to reduce:

* token usage
* latency
* prompt size


---

# Implemented RAG Features

* semantic vector retrieval
* hybrid retrieval (semantic + lexical)
* Gemini-based reranking
* persistent vector storage
* conversational memory
* configurable history size
* article metadata filtering
* chunk overlap indexing strategy

---

# Known Limitations

## Gemini Free-Tier Quotas

Free-tier API usage may include:

* requests-per-minute limits
* daily token quotas
* embedding generation limits

Large indexing operations may temporarily exceed quota limits.

---

## Latency

RAG requests are slower than standard CRUD APIs because they involve:

* embedding generation
* vector search
* reranking
* LLM generation

---

