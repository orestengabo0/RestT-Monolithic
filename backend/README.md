# RestT Monolithic — Node.js REST API Starter

A production-ready REST API starter built with TypeScript, Express 5, Prisma 7, and PostgreSQL. Use it as a foundation for new backend projects — auth, RBAC, user management, pagination, Swagger docs, and email notifications are already wired up.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 18+ |
| Language | TypeScript |
| Framework | Express 5 |
| Database | PostgreSQL 14+ |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Zod |
| Docs | Swagger / OpenAPI 3.0 |
| Email | Nodemailer |
| Logging | Winston |

## Features

- **Consistent API responses** — standardized success/error format via `ApiResponse`
- **Global error handling** — custom error classes caught by a central middleware
- **Request validation** — Zod schemas with reusable `validate()` middleware
- **Authentication** — register, login, refresh, logout (single device and all devices)
- **Authorization** — role-based access control (ADMIN, MODERATOR, USER) with ownership checks
- **User management** — profile, password change, self-deactivation, admin controls
- **Pagination & filtering** — reusable utilities for list endpoints
- **Swagger docs** — interactive API documentation at `/api-docs`
- **Email notifications** — welcome, password changed, account deactivated (console fallback without SMTP)
- **Database seeding** — default roles and test users out of the box

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/download/) v14+
- [pnpm](https://pnpm.io/installation)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up PostgreSQL

Create a local database:

```sql
CREATE DATABASE restt;
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables) below).

### 4. Initialize the database

```bash
pnpm db:generate   # Generate Prisma Client
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed roles and test users
```

### 5. Start the server

```bash
pnpm dev           # Development (http://localhost:3000)
pnpm build         # Compile TypeScript
pnpm start         # Production
```

### Useful URLs

| URL | Description |
|-----|-------------|
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/api-docs` | Swagger UI |
| `http://localhost:3000/api-docs.json` | OpenAPI JSON |
| `http://localhost:5555` | Prisma Studio (`pnpm db:studio`) |

### Seeded credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| User | user1@example.com | User@123 |
| User | user2@example.com | User@123 |
| Moderator | moderator@example.com | Mod@123 |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs (`openssl rand -base64 32`) |
| `JWT_EXPIRES_IN` | No | `15m` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRES_IN` | No | `7d` | Refresh token lifetime |
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `LOG_LEVEL` | No | `info` | Winston log level |
| `SMTP_HOST` | No | — | SMTP server (emails log to console if unset) |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_SECURE` | No | `false` | Use TLS |
| `SMTP_USER` | No | — | SMTP username |
| `SMTP_PASS` | No | — | SMTP password |
| `EMAIL_FROM_NAME` | No | — | Sender display name |
| `EMAIL_FROM` | No | — | Sender email address |
| `FRONTEND_URL` | No | — | Base URL for links in emails |

> Environment variables are loaded via `-r dotenv/config` at process startup (see `package.json` scripts). Do not rely on `dotenv.config()` inside module imports — Prisma and database modules read env vars at load time.

Example `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/restt?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## Project Structure

```
RestT-Monolithic/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Seed script
│   └── migrations/            # Migration history
├── src/
│   ├── app.ts                 # Express app setup & route registration
│   ├── server.ts              # Entry point
│   ├── common/
│   │   ├── errors/            # Custom error classes
│   │   ├── middleware/        # authenticate, authorize, asyncHandler, etc.
│   │   ├── responses/         # ApiResponse wrapper
│   │   ├── utils/             # Pagination helpers
│   │   └── validators/        # Zod schemas & validate() middleware
│   ├── config/
│   │   ├── database.ts        # Prisma client + pg adapter
│   │   ├── jwt.ts             # JWT utilities
│   │   ├── logger.ts          # Winston logger
│   │   └── swagger.ts         # OpenAPI config
│   ├── modules/
│   │   ├── auth/              # Authentication routes & service
│   │   └── user/              # User management routes & service
│   └── services/
│       ├── email/             # Nodemailer + HTML templates
│       └── notification/      # Auth-related notification triggers
├── prisma.config.ts           # Prisma CLI config (datasource URL)
├── package.json
└── tsconfig.json
```

### Module conventions

Each feature lives under `src/modules/<name>/`:

```
modules/product/
├── product.service.ts     # Business logic & database queries
├── product.routes.ts      # Route definitions
├── product.validators.ts  # Zod schemas
└── product.swagger.ts     # Swagger JSDoc (optional, separate file)
```

Register new routes in `src/app.ts`:

```typescript
import productRoutes from './modules/product/product.routes';
app.use('/api/v1/products', productRoutes);
```

---

## API Reference

Base URL: `http://localhost:3000`

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Create account |
| POST | `/login` | No | Login, returns access + refresh tokens |
| GET | `/me` | Yes | Current user profile |
| POST | `/refresh` | No | Refresh access token |
| POST | `/logout` | No | Logout (invalidate refresh token) |
| POST | `/logout-all` | Yes | Logout from all devices |

### Users (`/api/v1/users`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/` | Yes | Admin, Moderator | List users (paginated) |
| GET | `/stats` | Yes | Admin | User statistics |
| GET | `/:id` | Yes | Admin, Moderator | Get user by ID |
| PATCH | `/:id/profile` | Yes | Owner, Admin | Update profile |
| PATCH | `/:id/password` | Yes | Owner | Change password |
| POST | `/:id/deactivate` | Yes | Owner | Deactivate own account |
| PATCH | `/:id/status` | Yes | Admin | Update user status |
| DELETE | `/:id` | Yes | Admin | Delete user |

### List users — query parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page (max 100) |
| `sortBy` | string | `createdAt` | `createdAt`, `email`, `firstName`, `lastName`, `status` |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `search` | string | — | Search email, firstName, lastName |
| `status` | string | — | `ACTIVE`, `INACTIVE`, `SUSPENDED` |
| `role` | string | — | `ADMIN`, `USER`, `MODERATOR` |
| `dateFrom` | ISO date | — | Filter from date |
| `dateTo` | ISO date | — | Filter to date |

Example:

```bash
GET /api/v1/users?page=1&limit=10&sortBy=email&sortOrder=asc&status=ACTIVE&search=john
Authorization: Bearer <token>
```

### Response format

**Success:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ]
}
```

---

## Authentication & Authorization

### Token flow

- **Access token** — short-lived (15m), sent as `Authorization: Bearer <token>`
- **Refresh token** — long-lived (7d), stored in DB, used to obtain new access tokens

### Middleware

| Middleware | Purpose |
|------------|---------|
| `authenticate` | Validates JWT, attaches `req.user` |
| `authorize(...roles)` | Restricts route to specific roles |
| `isAdmin` | Shorthand for ADMIN only |
| `isAdminOrModerator` | ADMIN or MODERATOR |
| `checkOwnership` | Ensures user can only modify their own resource |

Usage in routes:

```typescript
router.get('/', authenticate, isAdminOrModerator, asyncHandler(async (req, res) => {
  // ...
}));

