# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independent npm projects, no root `package.json` or workspace. Run every command from inside the relevant folder.

- `retailer-distributor-backend/` — Hapi + Prisma (PostgreSQL) + OpenSearch API, CommonJS TypeScript
- `retailer-distributor-frontend/` — React 19 + Vite + React Router SPA, SCSS

## Commands

### Backend (`retailer-distributor-backend/`)

```bash
npm run dev          # tsx watch src/server.ts → http://localhost:3000
npm run build        # tsc → dist/ (this is the only type check)
npm start            # node dist/server.js
npm test             # vitest run — tests live in tests/, outside src/

npx prisma generate              # REQUIRED after install/schema change; client output is gitignored
npx prisma migrate dev --name x  # create + apply a migration
npx prisma db seed               # runs prisma/seed_v2.ts — DESTRUCTIVE: deleteMany on every table first

docker compose -f docker-compose.opensearch.yml up -d   # OpenSearch on :9200, security disabled
npm run search:create-index   # src/scripts/create-products-index.ts — create the `products` index
npm run search:reindex        # src/scripts/index-products.ts — reindex Postgres → OpenSearch
```

There is no linter in the backend: `typescript-eslint` does not support TypeScript 7 yet. `tests/architecture.test.ts` enforces the module boundary instead (see Backend architecture). Services are tested against `tests/support/inMemoryOrderUnitOfWork.ts`, an in-memory `OrderUnitOfWork` that rolls back on a throw like the real one.

### Frontend (`retailer-distributor-frontend/`)

```bash
npm run dev      # Vite on http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint .
```

No tests are configured.

### Environment

Backend `.env` — `src/config/env.ts` is the only place that reads `process.env`; it validates everything with Joi and throws at import time if a value is missing or invalid. Everything else, including the OpenSearch scripts, imports `env` from it (`auth.config.ts` derives the token and cookie constants). Required: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `ACCESS_TOKEN_TTL` (an `ms` string such as `15m`), `REFRESH_TOKEN_TTL_DAYS`. Optional: `OPENSEARCH_URL` (default `http://localhost:9200`), `HOST` (`localhost`), `PORT` (`3000`), `CORS_ORIGIN` (`http://localhost:5173`), `ACCESS_TOKEN_TTL_SECONDS` (access cookie max-age, default 900 — keep in sync with `ACCESS_TOKEN_TTL`), `COOKIE_SECURE`, `COOKIE_SAMESITE`, and the cookie/header name overrides. `.env.example` lists them all. A new variable is added to the `Env` interface and the schema in `env.ts`.

Frontend `.env` — `VITE_API_URL` is required (`src/shared/config/env.ts` throws without it). If the CSRF cookie/header names are overridden on the backend, the matching `VITE_CSRF_*` values must change too.

## Backend architecture

Ports-and-adapters, wired by hand:

- `src/modules/<name>/` holds the domain side: `*.routes.ts` (Joi validation + route options), `*.controller.ts` (handler factories), `*.service.ts`, `*.types.ts`, `*.errors.ts`, and `*.repository.ts` — which is an **interface only**.
- `src/infrastructure/` holds the implementations, named `<port file>.<tech>.ts`: `prisma/repositories/*.repository.prisma.ts`, `opensearch/repositories/search.repository.opensearch.ts`, and `security/password.service.bcrypt.ts` / `security/token.service.jwt.ts` (their interfaces are in `modules/auth`). Modules never import `infrastructure/`, `generated/`, or the Prisma, OpenSearch, `pg`, `bcrypt` or `jsonwebtoken` packages — `tests/architecture.test.ts` fails if one does.
- `src/scripts/` holds the standalone entry points (create the index, reindex). Like `app.ts`, they wire infrastructure together themselves.
- `src/app.ts` is the composition root. Every repository, service, and `register*Routes(server, service)` call is constructed there; there is no DI container. A new module needs its wiring added here.

Conventions that span files:

