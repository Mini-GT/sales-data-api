# 🛒 Sales Data REST API

A RESTful API for storing and retrieving sales data, built with **Fastify**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. Designed with enterprise-grade architecture in mind — featuring authentication, data validation, proper error handling, and a clean modular structure.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Bonus Features](#bonus-features)

---

## Overview

This project was built as part of learning a backend framework. The goal is to learn **Fastify** quickly and apply that knowledge to build a production-ready REST API that supports:

- Querying sales data by month
- Tracking which customers purchased which products
- Authentication via JWT
- Input validation using Zod schemas

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Fastify v5 |
| ORM | Prisma v7 |
| Database | PostgreSQL |
| Validation | Zod v4 |
| Authentication | JWT + bcryptjs |
| Package Manager | pnpm |

---

## Project Structure

```
server/
├── generated/                  # Prisma generated client
├── node_modules/
├── prisma/
│   ├── migrations/             # Database migration history
│   └── schema.prisma           # Prisma data model
├── src/
│   ├── controllers/            # Route handler logic
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   └── sale.controller.ts
│   ├── lib/
│   │   └── prisma.ts           # Prisma client instance
│   ├── middlewares/
│   │   └── auth.middleware.ts  # JWT authentication guard
│   ├── plugins/
│   │   └── authenticate.ts     # Fastify auth plugin
│   ├── routes/
│   │   ├── auth.route.ts       # Auth endpoints
│   │   ├── product.route.ts    # Product endpoints
│   │   └── sale.route.ts       # Sales endpoints
│   ├── schemas/
│   │   ├── auth.schema.ts      # Auth Zod schemas
│   │   ├── product.schema.ts   # Product Zod schemas
│   │   └── sales.schema.ts     # Sales Zod schemas
│   ├── utils/
│   │   ├── formatDate.ts       # Date utility helpers
│   │   └── jwt.ts              # JWT sign/verify helpers
│   └── server.ts               # Fastify app entry point
├── .env                        # Environment variables
├── .gitignore
├── fastify.d.ts                # Fastify type augmentations
├── package.json
├── pnpm-lock.yaml
├── prisma.config.ts
└── tsconfig.json
```

---

## Database Schema

The database consists of three core tables:

**Customer** — stores customer information
**Product** — stores product catalog
**Sale** — links customers to products with a purchase date

**NOTE** — The schema below is just for demo purposes therefore the unique identifier used has a default of autoincrement(), but in a real world enterprise application this should be more secure such as cuid(), uuid(), or whatever strong and secure unique identifier you want to use
```prisma
model Customer {
  createdAt  DateTime @default(now())
  updatedAt  DateTime @default(now()) @updatedAt
  email      String   @unique
  name       String
  role       Role     @default(USER)
  password   String
  customerId Int      @id @default(autoincrement())
  sales      Sale[]
}

model Product {
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now()) @updatedAt
  name      String
  price     Int
  quantity  Int      @default(1)
  category  Category
  productId Int      @id @default(autoincrement())
  sales     Sale[]
}

model Sale {
  createdAt  DateTime @default(now())
  updatedAt  DateTime @default(now()) @updatedAt
  customerId Int
  productId  Int
  quantity   Int      @default(1)
  saleId     Int      @id @default(autoincrement())
  customer   Customer @relation(fields: [customerId], references: [customerId], onDelete: Cascade)
  product    Product  @relation(fields: [productId], references: [productId], onDelete: Cascade)
}

enum Role {
  USER
  ADMIN
  MODERATOR
  DEMO
}

enum Category {
  FOOD
  ELECTRONIC
  HOME_APPLIANCE
}
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register a new user | ❌ |
| POST | `/api/auth/login` | Login and receive JWT | ❌ |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | ✅ |
| POST | `/api/products` | Create a product | ✅ |

### Sales

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sales?month=YYYY-MM` | Get all sales for a month | ✅ |
| POST | `/api/sales` | Record a new sale | ✅ |

#### Example: Query sales for a month

```
GET /api/sales?month=2025-06
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "clx123...",
    "soldAt": "2025-06-15T10:30:00.000Z",
    "customer": {
      "id": "clx456...",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "product": {
      "id": "clx789...",
      "name": "Widget Pro",
      "price": 49.99
    }
  }
]
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- pnpm (`npm install -g pnpm`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Mini-GT/sales-data-api.git
cd sales-data-api

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# 4. Generate Prisma client
pnpm pgen

# 5. Run database migrations
pnpm dlx prisma migrate dev

# 6. Start development server
pnpm dev
```

The server will start at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/salesdb"
JWT_SECRET="your-super-secret-key"
PORT=3000
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm start` | Start production server |
| `pnpm pvalid` | Validate Prisma schema |
| `pnpm pformat` | Format Prisma schema |
| `pnpm pgen` | Generate Prisma client |
| `pnpm preset` | Reset and re-seed the database |

---

## Bonus Features

The following enterprise-grade features have been implemented beyond the base requirements:

- ✅ **Authentication** — JWT-based auth with registration and login
- ✅ **Data Validation** — All request bodies validated with Zod schemas
- ✅ **Proper HTTP Error Handling** — Structured error responses with appropriate status codes
- ✅ **Modular Architecture** — Controllers, routes, schemas, and plugins are cleanly separated
- ✅ **TypeScript** — Fully typed codebase with custom Fastify type declarations
- ✅ **Prisma ORM** — Type-safe database access with migration support
- ✅ **Fastify Plugins** — Authentication registered as a reusable Fastify plugin

---

## License

MIT
