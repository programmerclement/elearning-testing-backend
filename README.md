# E-Learning & Course Management — Backend API

A **production-ready** REST API for an E-Learning platform built with **Node.js**, **Express**, **MySQL** (raw SQL), **Multer**, and **Swagger**.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Swagger API Documentation](#swagger-api-documentation)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)

---

## 🛠 Tech Stack

| Layer         | Technology                     |
|---------------|-------------------------------|
| Runtime       | Node.js                        |
| Framework     | Express.js                     |
| Database      | MySQL (raw SQL via `mysql2`)   |
| File Uploads  | Multer (local disk storage)    |
| API Docs      | Swagger UI + swagger-jsdoc     |
| Environment   | dotenv                         |

---

## 📁 Project Structure

```
e-learning/
├── database/
│   ├── schema.sql          # All table definitions (raw SQL)
│   └── seed.sql            # Sample data for testing
├── src/
│   ├── config/
│   │   ├── db.js           # MySQL connection pool (mysql2/promise)
│   │   └── swagger.js      # Swagger JSDoc configuration
│   ├── controllers/        # Thin HTTP handlers (delegate to services)
│   │   ├── dashboard.controller.js
│   │   ├── course.controller.js
│   │   ├── chapter.controller.js
│   │   ├── syllabus.controller.js
│   │   └── payment.controller.js
│   ├── services/           # Business logic layer
│   │   ├── dashboard.service.js
│   │   ├── course.service.js
│   │   ├── chapter.service.js
│   │   ├── syllabus.service.js
│   │   └── payment.service.js
│   ├── models/             # Raw SQL queries only — NO ORM
│   │   ├── dashboard.model.js
│   │   ├── course.model.js
│   │   ├── chapter.model.js
│   │   ├── exercise.model.js
│   │   ├── syllabus.model.js
│   │   ├── payment.model.js
│   │   └── progress.model.js
│   ├── routes/
│   │   ├── dashboard.routes.js
│   │   ├── course.routes.js
│   │   ├── chapter.routes.js            # Nested: POST /courses/:id/chapters
│   │   ├── chapterStandalone.routes.js  # Standalone: /chapters/:id/...
│   │   ├── syllabus.routes.js
│   │   └── payment.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js       # Simulated auth (req.user injection)
│   │   ├── error.middleware.js      # Global error handler
│   │   └── upload.middleware.js     # Multer factory (cloud-ready abstraction)
│   ├── utils/
│   │   ├── response.js              # Standardised response helpers
│   │   └── helpers.js              # Pagination + file URL builder
│   └── app.js                       # Express app setup
├── uploads/                          # Uploaded files (thumbnails, outlines, etc.)
├── server.js                         # Entry point with graceful shutdown
├── .env                              # Environment variables
├── package.json
└── README.md
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root (already provided):

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=elearning_db

NODE_ENV=development
```

> **Note:** Change `DB_PASSWORD` to your MySQL root password.

---

## 🗄️ Database Setup

### 1. Create the database and tables

```bash
mysql -u root -p < database/schema.sql
```

### 2. Seed sample data

```bash
mysql -u root -p < database/seed.sql
```

Or run both together:

```bash
mysql -u root -p -e "source database/schema.sql; source database/seed.sql;"
```

---

## 🚀 Running the Project

### Prerequisites

- Node.js ≥ 18
- MySQL ≥ 8.0

### Install dependencies

```bash
npm install
```

### Start development server (with auto-reload)

```bash
npm run dev
```

### Start production server

```bash
npm start
```

You should see:

```
✅  MySQL connected successfully

╔═══════════════════════════════════════════════════╗
║  🚀  E-Learning API is running                    ║
║  📡  Server  : http://localhost:3000               ║
║  📄  Swagger : http://localhost:3000/api/docs       ║
║  ❤️   Health  : http://localhost:3000/health         ║
╚═══════════════════════════════════════════════════╝
```

---

## 📄 Swagger API Documentation

Visit: **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

Raw OpenAPI spec (JSON): `http://localhost:3000/api/docs.json`

> All endpoints are documented with request bodies, parameters, and response schemas. All endpoints can be tested directly from the Swagger UI.

---

## 🔗 API Endpoints

### Dashboard
| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| GET    | `/api/dashboard/metrics`         | Total students, avg score, certs   |
| GET    | `/api/dashboard/lessons-history` | Paginated top courses              |

### Courses
| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| POST   | `/api/courses`                   | Create course draft                |
| GET    | `/api/courses`                   | List courses (paginated)           |
| GET    | `/api/courses/:courseId`         | Get course with chapters+exercises |
| PUT    | `/api/courses/:courseId/publish` | Publish a course                   |
| DELETE | `/api/courses/:courseId`         | Soft delete a course               |

### Chapters
| Method | Endpoint                                      | Description                     |
|--------|-----------------------------------------------|---------------------------------|
| POST   | `/api/courses/:courseId/chapters`             | Add chapter (+ thumbnail upload)|
| GET    | `/api/chapters/:chapterId`                    | Get chapter details             |
| POST   | `/api/chapters/:chapterId/complete`           | Mark chapter as completed       |

### Exercises
| Method | Endpoint                                      | Description                     |
|--------|-----------------------------------------------|---------------------------------|
| POST   | `/api/chapters/:chapterId/exercises`          | Add exercise (checkbox/radio/text) |
| GET    | `/api/chapters/:chapterId/exercises`          | List exercises                  |

### Syllabuses
| Method | Endpoint                                      | Description                     |
|--------|-----------------------------------------------|---------------------------------|
| POST   | `/api/syllabuses`                             | Create syllabus                 |
| GET    | `/api/syllabuses/:id`                         | Get syllabus with outlines      |
| POST   | `/api/syllabuses/:id/outlines`                | Add outline (+ image upload)    |

### Payments
| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/invoices/preview`           | Preview invoice (subtotal+VAT+fee) |
| POST   | `/api/payments`                   | Process payment (SQL transaction)  |

### Other
| Method | Endpoint    | Description        |
|--------|-------------|--------------------|
| GET    | `/health`   | Health check       |

---

## 🏗️ Architecture

```
HTTP Request
    │
    ▼
Route (Express Router)
    │  validates params, attaches Multer
    ▼
Controller (thin handler)
    │  reads req, calls service, sends response
    ▼
Service (business logic)
    │  validates, orchestrates, transforms
    ▼
Model (raw SQL)
    │  executes parameterised queries via mysql2
    ▼
MySQL Database
```

### Key Design Decisions

- **No ORM** — All queries use raw parameterised SQL via `mysql2/promise`
- **SQL Transactions** — Payments use `BEGIN / INSERT / INSERT / COMMIT / ROLLBACK` atomically
- **Soft Deletes** — Courses and chapters use `deleted_at` timestamp instead of hard delete
- **JSON Column** — Exercise options stored as MySQL JSON column, parsed automatically
- **Cloud-Ready Uploads** — Multer uses a factory pattern; swap `diskStorage` → `memoryStorage` + cloud SDK to migrate
- **Global Error Handler** — All errors bubble up via `next(err)` to a single handler
- **Simulated Auth** — `req.user = { id: 1, role: 'instructor' }` — replace middleware body with JWT verification

---

## 📦 Fee Calculation (Payments)

| Component   | Rate  | Example (base: $49.99) |
|-------------|-------|------------------------|
| Subtotal    | —     | $49.99                 |
| Service Fee | 5%    | $2.50                  |
| VAT         | 15%   | $7.87                  |
| **Total**   |       | **$60.36**             |

---

## 🧪 Testing via Swagger

1. Run the server: `npm run dev`
2. Open: `http://localhost:3000/api/docs`
3. Use `GET /api/dashboard/metrics` to verify DB connectivity
4. Use `GET /api/invoices/preview?course_id=1` to test fee calculation
5. Use `POST /api/payments` with `{ "course_id": 3 }` to test full transaction flow
