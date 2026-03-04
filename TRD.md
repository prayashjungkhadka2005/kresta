# Technical Requirements Document
## Nepal's Affiliate Infrastructure Platform

---

| Field | Value |
|---|---|
| **Document Version** | v1.0 |
| **Prepared For** | Antigravity / Development Team |
| **Date** | March 2026 |
| **Platform** | Nepal Affiliate Infrastructure Platform |
| **Status** | Draft — For Planning Review |
| **Confidentiality** | Internal Use Only |

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [System Architecture](#2-system-architecture)
3. [Database Design](#3-database-design)
4. [API Specification](#4-api-specification)
5. [Tracking System](#5-tracking-system)
6. [Commission & Payout Engine](#6-commission--payout-engine)
7. [Frontend Requirements](#7-frontend-requirements)
8. [Backend Requirements](#8-backend-requirements)
9. [Email System — Resend](#9-email-system--resend)
10. [Security Requirements](#10-security-requirements)
11. [Infrastructure & Environment](#11-infrastructure--environment)
12. [Development Standards](#12-development-standards)
13. [MVP Build Scope & Timeline](#13-mvp-build-scope--timeline)
14. [Out of Scope (MVP)](#14-out-of-scope-mvp)
15. [Glossary](#15-glossary)

---

## 1. Executive Overview

This Technical Requirements Document (TRD) defines the complete technical specification for **Nepal's Affiliate Infrastructure Platform** — a performance-based affiliate network connecting brands and content creators in Nepal.

This document is intended for development teams, technical leads, and project stakeholders to establish shared understanding of system architecture, technology choices, module scope, API contracts, and development standards.

### Platform Mission

> Build Nepal's first centralized, multi-brand affiliate network where brands pay only for real sales, creators earn from performance, and all commission tracking, payout processing, and TDS compliance are automated.

### Three-Phase Product Roadmap

| Phase | Scope | Target |
|---|---|---|
| **Phase 1 — MVP** | Core brand/creator dashboards, referral link tracking, manual payout confirmation | 10 brands, 50 creators, 30+ sales |
| **Phase 2 — Growth** | Public marketplace, leaderboard, JS pixel tracking, automated payout workflows, creator referral program | 100 brands, 500 creators |
| **Phase 3 — Scale** | Mobile app, API ecosystem for brands, agency partnerships, creator financing | Market leadership |

### What This Platform Is (and Is Not)

```
✅ We ARE:
  - Performance-based affiliate infrastructure
  - Multi-brand creator earning network
  - TDS-compliant automated payout system
  - Hosted checkout provider for no-website brands

❌ We are NOT:
  - An influencer marketing agency
  - A campaign manager
  - A website builder
  - An MLM or pyramid scheme
  - An ad network
```

---

## 2. System Architecture

### 2.1 Architecture Pattern

```
Monorepo (Turborepo + pnpm workspaces)
├── 3 Deployable Applications
└── 4 Shared Packages
```

> **Key Principle:** Apps are deployed independently. Packages are never deployed — they are consumed by apps at build time.

### 2.2 Monorepo Structure

```
nepal-affiliate-platform/
│
├── apps/
│   ├── web/                          # Next.js 14 (App Router) — Frontend
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, Register (brand & creator)
│   │   │   ├── (brand)/              # Brand dashboard routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── products/
│   │   │   │   ├── affiliates/
│   │   │   │   ├── payouts/
│   │   │   │   └── reports/
│   │   │   ├── (creator)/            # Creator dashboard routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── marketplace/
│   │   │   │   ├── earnings/
│   │   │   │   └── withdraw/
│   │   │   └── (public)/             # Public SEO pages + hosted checkout
│   │   │       ├── products/
│   │   │       └── p/[slug]/
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui primitives
│   │   │   ├── brand/                # Brand-specific components
│   │   │   ├── creator/              # Creator-specific components
│   │   │   └── shared/               # Shared across both
│   │   ├── lib/
│   │   │   ├── auth.ts               # NextAuth config
│   │   │   ├── api.ts                # API client (typed fetch wrapper)
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   ├── api/                          # Node.js + Fastify — Core Backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── brands/
│   │   │   │   ├── creators/
│   │   │   │   ├── products/
│   │   │   │   ├── commissions/
│   │   │   │   ├── payouts/
│   │   │   │   └── orders/
│   │   │   ├── plugins/              # Fastify plugins (auth, cors, rate-limit)
│   │   │   ├── queue/                # BullMQ job definitions (uses Upstash Redis)
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── balance-release.job.ts
│   │   │   │   │   ├── commission-calc.job.ts
│   │   │   │   │   ├── payout-process.job.ts
│   │   │   │   │   ├── tds-report.job.ts
│   │   │   │   │   ├── fraud-check.job.ts
│   │   │   │   │   └── email-send.job.ts
│   │   │   │   └── queue.ts          # Upstash Redis + BullMQ connection
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── tracker/                      # Lightweight click/pixel tracking service
│       ├── src/
│       │   ├── routes/
│       │   │   ├── click.ts          # GET /t/:refCode — redirect + log click
│       │   │   ├── pixel.ts          # GET /pixel.gif — JS pixel tracking
│       │   │   └── postback.ts       # POST /postback — API postback
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   ├── db/                           # Prisma — single source of truth
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts              # Export PrismaClient singleton
│   │   └── package.json
│   │
│   ├── shared/                       # Shared types, Zod schemas, constants
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── brand.ts
│   │   │   │   ├── creator.ts
│   │   │   │   ├── commission.ts
│   │   │   │   └── payout.ts
│   │   │   ├── schemas/              # Zod validation schemas
│   │   │   │   ├── brand.schema.ts
│   │   │   │   ├── creator.schema.ts
│   │   │   │   ├── product.schema.ts
│   │   │   │   └── order.schema.ts
│   │   │   └── constants/
│   │   │       ├── tds.ts            # TDS_RATE_WITH_PAN, TDS_RATE_WITHOUT_PAN
│   │   │       └── commission.ts     # PLATFORM_FEE_RATE, MIN_PAYOUT_AMOUNT
│   │   └── package.json
│   │
│   ├── email/                        # React Email templates (sent via Resend)
│   │   ├── src/
│   │   │   ├── templates/
│   │   │   │   ├── commission-earned.tsx
│   │   │   │   ├── payout-processed.tsx
│   │   │   │   ├── payout-failed.tsx
│   │   │   │   ├── brand-welcome.tsx
│   │   │   │   ├── creator-welcome.tsx
│   │   │   │   ├── order-confirmed.tsx
│   │   │   │   ├── kyc-approved.tsx
│   │   │   │   └── kyc-rejected.tsx
│   │   │   └── index.ts              # Export all templates + send helpers
│   │   └── package.json
│   │
│   └── config/                       # Shared ESLint, tsconfig, Prettier configs
│       ├── eslint/
│       ├── typescript/
│       └── package.json
│
├── turbo.json                        # Turborepo pipeline config
├── pnpm-workspace.yaml               # pnpm workspaces definition
├── .env.example                      # All required env vars documented
└── .github/
    └── workflows/
        ├── ci.yml                    # Lint + test + build on every PR
        └── deploy.yml                # Deploy on merge to main
```

### 2.3 Application Responsibilities

| App | Responsibility | Why Separate |
|---|---|---|
| `apps/web` | All UI — brand dashboard, creator dashboard, public pages, hosted checkout | SSR/SSG for SEO on public pages; route groups for user type separation |
| `apps/api` | All business logic — auth, products, orders, commissions, payouts, admin | Dedicated service; business logic should never live in Next.js API routes |
| `apps/tracker` | Click tracking, pixel events, postback handling | High-frequency traffic; must not compete with API request throughput |

### 2.4 Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend** | Next.js (App Router) | 14+ | SSR for SEO, route groups for brand/creator, edge-ready |
| **Backend API** | Node.js + Fastify | 18+ / 4.x | Faster than Express, TypeScript-first, built-in schema validation |
| **Tracker Service** | Node.js + Fastify (minimal) | 18+ | Isolated high-frequency service |
| **Database** | PostgreSQL + Prisma ORM | 15+ / 5.x | Relational model for commissions/payouts, type-safe queries, migrations |
| **Auth** | NextAuth v5 (web) + JWT (api) | v5 | Separate session handling per user type with role guards |
| **Job Queue** | BullMQ + Upstash Redis | latest | Async payout processing; Upstash = serverless Redis, no self-managed infra |
| **Email** | Resend + React Email | latest | Developer-friendly API, React templates, reliable delivery, Nepal-reachable |
| **File Storage** | Cloudflare R2 | — | Lower latency for Nepal region vs AWS S3, S3-compatible API |
| **Styling** | Tailwind CSS + shadcn/ui | 3.x | Utility-first, no custom CSS files needed |
| **Monorepo** | Turborepo + pnpm workspaces | latest | Build caching, parallel tasks, shared packages |
| **Frontend Hosting** | Vercel | — | Native Next.js deployment, edge network, zero-config |
| **Backend Hosting** | Railway | — | Docker-based deploys for API + Tracker, PostgreSQL add-on |
| **CI/CD** | GitHub Actions | — | Lint → test → build → deploy pipeline |

---

## 3. Database Design

> All models are defined in `packages/db/prisma/schema.prisma`. Both `apps/api` and `apps/tracker` import `PrismaClient` from this shared package. One schema. One migration history. No drift.

### 3.1 Prisma Schema

```prisma
// packages/db/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────────────────────────────

enum BrandStatus {
  PENDING
  APPROVED
  SUSPENDED
}

enum CreatorKycStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum ProductStatus {
  DRAFT
  ACTIVE
  PAUSED
  ARCHIVED
}

enum ProductApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  CANCELLED
  FRAUD_FLAGGED
}

enum PayoutMethod {
  ESEWA
  KHALTI
  BANK_TRANSFER
}

enum PayoutStatus {
  REQUESTED
  PROCESSING
  COMPLETED
  FAILED
}

// ─── MODELS ───────────────────────────────────────────────────────────────────

model Brand {
  id            String      @id @default(uuid())
  email         String      @unique
  passwordHash  String
  companyName   String
  logoUrl       String?
  websiteUrl    String?
  hasWebsite    Boolean     @default(false)
  panNumber     String?     // encrypted at app layer
  status        BrandStatus @default(PENDING)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  products      Product[]
  orders        Order[]
}

model Creator {
  id               String           @id @default(uuid())
  email            String           @unique
  passwordHash     String
  fullName         String
  username         String           @unique  // used in referral links
  esewaId          String?          // encrypted
  khaltiId         String?          // encrypted
  bankAccount      String?          // encrypted
  panNumber        String?          // encrypted
  kycStatus        CreatorKycStatus @default(PENDING)
  totalEarnings    Decimal          @default(0) @db.Decimal(12, 2)
  availableBalance Decimal          @default(0) @db.Decimal(12, 2)
  pendingBalance   Decimal          @default(0) @db.Decimal(12, 2)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  affiliateLinks   AffiliateLink[]
  orders           Order[]
  payoutRequests   PayoutRequest[]
}

model Product {
  id             String                @id @default(uuid())
  brandId        String
  name           String
  description    String?
  price          Decimal               @db.Decimal(12, 2)
  commissionRate Decimal               @db.Decimal(5, 2)  // e.g. 10.00 = 10%
  imageUrl       String?
  productUrl     String?               // null if isHosted = true
  slug           String?               @unique  // for hosted checkout URL
  isHosted       Boolean               @default(false)
  status         ProductStatus         @default(DRAFT)
  approvalStatus ProductApprovalStatus @default(PENDING)
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt

  brand          Brand                 @relation(fields: [brandId], references: [id])
  affiliateLinks AffiliateLink[]
  orders         Order[]
}

model AffiliateLink {
  id          String   @id @default(uuid())
  creatorId   String
  productId   String
  refCode     String   @unique  // 8-char unique code
  totalClicks Int      @default(0)
  totalSales  Int      @default(0)
  totalEarned Decimal  @default(0) @db.Decimal(12, 2)
  createdAt   DateTime @default(now())

  creator     Creator  @relation(fields: [creatorId], references: [id])
  product     Product  @relation(fields: [productId], references: [id])
  clicks      ClickEvent[]
  orders      Order[]

  @@unique([creatorId, productId])
  @@index([refCode])
}

model Order {
  id               String      @id @default(uuid())
  affiliateLinkId  String
  productId        String
  brandId          String      // denormalized for fast brand queries
  creatorId        String      // denormalized for fast creator queries
  customerName     String?     // for hosted checkout
  customerPhone    String?     // for hosted checkout
  saleAmount       Decimal     @db.Decimal(12, 2)
  commissionAmount Decimal     @db.Decimal(12, 2)
  platformFee      Decimal     @db.Decimal(12, 2)
  creatorEarning   Decimal     @db.Decimal(12, 2)
  tdsAmount        Decimal     @db.Decimal(12, 2)
  status           OrderStatus @default(PENDING)
  confirmedAt      DateTime?
  couponCode       String?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  affiliateLink    AffiliateLink @relation(fields: [affiliateLinkId], references: [id])
  product          Product       @relation(fields: [productId], references: [id])
  brand            Brand         @relation(fields: [brandId], references: [id])
  creator          Creator       @relation(fields: [creatorId], references: [id])

  @@index([brandId, status])
  @@index([creatorId, status])
}

model PayoutRequest {
  id            String       @id @default(uuid())
  creatorId     String
  amount        Decimal      @db.Decimal(12, 2)
  method        PayoutMethod
  destinationId String       // eSewa ID / Khalti ID / bank account
  tdsDeducted   Decimal      @db.Decimal(12, 2)
  netAmount     Decimal      @db.Decimal(12, 2)
  status        PayoutStatus @default(REQUESTED)
  processedAt   DateTime?
  txnReference  String?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  creator       Creator      @relation(fields: [creatorId], references: [id])
}

model ClickEvent {
  id              String   @id @default(uuid())
  affiliateLinkId String
  refCode         String
  ipHash          String   // SHA-256 hashed IP, never raw
  userAgent       String?
  referrer        String?
  cookieId        String?
  createdAt       DateTime @default(now())

  affiliateLink   AffiliateLink @relation(fields: [affiliateLinkId], references: [id])

  @@index([refCode])
  @@index([createdAt])
  @@index([ipHash, refCode])  // for dedup queries
}

model AdminUser {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  totpSecret   String   // 2FA required for all admin accounts
  createdAt    DateTime @default(now())
}
```

### 3.2 Key Index Strategy

| Index | Purpose |
|---|---|
| `AffiliateLink.refCode` | Tracker service click lookup — hit on every referral click |
| `ClickEvent(refCode)` | Fraud dedup queries — check click count per code per hour |
| `ClickEvent(ipHash, refCode)` | IP-based dedup per link |
| `ClickEvent(createdAt)` | Time-window fraud queries |
| `Order(brandId, status)` | Brand dashboard order listing with filters |
| `Order(creatorId, status)` | Creator earnings breakdown |

---

## 4. API Specification

> **Base URL:** `https://api.yourdomain.com/v1`
> **Auth:** All protected routes require `Authorization: Bearer <token>` header
> **Versioning:** URL-based versioning (`/v1/...`). Breaking changes increment to `/v2/...`

### 4.1 Standard Response Envelope

```typescript
// Success
{
  success: true,
  data: T,
  meta?: { page: number, limit: number, total: number }
}

// Error
{
  success: false,
  error: {
    code: string,      // e.g. "VALIDATION_ERROR", "NOT_FOUND", "UNAUTHORIZED"
    message: string,
    details?: unknown  // Zod validation errors in development
  }
}
```

### 4.2 Auth Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/brand/register` | Register new brand account | Public |
| `POST` | `/auth/brand/login` | Brand login → returns JWT + refresh token | Public |
| `POST` | `/auth/creator/register` | Register new creator account | Public |
| `POST` | `/auth/creator/login` | Creator login → returns JWT + refresh token | Public |
| `POST` | `/auth/refresh` | Refresh access token using refresh token cookie | Public |
| `POST` | `/auth/logout` | Invalidate refresh token | Auth |
| `POST` | `/auth/forgot-password` | Send password reset email via Resend | Public |
| `POST` | `/auth/reset-password` | Reset password with token from email | Public |

### 4.3 Brand Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/brands/me` | Get authenticated brand profile | Brand JWT |
| `PATCH` | `/brands/me` | Update brand profile, logo, website | Brand JWT |
| `GET` | `/brands/me/dashboard` | Stats: total sales, commission owed, active creators, recent orders | Brand JWT |
| `GET` | `/brands/me/products` | List all products — supports `?status=ACTIVE&page=1` | Brand JWT |
| `POST` | `/brands/me/products` | Create new product listing | Brand JWT |
| `GET` | `/brands/me/products/:id` | Get single product details | Brand JWT |
| `PATCH` | `/brands/me/products/:id` | Update product details, commission rate, status | Brand JWT |
| `DELETE` | `/brands/me/products/:id` | Archive a product (soft delete) | Brand JWT |
| `GET` | `/brands/me/orders` | List orders — supports `?status=PENDING&productId=...&from=...&to=...` | Brand JWT |
| `PATCH` | `/brands/me/orders/:id` | Confirm or cancel an order | Brand JWT |
| `GET` | `/brands/me/affiliates` | List creators promoting brand products with stats | Brand JWT |
| `GET` | `/brands/me/payouts` | Commission owed summary + TDS reports | Brand JWT |
| `GET` | `/brands/me/reports/tds` | Download TDS report as CSV — supports `?month=...&year=...` | Brand JWT |

### 4.4 Creator Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/creators/me` | Get authenticated creator profile | Creator JWT |
| `PATCH` | `/creators/me` | Update profile, payout details | Creator JWT |
| `POST` | `/creators/me/kyc` | Submit KYC documents | Creator JWT |
| `GET` | `/creators/me/dashboard` | Clicks, earnings, conversion rate, leaderboard position | Creator JWT |
| `GET` | `/creators/me/links` | List all affiliate links with stats | Creator JWT |
| `POST` | `/creators/me/links` | Generate referral link for a product | Creator JWT |
| `DELETE` | `/creators/me/links/:id` | Deactivate a referral link | Creator JWT |
| `GET` | `/creators/me/earnings` | Earnings breakdown by product/date — supports filters | Creator JWT |
| `GET` | `/creators/me/wallet` | Available balance, pending balance, payout history | Creator JWT |
| `POST` | `/creators/me/payout` | Request a withdrawal (min NPR 1,000) | Creator JWT |
| `GET` | `/creators/me/payout/:id` | Get payout request status | Creator JWT |

### 4.5 Public / Marketplace Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/products` | Paginated active products — supports `?category=&minCommission=&search=` | Public |
| `GET` | `/products/:id` | Single product details | Public |
| `GET` | `/p/:slug` | Hosted checkout page data for no-website brands | Public |
| `POST` | `/p/:slug/order` | Submit order on hosted checkout | Public |

### 4.6 Tracker Routes (`apps/tracker`)

> **Tracker Base URL:** `https://track.yourdomain.com`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/t/:refCode` | Referral link redirect — log click, set cookie, redirect to product | Public |
| `GET` | `/pixel.gif` | 1×1 GIF pixel — log event from JS snippet on brand site | Public |
| `POST` | `/postback` | Server-to-server sale confirmation from brand's website | HMAC-SHA256 signed |

### 4.7 Admin Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/admin/brands` | List all brands with approval status + filters | Admin JWT + TOTP |
| `PATCH` | `/admin/brands/:id/approve` | Approve or suspend a brand | Admin JWT |
| `GET` | `/admin/creators` | List creators with KYC status | Admin JWT |
| `PATCH` | `/admin/creators/:id/kyc` | Approve or reject KYC submission | Admin JWT |
| `GET` | `/admin/products` | List all products pending approval | Admin JWT |
| `PATCH` | `/admin/products/:id/approve` | Approve or reject product listing | Admin JWT |
| `GET` | `/admin/payouts` | List all payout requests with status filters | Admin JWT |
| `POST` | `/admin/payouts/:id/process` | Mark payout completed with txn reference | Admin JWT |
| `GET` | `/admin/orders/flagged` | List fraud-flagged orders for review | Admin JWT |
| `GET` | `/admin/stats` | Platform-wide stats: total GMV, creators, brands, commissions paid | Admin JWT |

---

## 5. Tracking System

### 5.1 Referral Link Tracking (MVP — Primary Method)

Every creator-product pair generates a unique referral link via the tracker service.

```
Link format:  https://track.yourdomain.com/t/{refCode}

Example:      https://track.yourdomain.com/t/xk29pL4m
```

**Click Flow:**

```
Creator shares link
      ↓
Customer clicks link
      ↓
tracker: GET /t/:refCode
      ↓
1. Look up AffiliateLink by refCode
2. Validate link is still ACTIVE
3. Hash IP → check dedup (Upstash Redis: incr key=`click:{refCode}:{ipHash}:{hourBucket}` TTL 1hr)
4. If not duped: write ClickEvent to PostgreSQL
5. Increment AffiliateLink.totalClicks
6. Set cookie: ref={refCode}, HttpOnly, SameSite=Lax, expires 30 days
7. 302 redirect to product URL or hosted checkout
```

**Order Attribution Flow:**

```
Customer places order (on brand site or hosted checkout)
      ↓
Read cookie: ref={refCode}
      ↓
Look up AffiliateLink by refCode
      ↓
Create Order with status=PENDING, affiliateLinkId set
      ↓
Brand confirms order via dashboard
      ↓
Commission calculation triggered
```

### 5.2 Coupon-Based Tracking (MVP — Fallback)

For brands who prefer not to use redirect links.

```
Each creator gets unique coupon code e.g. PRAYASH10
Customer applies code at brand's checkout
Brand reports which coupon was used when confirming order
Platform maps coupon code → AffiliateLink → Creator
```

Coupon codes are stored on the `Order.couponCode` field and mapped to `AffiliateLink` via a lookup at confirmation time.

### 5.3 JS Pixel Tracking (Phase 2)

A lightweight script placed on brand websites. Fires on page load and reads the referral cookie.

```html
<!-- Brand adds this snippet to their site -->
<script src="https://track.yourdomain.com/pixel.js" async></script>
```

The pixel script reads `document.cookie` for the `ref` value and fires a 1×1 GIF request:

```
GET https://track.yourdomain.com/pixel.gif?ref={refCode}&event=pageview&url={encodedUrl}
```

### 5.4 Upstash Redis — Click Deduplication

Upstash Redis is used for real-time, low-latency deduplication on every click. This offloads dedup logic from PostgreSQL entirely.

```typescript
// queue/upstash.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Click dedup check
async function isClickDuplicate(refCode: string, ipHash: string): Promise<boolean> {
  const bucket = Math.floor(Date.now() / 3600000); // 1-hour bucket
  const key = `click:dedup:${refCode}:${ipHash}:${bucket}`;
  const count = await redis.incr(key);
  await redis.expire(key, 3600); // TTL = 1 hour
  return count > 1; // duplicate if this IP already clicked this link this hour
}

// Order velocity check
async function checkOrderVelocity(ipHash: string): Promise<boolean> {
  const key = `order:velocity:${ipHash}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 600); // 10-minute window
  return count > 3; // flag if 3+ orders from same IP in 10 min
}
```

### 5.5 Fraud Detection Rules

| Rule | Logic | Phase |
|---|---|---|
| IP Click Dedup | Same IP + same link = max 1 click per hour (via Upstash Redis) | MVP |
| Cookie Dedup | Same `cookieId` counted as one unique visitor | MVP |
| Order Velocity | Flag order if same IP submits 3+ orders in 10 minutes | MVP |
| Minimum Payout | Creator must have min NPR 1,000 confirmed earnings before first withdrawal | MVP |
| KYC Gate | Withdrawals blocked until KYC verified | MVP |
| Conversion Ratio Alert | Flag creator if click-to-sale ratio is > 80% (suspicious) | Phase 2 |
| ML Anomaly Detection | Pattern-based fraud scoring on order history | Phase 3 |

---

## 6. Commission & Payout Engine

### 6.1 Commission Calculation

Commission is calculated **synchronously** when a brand confirms an order. The result is stored on the `Order` record immediately.

```typescript
// packages/shared/src/constants/commission.ts
export const PLATFORM_FEE_RATE = 0.025;       // 2.5%
export const TDS_RATE_WITH_PAN = 0.05;        // 5%
export const TDS_RATE_WITHOUT_PAN = 0.15;     // 15%
export const MIN_PAYOUT_AMOUNT = 1000;        // NPR
export const BALANCE_HOLD_DAYS = 7;           // days before pending → available

// Commission calculation function
export function calculateCommission(
  saleAmount: number,
  commissionRate: number,   // e.g. 0.10 for 10%
  hasPAN: boolean
) {
  const commission      = saleAmount * commissionRate;
  const platformFee     = commission * PLATFORM_FEE_RATE;
  const taxableAmount   = commission - platformFee;
  const tdsRate         = hasPAN ? TDS_RATE_WITH_PAN : TDS_RATE_WITHOUT_PAN;
  const tdsAmount       = taxableAmount * tdsRate;
  const creatorEarning  = taxableAmount - tdsAmount;

  return {
    commissionAmount: commission,
    platformFee,
    tdsAmount,
    creatorEarning,    // this is what gets added to creator's pendingBalance
  };
}
```

**Example with real numbers:**

```
Sale Amount:        NPR 1,000
Commission Rate:    10%
─────────────────────────────
Commission:         NPR 100.00
Platform Fee (2.5%):NPR 2.50
Taxable Amount:     NPR 97.50
TDS (5% with PAN):  NPR 4.88
Creator Earning:    NPR 92.62
Brand Pays Total:   NPR 2.50 (platform fee only, commission goes to creator)
```

### 6.2 TDS Compliance

| Scenario | Rate | Notes |
|---|---|---|
| Creator has PAN | 5% | Standard rate per Nepal IRD |
| Creator without PAN | 15% | Higher withholding rate |
| TDS Certificate | Auto-generated | PDF exported per creator at fiscal year end |
| Brand TDS Report | Monthly | CSV export per brand for their own tax filing |
| Storage | Indefinite | All TDS records retained, exportable by admin |

### 6.3 Full Payout Flow

```
Step 1:  Brand confirms order via dashboard
         → Order.status: PENDING → CONFIRMED
         → Order.confirmedAt = now()

Step 2:  Commission calculation runs synchronously
         → commissionAmount, platformFee, tdsAmount, creatorEarning saved on Order

Step 3:  creatorEarning added to Creator.pendingBalance
         → AffiliateLink.totalSales + 1
         → AffiliateLink.totalEarned += creatorEarning

Step 4:  Email sent to creator via Resend
         → Template: commission-earned
         → Shows: product name, sale amount, earning after TDS

Step 5:  BullMQ job: balance-release (runs daily)
         → Finds all CONFIRMED orders older than 7 days
         → Moves pendingBalance → availableBalance per creator

Step 6:  Creator requests withdrawal from dashboard
         → Validates: availableBalance >= 1000 NPR
         → Validates: KYC status = VERIFIED
         → Creates PayoutRequest with status = REQUESTED

Step 7:  Admin sees payout request in admin panel
         → Reviews creator details + balance
         → Transfers manually via eSewa/Khalti (MVP)
         → Enters txn reference in admin panel

Step 8:  Admin marks payout COMPLETED with txnReference
         → PayoutRequest.status = COMPLETED
         → Creator.availableBalance decremented
         → Email sent to creator via Resend (template: payout-processed)

Step 9:  On failure:
         → PayoutRequest.status = FAILED
         → Creator.availableBalance restored
         → Email sent via Resend (template: payout-failed)
         → Admin notified
```

> **MVP Note:** Steps 7–8 are manual. Phase 2 will integrate eSewa/Khalti payout APIs directly and automate via BullMQ `payout-process` job.

### 6.4 BullMQ + Upstash Redis — Queue Setup

Upstash Redis is used as the BullMQ connection backend. It requires the `ioredis`-compatible connection via `@upstash/redis` + `ioredis`.

```typescript
// apps/api/src/queue/queue.ts
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.UPSTASH_REDIS_REST_URL!, {
  password: process.env.UPSTASH_REDIS_REST_TOKEN,
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null, // required by BullMQ
});

export const balanceReleaseQueue = new Queue("balance-release", { connection });
export const emailQueue           = new Queue("email-send", { connection });
export const commissionQueue      = new Queue("commission-calc", { connection });
export const payoutQueue          = new Queue("payout-process", { connection });
export const tdsReportQueue       = new Queue("tds-report", { connection });
export const fraudCheckQueue      = new Queue("fraud-check", { connection });
```

> **Note:** Use Upstash Redis in **Production** mode (not Serverless) for BullMQ compatibility. BullMQ requires a persistent connection, which the serverless REST API does not support for workers. Use `UPSTASH_REDIS_REST_URL` format with `ioredis` adapter.

---

## 7. Frontend Requirements

### 7.1 Next.js Route Structure

```
app/
├── (auth)/
│   ├── login/                    # Shared login — detects user type, redirects
│   ├── register/
│   │   ├── brand/                # Brand registration
│   │   └── creator/              # Creator registration + username selection
│   └── forgot-password/

├── (brand)/                      # Layout: BrandShell (sidebar + header)
│   ├── layout.tsx                # Auth guard: role=BRAND required
│   ├── dashboard/                # Stats: total sales, commission owed, active creators
│   ├── products/
│   │   ├── page.tsx              # Product list with status filters
│   │   ├── new/                  # Add product form
│   │   └── [id]/                 # Edit product
│   ├── orders/                   # Order table with confirm/cancel actions
│   ├── affiliates/               # Creators promoting brand products
│   └── payouts/                  # Commission summary + TDS report download

├── (creator)/                    # Layout: CreatorShell (sidebar + header)
│   ├── layout.tsx                # Auth guard: role=CREATOR required
│   ├── dashboard/                # Clicks, earnings, conversion rate
│   ├── marketplace/              # Browse all active products
│   ├── links/                    # Active referral links + stats
│   ├── earnings/                 # Detailed earnings breakdown
│   └── wallet/                   # Balance, withdrawal request form

└── (public)/                     # No auth required
    ├── layout.tsx                # Public marketing layout
    ├── products/                 # SEO product listing (SSG/ISR)
    └── p/
        └── [slug]/               # Hosted checkout (SSR)
```

### 7.2 Key UI Components

| Component | Location | Description |
|---|---|---|
| `StatCard` | `components/shared/` | Reusable metric card with icon, value, change indicator |
| `OrderTable` | `components/brand/` | Sortable order table with confirm/cancel actions |
| `ProductForm` | `components/brand/` | Create/edit product with image upload to R2 |
| `ReferralLinkCard` | `components/creator/` | Link card with copy button, click/sale stats |
| `EarningsChart` | `components/creator/` | Recharts line chart of earnings over time |
| `WalletCard` | `components/creator/` | Available/pending balance with withdrawal button |
| `WithdrawForm` | `components/creator/` | Withdrawal request form with payout method selection |
| `ProductCard` | `components/shared/` | Marketplace product card with commission badge |
| `HostedCheckout` | `components/public/` | Order form for no-website brands |

### 7.3 Frontend Standards

| Concern | Decision |
|---|---|
| **Styling** | Tailwind CSS only — no custom CSS files |
| **Components** | shadcn/ui for base primitives |
| **State** | Zustand for client state; React Server Components for server state |
| **Forms** | React Hook Form + Zod (schemas from `packages/shared`) |
| **Data Fetching** | Server Components for initial load; SWR for real-time dashboard polling |
| **Charts** | Recharts — earnings over time, click analytics |
| **Notifications** | Sonner — toast for order confirm, payout status, link copy |
| **Tables** | TanStack Table — sortable, filterable, paginated |
| **Responsive** | Mobile-first — all dashboards functional on mobile browsers |
| **Loading States** | Suspense boundaries with skeleton components on every data fetch |

---

## 8. Backend Requirements

### 8.1 Fastify Module Structure

Every domain area follows this exact file structure:

```
src/modules/{module}/
├── {module}.routes.ts        # Fastify route registration + schema attachment
├── {module}.schema.ts        # Fastify JSON schema for request/response
├── {module}.service.ts       # Business logic — NO direct Prisma calls here
├── {module}.repository.ts    # All Prisma DB queries live here only
└── {module}.types.ts         # Module-specific TypeScript types
```

**Example: commissions module**

```typescript
// commissions.repository.ts — DB queries only
async function findPendingOrdersByBrand(brandId: string) {
  return prisma.order.findMany({ where: { brandId, status: "PENDING" } });
}

// commissions.service.ts — business logic only
async function confirmOrder(orderId: string, brandId: string) {
  const order = await commissionRepo.findById(orderId);
  if (order.brandId !== brandId) throw new ForbiddenError();
  const calc = calculateCommission(order.saleAmount, order.product.commissionRate, order.creator.panNumber !== null);
  await commissionRepo.confirmOrder(orderId, calc);
  await emailQueue.add("commission-earned", { creatorId: order.creatorId, ...calc });
}
```

### 8.2 Fastify Plugins

| Plugin | Purpose | Config |
|---|---|---|
| `@fastify/jwt` | JWT verification + decode, attaches `request.user` | Separate secrets for Brand/Creator/Admin |
| `@fastify/rate-limit` | Per-IP rate limiting | 100 req/min (API), 500 req/min (tracker) |
| `@fastify/cors` | CORS origin control | Allow only web app origin + brand pixel domains |
| `@fastify/multipart` | File uploads for KYC docs, product images | Max 5MB per file |
| `pino` | Structured JSON request logging | Ship to log aggregator in prod |
| Custom `roleGuard` | Enforce BRAND / CREATOR / ADMIN role per route group | Registered as `preHandler` |
| Custom `errorHandler` | Global error handler — maps Prisma + Zod errors to HTTP responses | Returns standard error envelope |

### 8.3 BullMQ Job Definitions

| Job Queue | Trigger | Logic |
|---|---|---|
| `balance-release` | Cron: daily at 00:00 NPT | Find orders CONFIRMED > 7 days ago with unprocessed balance; move `pendingBalance` → `availableBalance` |
| `commission-calc` | On order confirmation | Already synchronous; queue used for retry on DB failure |
| `payout-process` | Phase 2: On admin approval | Call eSewa/Khalti payout API; update PayoutRequest status |
| `tds-report-gen` | Cron: 1st of each month | Generate TDS CSV per brand for prior month; upload to R2; email link to brand |
| `fraud-check` | On each new order | Run velocity checks via Upstash Redis; flag suspicious orders |
| `email-send` | On any email trigger event | Call Resend API with React Email template; retry up to 3× on failure |

---

## 9. Email System — Resend

### 9.1 Setup

```typescript
// packages/email/src/index.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  return resend.emails.send({
    from: "Nepal Affiliate Platform <no-reply@yourdomain.com>",
    to,
    subject,
    react,
  });
}
```

### 9.2 Email Templates

All templates are React Email components in `packages/email/src/templates/`.

| Template File | Trigger | Recipients |
|---|---|---|
| `brand-welcome.tsx` | Brand account approved by admin | Brand |
| `creator-welcome.tsx` | Creator account registered | Creator |
| `commission-earned.tsx` | Order confirmed by brand | Creator |
| `order-confirmed.tsx` | Order confirmed by brand | Brand (summary) |
| `payout-processed.tsx` | Payout marked COMPLETED by admin | Creator |
| `payout-failed.tsx` | Payout marked FAILED | Creator + Admin |
| `kyc-approved.tsx` | Admin approves creator KYC | Creator |
| `kyc-rejected.tsx` | Admin rejects creator KYC | Creator |
| `tds-report-ready.tsx` | Monthly TDS report generated | Brand |
| `password-reset.tsx` | Forgot password request | Brand / Creator |

### 9.3 Email Queue Pattern

Emails are **never sent directly in request handlers**. They are always queued via BullMQ to prevent latency and allow retries.

```typescript
// In any service file — queue, don't call directly
await emailQueue.add(
  "send",
  {
    template: "commission-earned",
    to: creator.email,
    props: {
      creatorName: creator.fullName,
      productName: order.product.name,
      saleAmount: order.saleAmount,
      creatorEarning: order.creatorEarning,
      tdsAmount: order.tdsAmount,
    },
  },
  { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
);
```

### 9.4 Resend Domain Configuration

```
DNS Records required on yourdomain.com:
  SPF   → TXT record (provided by Resend)
  DKIM  → TXT record (provided by Resend)
  DMARC → TXT record: v=DMARC1; p=quarantine

Sending domain: no-reply@yourdomain.com
Reply-to:       support@yourdomain.com
```

---

## 10. Security Requirements

### 10.1 Authentication

- JWT access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days**, stored as `HttpOnly` `SameSite=Strict` cookies
- Separate JWT secrets for Brand, Creator, and Admin — tokens are **not interchangeable**
- All passwords stored as `bcrypt` hash with cost factor **12**
- Admin accounts require **TOTP (2FA)** via authenticator app — enforced on every login
- Login rate limit: **5 failed attempts** triggers a 15-minute lockout per IP (tracked in Upstash Redis)

### 10.2 Data Security

- All data encrypted in transit (TLS 1.2+)
- PostgreSQL encrypted at rest on Railway
- PAN numbers, bank account details, eSewa/Khalti IDs encrypted at **application layer** before DB write (AES-256-GCM)
- ClickEvent IPs stored as **SHA-256 hash** — never raw IP in database
- KYC documents stored in **private R2 bucket** — never publicly accessible, accessed via signed URLs
- Postback endpoint authenticated with **HMAC-SHA256 signed requests** with timestamp replay protection

### 10.3 API Security

- CORS restricted to known origins only
- All inputs validated with **Zod** before reaching service layer
- SQL injection impossible via Prisma parameterized queries
- File upload size limit: **5MB**, file type whitelist: jpg, png, pdf
- Admin routes require both JWT **and** valid TOTP code per session

### 10.4 Fraud Controls Summary

```
Click dedup:        Upstash Redis — 1 click per IP per link per hour
Order velocity:     Upstash Redis — flag if 3+ orders from same IP in 10 min
Min payout:         NPR 1,000 confirmed earnings before first withdrawal
KYC gate:           Withdrawal blocked until KYC = VERIFIED
Admin review:       All payouts reviewed manually (MVP)
Coupon uniqueness:  Coupon codes are single-use per order
```

---

## 11. Infrastructure & Environment

### 11.1 Environment Variables

```bash
# ── Database ────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://...

# ── Upstash Redis ───────────────────────────────────────────────────────────
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# ── Auth ────────────────────────────────────────────────────────────────────
JWT_SECRET=...                        # Access token secret
JWT_REFRESH_SECRET=...                # Refresh token secret
JWT_ADMIN_SECRET=...                  # Admin token secret
NEXTAUTH_SECRET=...                   # NextAuth secret (apps/web)
NEXTAUTH_URL=https://yourdomain.com   # Production URL

# ── Email — Resend ──────────────────────────────────────────────────────────
RESEND_API_KEY=re_...
EMAIL_FROM=no-reply@yourdomain.com

# ── File Storage — Cloudflare R2 ────────────────────────────────────────────
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=nepal-affiliate-platform
R2_PUBLIC_URL=https://files.yourdomain.com

# ── Payments ────────────────────────────────────────────────────────────────
ESEWA_SECRET=...
KHALTI_SECRET=...

# ── App URLs ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/v1
NEXT_PUBLIC_TRACKER_URL=https://track.yourdomain.com
API_PORT=3001
TRACKER_PORT=3002

# ── TDS Config (configurable without code change) ───────────────────────────
TDS_RATE_WITH_PAN=0.05
TDS_RATE_WITHOUT_PAN=0.15
PLATFORM_FEE_RATE=0.025
MIN_PAYOUT_AMOUNT_NPR=1000
BALANCE_HOLD_DAYS=7

# ── Postback Security ───────────────────────────────────────────────────────
POSTBACK_HMAC_SECRET=...
```

### 11.2 Deployment Targets

| Service | Platform | URL Pattern |
|---|---|---|
| `apps/web` | Vercel | `yourdomain.com` |
| `apps/api` | Railway | `api.yourdomain.com` |
| `apps/tracker` | Railway | `track.yourdomain.com` |
| PostgreSQL | Railway (managed) | Internal Railway URL |
| Redis | Upstash | REST URL provided by Upstash dashboard |
| File Storage | Cloudflare R2 | `files.yourdomain.com` (custom domain on R2) |

### 11.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml — triggered on every PR
jobs:
  ci:
    steps:
      - pnpm install
      - turbo lint          # ESLint across all apps + packages
      - turbo type-check    # tsc --noEmit across all apps
      - turbo test          # Vitest unit tests
      - turbo build         # Build all apps (Turborepo cache)

# .github/workflows/deploy.yml — triggered on merge to main
jobs:
  deploy:
    steps:
      - Vercel CLI deploy → apps/web (production)
      - Railway deploy    → apps/api (production)
      - Railway deploy    → apps/tracker (production)
      - Run smoke tests against production endpoints
```

### 11.4 Turborepo Pipeline Config

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "lint": { "outputs": [] },
    "type-check": { "outputs": [] },
    "test": { "outputs": ["coverage/**"] },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## 12. Development Standards

### 12.1 Code Standards

| Concern | Standard |
|---|---|
| **Language** | TypeScript strict mode (`"strict": true`) across all apps + packages |
| **Linting** | ESLint with shared config from `packages/config` — zero warnings allowed in CI |
| **Formatting** | Prettier with shared config — enforced via `husky` pre-commit hook |
| **Imports** | Absolute imports via `@/` alias in Next.js; package imports via workspace names |
| **Commits** | Conventional Commits: `feat:` `fix:` `chore:` `docs:` `refactor:` `test:` |
| **Branches** | `main` (production) → `develop` (staging) → `feature/{name}` (development) |
| **PRs** | Require 1 approval, zero lint errors, all tests passing before merge |

### 12.2 TypeScript Path Aliases

```json
// Each app's tsconfig.json extends packages/config/typescript/base.json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@db/*": ["../../packages/db/src/*"],
      "@shared/*": ["../../packages/shared/src/*"],
      "@email/*": ["../../packages/email/src/*"]
    }
  }
}
```

### 12.3 Testing Requirements

| Type | Tool | Scope | Threshold |
|---|---|---|---|
| **Unit** | Vitest | All service layer functions (commission calc, TDS, fraud checks) | 70% coverage (Phase 2) |
| **Integration** | Supertest | API endpoints with test database | Critical paths only (MVP) |
| **E2E** | Playwright | Register → Generate link → Place order → Confirm → Withdraw | Phase 2 |

**Priority unit tests for MVP:**

```
calculateCommission()           — all TDS scenarios
isClickDuplicate()              — Redis dedup logic
checkOrderVelocity()            — Redis velocity logic
payout request validation       — balance checks, KYC gate
refCode generation              — uniqueness + format
```

### 12.4 Error Handling Pattern

```typescript
// apps/api/src/plugins/errorHandler.ts
// All errors inherit from AppError

class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number
  ) { super(message); }
}

class NotFoundError     extends AppError { constructor(msg = "Not found")          { super("NOT_FOUND", msg, 404); } }
class ForbiddenError    extends AppError { constructor(msg = "Forbidden")          { super("FORBIDDEN", msg, 403); } }
class UnauthorizedError extends AppError { constructor(msg = "Unauthorized")       { super("UNAUTHORIZED", msg, 401); } }
class ValidationError   extends AppError { constructor(msg = "Validation failed")  { super("VALIDATION_ERROR", msg, 400); } }
class ConflictError     extends AppError { constructor(msg = "Conflict")           { super("CONFLICT", msg, 409); } }
```

---

## 13. MVP Build Scope & Timeline

### 13.1 Month-by-Month Plan

#### Month 1 — Foundation

**Backend (`apps/api`)**
- Monorepo setup: Turborepo, pnpm workspaces, shared configs
- Prisma schema: all models, migrations, seed script
- Auth module: Brand + Creator JWT registration/login, refresh tokens
- Products module: CRUD endpoints for brand products
- Upstash Redis connection setup

**Frontend (`apps/web`)**
- Auth pages: Login (brand/creator), Register (brand), Register (creator)
- Brand product management UI: list, create, edit, pause
- Basic layout: BrandShell + CreatorShell with navigation
- API client setup (typed fetch wrapper)

---

#### Month 2 — Core Tracking & Orders

**Backend (`apps/api`)**
- Referral link generation endpoint
- `apps/tracker`: click tracking, cookie setting, redirect
- Upstash Redis click dedup integration
- Order creation from hosted checkout + cookie attribution
- Commission calculation on order confirmation
- Order confirmation/cancellation endpoints for brands

**Frontend (`apps/web`)**
- Creator marketplace: browse products, generate referral link
- Creator links dashboard: click stats, copy button
- Brand orders page: order table with confirm/cancel actions
- Creator earnings view: per-product breakdown

---

#### Month 3 — Payouts & Compliance

**Backend (`apps/api`)**
- Payout request endpoint with validation (min NPR 1,000, KYC gate)
- BullMQ + Upstash: `balance-release` daily cron job
- TDS calculation baked into commission flow
- Admin payout management endpoints
- Hosted checkout order submission
- Resend integration: commission-earned, payout-processed, welcome emails
- KYC submission endpoint

**Frontend (`apps/web`)**
- Creator wallet: available/pending balance, withdrawal form
- Admin panel: brand approval, creator KYC, payout processing
- Hosted checkout page: `(public)/p/[slug]`
- Public product listing: SEO-optimized with SSG

---

#### Month 4 — Hardening & Launch

**Backend (`apps/api`)**
- Fraud detection: velocity checks, conversion ratio alerts
- Rate limiting on all endpoints
- TDS report CSV generation + R2 upload
- Security audit: encryption of sensitive fields, CORS lockdown

**Frontend (`apps/web`)**
- Mobile responsiveness pass on all dashboards
- Onboarding flows for brands and creators
- Empty states, error boundaries, loading skeletons
- Analytics: basic click/sales charts with Recharts

---

### 13.2 MVP Success Criteria

| Metric | Minimum Target |
|---|---|
| Brands onboarded | 5 approved brands with active products |
| Creators onboarded | 50 verified creators with generated referral links |
| Confirmed sales tracked | 30 confirmed orders end-to-end |
| Payouts processed | At least 1 successful payout via eSewa or Khalti |
| Brand retention | At least 2 brands re-list products for month 2 |
| Commission accuracy | Zero incorrect calculations in first 30 days |
| System uptime | 99%+ during operating hours |

---

## 14. Out of Scope (MVP)

> These features are **explicitly excluded** from MVP. Any scope creep into these areas should be flagged immediately.

- Mobile application (iOS / Android)
- JS Pixel tracking on external brand websites
- Automated eSewa / Khalti payout API integration (manual in MVP)
- Creator-to-creator referral or multi-level structure
- AI recommendation engine for creator-product matching
- Public review or rating system
- Multi-currency support (NPR only)
- Subscription tiers and recurring billing
- Agency or white-label accounts
- Brand API / postback integration
- Creator discovery or search for brands
- Advanced creator analytics beyond basic clicks and earnings
- Social login (Google/Facebook OAuth)

---

## 15. Glossary

| Term | Definition |
|---|---|
| **Affiliate Link** | Unique URL generated per creator-product pair, containing a `refCode` |
| **refCode** | 8-character unique identifier embedded in the referral link |
| **Commission Rate** | Percentage of sale amount the brand offers to creators (e.g. 10%) |
| **Platform Fee** | 2.5% deducted by the platform from each commission amount |
| **TDS** | Tax Deducted at Source — Nepal IRD requirement on commission payments |
| **pendingBalance** | Commission earned but in 7-day hold period, not yet withdrawable |
| **availableBalance** | Commission cleared and available for withdrawal request |
| **Hosted Checkout** | Platform-provided order page for brands without their own website |
| **KYC** | Know Your Customer — identity verification required before first payout |
| **BullMQ** | Redis-backed job queue for async processing (payouts, reports, emails) |
| **Upstash Redis** | Serverless Redis provider used for BullMQ queues and click deduplication |
| **Resend** | Email delivery API used for all transactional emails via React Email templates |
| **Postback** | Server-to-server sale notification sent from a brand's website to the tracker |
| **Attribution Window** | 30-day period during which a click can be credited to a sale |
| **React Email** | Library for building HTML email templates using React components |
| **Turborepo** | Build system for managing the monorepo with caching and parallel execution |
| **refCode dedup** | Preventing the same click from being counted multiple times via Redis |
| **Conversion Ratio** | Percentage of referral clicks that result in a confirmed sale |

---

## Appendix: Key Technical Decisions Log

| Decision | Choice | Reason | Alternatives Considered |
|---|---|---|---|
| Monorepo vs polyrepo | Monorepo (Turborepo) | Shared types, single migration history, one repo to manage | Separate repos — rejected due to type drift and duplication overhead |
| Redis provider | Upstash | Serverless, no infra to manage, cheap for Nepal-scale traffic | Self-hosted Redis on Railway — rejected due to ops overhead |
| Email provider | Resend | Developer-first API, React Email support, reliable delivery | SendGrid — rejected due to complexity; Mailgun — pricing |
| Job queue | BullMQ | Battle-tested, TypeScript-first, good retry/backoff support | Upstash QStash — considered for Phase 2 serverless jobs |
| Backend framework | Fastify | Faster than Express, TypeScript-first, built-in JSON schema validation | Express — rejected as slower and lacks built-in validation |
| ORM | Prisma | Type-safe queries, migrations, monorepo-friendly shared client | Drizzle ORM — considered but Prisma has better ecosystem support |
| File storage | Cloudflare R2 | No egress fees, S3-compatible, better latency for Asia | AWS S3 — more expensive; rejected for cost reasons at this scale |
| Tracker isolation | Separate service | High-frequency traffic must not compete with API | Next.js API routes — rejected; would bottleneck the frontend server |

---

*Document maintained by: Development Lead*
*Last updated: March 2026*
*Next review: After MVP launch*