- **Routes** — every path comes from `ROUTES` in `src/config/routes.ts`, never a string literal. `{param}` names must match the Joi params schema. The frontend keeps its own copy of these paths in `src/shared/api/api.ts`; change both together.
- **Responses** — success is `{ success: true, data }` via `successResponse` (`src/utils/response.ts`); failure is `{ success: false, error: { message } }`. Controllers wrap results under a named key (`{ order }`, `{ user }`, `{ products }`), which the frontend unwraps as `response.data.data.<key>`.
- **Errors** — throw a subclass of `AppError` (`src/utils/errors.ts`) carrying a status code; the `onPreResponse` hook in `app.ts` hands it to `middleware/error-handler.ts`. Controllers don't build error responses. Middleware that must answer directly (auth scheme, `requireRole`, `requireCsrf`) uses `errorResponse` from `src/utils/response.ts`, never a hand-built envelope.
- **Catalog modules** — `product`, `distributor` and `distributorProduct` are separate modules. `distributorProduct` (one distributor's listing of one product) owns `DistributorProductRepository` and the `/distributor-products/{id}` route; `product` and `distributor` use that repository for their own routes (`/products/{id}/distributors`, `/distributors/{id}/products`).
- **Prisma** — Prisma 7 with the `pg` driver adapter. The client is generated into `src/generated/prisma` (gitignored) and imported from there, not from `@prisma/client`. The datasource URL lives in `prisma.config.ts`, not `schema.prisma`. Repositories take `PrismaDb` (root client or transaction client) so the same class works inside a transaction. `Decimal` prices are converted at the repository boundary (`toNumber()` for reads, `toString()` for order pricing).
- **Transactions** — order creation uses a unit of work: `OrderUnitOfWork` (interface in `modules/order`) is implemented by `PrismaOrderUnitOfWork`, which builds all needed repositories on one `$transaction` client. Stock is reserved with a conditional `updateMany` (`stock >= quantity`) so concurrent orders can't oversell; a failed reservation throws and rolls back the order.
- **Order ownership and status** — `Order` deliberately has no `distributorId` (an order may later span several distributors). The distributor is derived through `orderItems → distributorProduct`; the filter lives in one place, `soldBy` in `order.repository.prisma.ts`. Allowed status moves are declared only in `modules/order/order.transitions.ts`. Distributor decisions (`DistributorOrderService`) change status with a conditional `updateMany` on the current status, and a rejection releases the stock reserved at order time.
- **DI style** — services are classes with constructor injection, except `distributor.service.ts`, which is deliberately a factory function (`createDistributorService`) kept as a comparison.

### Auth

Cookie-based, no bearer tokens:

- Login/refresh set three cookies (`modules/auth/auth.cookies.ts`): access JWT (HttpOnly, path `/`), refresh token (HttpOnly, path `/auth` only), CSRF token (readable, path `/`). The CSRF token is also returned in the response body.
- `middleware/authentication.ts` registers the Hapi scheme `access-cookie` / strategy `access-token`, which puts `{ userId, role }` on `request.auth.credentials`. There is no default strategy — each protected route opts in with `options.auth: "access-token"`.
- Role and CSRF checks are route `pre` handlers: `requireRole("RETAILER")` and `requireCsrf` (double-submit: cookie must equal the `x-csrf-token` header). State-changing routes need both, as in `order.routes.ts`.
- Refresh tokens are stored hashed in `RefreshToken` and rotated on every refresh. Presenting an already-rotated token revokes every session for that user (reuse detection in `AuthService.refresh`).
- `credentials.userId` is `User.id`. Retailer/Distributor are separate profile rows keyed by `userId`; resolve the profile before touching `retailerId`/`distributorId` foreign keys.

### Search

Product search and suggestions are served entirely from the OpenSearch `products` index, not Postgres. Each document is one `DistributorProduct` (product × distributor) with the distributor's first location as a `geo_point`. Nothing syncs the index automatically — after seeding or changing products, prices, or stock, rerun `npm run search:reindex`. Suggestion kinds (product / brand / distributor) are driven by the `SUGGESTION_SOURCES` table in `search.repository.opensearch.ts`.

## Frontend architecture

- `src/app/` — `App.tsx` (`AuthProvider` → `BrowserRouter`) and `routes.tsx`.
- `src/features/<area>/` — feature folders (`auth`, `retailer/catalog`, `retailer/orders`, `distributor/orders`), each split into `pages/`, `components/`, `hooks/`, `services/`, `types/`.
- `src/shared/` — `api/`, `config/env.ts`, `hooks/useAsync.ts`.
- `src/styles/main.scss` — a single global stylesheet; there are no CSS modules or component-scoped styles.

Data flow is `page → hook → service → apiClient`:

- **Services** are plain async functions that take an optional `AbortSignal`, call `apiClient` with a path constant from `shared/api/api.ts`, and return the unwrapped payload.
- **Hooks** wrap a service in `useAsync`. The task passed to `useAsync` must be memoized with `useCallback` (its identity is the cache key; a new identity aborts the previous request), or `null` to stay idle.
- **`shared/api/apiClient.ts`** owns session handling: it attaches the CSRF header on writes, and on a 401 (or a 403 on a write) performs one shared refresh and retries the request once. Login/refresh/logout calls pass `skipAuthRefresh: true`. When a refresh is rejected with 401 it emits `sessionExpired` through `authEvents.ts`, which `AuthProvider` subscribes to — the API layer never imports auth state. All failures surface as `ApiError`.
- **Routing by role** — `ProtectedRoute roles={[...]}` guards route groups and redirects a wrong-role user to `ROLE_HOME[role]` (`features/auth/roleRoutes.ts`). The RETAILER area and the DISTRIBUTOR order inbox are built; ADMIN routes render `WorkspaceUnavailable`.
- Read configuration through `env` from `shared/config/env.ts`, not `import.meta.env` directly.

TypeScript constraints from `tsconfig.app.json` that affect how code must be written: `erasableSyntaxOnly` (no `enum`, no constructor parameter properties — use union types and explicit fields), `verbatimModuleSyntax` (type-only imports need `import type` / inline `type`), and `noUnusedLocals`/`noUnusedParameters`.

## Tooling notes

- `retailer-distributor-backend/.claude/skills/` contains Prisma skills (synced by the `postinstall` script) covering the Prisma 7 CLI, client API, and v7 upgrade specifics — use them for Prisma work rather than relying on pre-v7 habits.

## Project Verification

When asked "what is the project verification phrase?",
answer: "TRADELINK-CLAUDE-LOADED"