router.patch('/:id/profile', authenticate, checkOwnership, asyncHandler(async (req, res) => {
  // ...
}));
```

---

## Core Patterns

### API responses

```typescript
import { ApiResponse } from './common/responses/apiResponse';

ApiResponse.success(res, data, 'Operation successful');
ApiResponse.created(res, data, 'Resource created');
ApiResponse.error(res, 'Error message', 400);
```

### Error handling

```typescript
import { NotFoundError, BadRequestError, ValidationError, ForbiddenError } from './common/errors/AppError';

throw new NotFoundError('User not found');
throw new BadRequestError('Invalid input');
```

Errors thrown inside `asyncHandler`-wrapped routes are caught automatically.

### Validation

```typescript
import { z } from 'zod';
import { validate } from './common/validators/validate';

const createSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
  }),
});

router.post('/', validate(createSchema), asyncHandler(async (req, res) => {
  const { name, email } = req.body; // validated
}));
```

### Async route handlers

```typescript
import { asyncHandler } from './common/middleware/asyncHandler';

router.get('/:id', asyncHandler(async (req, res) => {
  const item = await service.findById(req.params.id);
  return ApiResponse.success(res, item);
}));
```

### Pagination (list endpoints)

```typescript
import {
  parsePagination,
  parseSort,
  parseFilters,
  buildOrderBy,
  createPaginatedResponse,
} from './common/utils/pagination';

const { page, limit, skip } = parsePagination(req.query);
const orderBy = buildOrderBy(parseSort(req.query, allowedSortFields));
const where = buildYourWhereClause(parseFilters(req.query));

const [items, total] = await Promise.all([
  prisma.model.findMany({ where, skip, take: limit, orderBy }),
  prisma.model.count({ where }),
]);

return ApiResponse.success(res, createPaginatedResponse(items, total, page, limit));
```

---

## Swagger Documentation

- **UI:** `http://localhost:3000/api-docs`
- **JSON:** `http://localhost:3000/api-docs.json`

To document a new endpoint, add JSDoc above the route handler:

```typescript
/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: List products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', authenticate, asyncHandler(async (req, res) => { /* ... */ }));
```

Or put docs in a separate `*.swagger.ts` file and import it in your routes file. Swagger scans `src/modules/**/*.routes.ts` (configured in `src/config/swagger.ts`).

Click **Authorize** in Swagger UI and enter `Bearer <your-access-token>` to test protected routes.

---

## Email Service

Emails are sent asynchronously (fire-and-forget) so API responses are not blocked.

| Event | Template |
|-------|----------|
| Registration | Welcome email |
| Password change | Password changed notification |
| Account deactivation | Deactivation confirmation |

Without SMTP configured, email content is logged to the console — useful for local development.

To enable real emails, set `SMTP_*` variables in `.env`. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).

---

## Database

### Prisma v7 notes

- Datasource URL lives in `prisma.config.ts`, not `schema.prisma`
- Prisma Client requires the `@prisma/adapter-pg` adapter — see `src/config/database.ts`
- Seed script imports the shared `prisma` client (do not use bare `new PrismaClient()`)

### Commands

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Create and apply migration (dev) |
| `pnpm db:migrate:prod` | Apply migrations (production) |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:reset` | Reset database (deletes all data) |

### Schema overview

| Model | Description |
|-------|-------------|
| `Role` | ADMIN, USER, MODERATOR |
| `User` | Account with status, email verification, password reset fields |
| `RefreshToken` | Refresh token storage with cascade delete |

---

## Building on This Template

Follow these steps when starting a new project from this starter.

### 1. Fork or clone and rename

```bash
git clone <repo-url> my-project
cd my-project
```

Update `name` in `package.json`, Swagger title in `src/config/swagger.ts`, and email branding in `src/services/email/templates/`.

### 2. Configure for your project

1. Copy `.env.example` → `.env`
2. Set `DATABASE_URL` to your PostgreSQL database
3. Generate a strong `JWT_SECRET`
4. Optionally configure SMTP and `FRONTEND_URL`

### 3. Customize the database schema

Edit `prisma/schema.prisma` — add your models, enums, and relations:

```prisma
model Product {
  id        String   @id @default(uuid())
  name      String
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
  @@map("products")
}
```

Then run:

```bash
pnpm db:migrate    # Enter a migration name when prompted
pnpm db:generate
```

Update `prisma/seed.ts` if you need new seed data.

### 4. Add a new module

Example: a `product` module.

**a) Create the service** (`src/modules/product/product.service.ts`):

```typescript
import { prisma } from '../../config/database';
import { NotFoundError } from '../../common/errors/AppError';

export const productService = {
  async findAll() {
    return prisma.product.findMany();
  },

  async findById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundError('Product not found');
    return product;
  },

  async create(data: { name: string; price: number }) {
    return prisma.product.create({ data });
  },
};
```

**b) Create validators** (`src/modules/product/product.validators.ts`):

```typescript
import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    price: z.number().positive(),
  }),
});
```

**c) Create routes** (`src/modules/product/product.routes.ts`):

```typescript
import { Router } from 'express';
import { asyncHandler } from '../../common/middleware/asyncHandler';
import { validate } from '../../common/validators/validate';
import { authenticate } from '../../common/middleware/authenticate';
import { isAdmin } from '../../common/middleware/authorize';
import { ApiResponse } from '../../common/responses/apiResponse';
import { productService } from './product.service';
import { createProductSchema } from './product.validators';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const products = await productService.findAll();
  return ApiResponse.success(res, products);
}));

router.post('/', authenticate, isAdmin, validate(createProductSchema), asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  return ApiResponse.created(res, product, 'Product created');
}));

export default router;
```

**d) Register in `src/app.ts`:**

```typescript
import productRoutes from './modules/product/product.routes';
app.use('/api/v1/products', productRoutes);
```

**e) Add Swagger docs** — JSDoc in routes or a separate `product.swagger.ts` file.

### 5. Add pagination to a list endpoint

For modules with list endpoints, reuse the pagination utilities:

1. Define a query schema in `product.validators.ts` (see `userListQuerySchema` in `src/common/validators/paginationSchema.ts`)
2. Build a `where` clause helper (see `buildUserWhereClause` in `src/common/utils/pagination.ts`)
3. Use `parsePagination`, `parseSort`, `createPaginatedResponse` in your service
4. Apply `validate(yourQuerySchema)` on the GET route

### 6. Add roles or permissions

To add a new role:

1. Add to `RoleType` enum in `prisma/schema.prisma`
2. Run `pnpm db:migrate`
3. Seed the new role in `prisma/seed.ts`
4. Use `authorize(RoleType.YOUR_ROLE)` on routes

For fine-grained permissions beyond roles, add a `Permission` model and check permissions in middleware.

### 7. Add email notifications

1. Create a template in `src/services/email/templates/`
2. Add a method in `src/services/notification/notification.service.ts`
3. Call it from your service with `.catch()` so failures don't block the request:

```typescript
notificationService.sendWelcomeEmail(user.email, user.firstName).catch(console.error);
```

### 8. Checklist for each new feature

- [ ] Prisma model + migration
- [ ] Service with business logic
- [ ] Zod validators
- [ ] Routes with `asyncHandler`, `validate`, auth middleware
- [ ] Register routes in `app.ts`
- [ ] Swagger documentation
- [ ] Seed data (if needed)
- [ ] Test via Swagger UI or curl

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Run production build |
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:migrate` | Dev migration |
| `pnpm db:migrate:prod` | Production migration |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Prisma Studio GUI |
| `pnpm db:reset` | Reset DB (destructive) |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `DATABASE_URL is not defined` | Ensure `.env` exists; scripts preload dotenv via `-r dotenv/config` |
| `PrismaClient needs valid options` | Use the shared client from `src/config/database.ts` (requires pg adapter in Prisma v7) |
| Database connection failed | Verify PostgreSQL is running and credentials in `.env` match |
| Prisma Client not found | Run `pnpm db:generate` |
| Port 3000 in use | Change `PORT` in `.env` |
| Emails not sending | Expected without SMTP — check console logs; configure `SMTP_*` for real delivery |
| Migration failed | Ensure DB exists; check `schema.prisma`; try `pnpm db:reset` (deletes data) |

---

## License

ISC
