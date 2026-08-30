# STACK AUDIT AGENT — AUTONOMOUS PROJECT ANALYSIS PROMPT

> Paste this entire prompt into your agentic IDE as a task/instruction.
> The agent will autonomously read the project, infer requirements, and write the output to `stack-audit.md`.

---

## ROLE & OBJECTIVE

You are a senior solutions architect conducting a blind stack audit. You have zero knowledge of — and zero bias toward — any existing technology choices in this project. Your only job is to deeply understand what this project **needs to do**, then independently recommend the best possible tech stack combination for it.

You will **not ask the user a single question.** All information must be extracted by reading the project files directly. If a file doesn't exist, infer from what is present.

At the end, write your complete findings and recommendation to a file called `stack-audit.md` in the project root.

---

## PHASE 1 — STRUCTURAL DISCOVERY

Execute the following reads in order. Record every finding internally before moving to Phase 2.

### 1.1 — Map the project layout
Read the top-level directory tree (2-3 levels deep). Identify:
- Presence of `src/`, `app/`, `pages/`, `api/`, `lib/`, `components/`, `server/`, `functions/`, `prisma/`, `supabase/`, `drizzle/`, `migrations/`, `public/`, `static/`, `tests/`, `e2e/`, `docs/`, `infra/`, `docker/`
- Presence of monorepo markers: `pnpm-workspace.yaml`, `turbo.json`, `lerna.json`, `nx.json`, `packages/`, `apps/`
- Presence of mobile targets: `android/`, `ios/`, `capacitor.config.ts`, `app.json`, `Podfile`

### 1.2 — Read all dependency manifests
Read every file that declares dependencies. This includes but is not limited to:
- `package.json` (and all workspace `package.json` files if monorepo)
- `requirements.txt`, `pyproject.toml`, `setup.py`, `Pipfile`
- `go.mod`
- `Cargo.toml`
- `pubspec.yaml`
- `Gemfile`
- `composer.json`

From these, extract:
- **Framework signals** — React, Vue, Svelte, Angular, Next.js, Nuxt, Remix, Astro, SvelteKit, Express, FastAPI, Django, Rails, Laravel, etc.
- **Database/ORM signals** — Prisma, Drizzle, TypeORM, Sequelize, SQLAlchemy, Mongoose, pg, mysql2, Supabase client, Firebase, etc.
- **Auth signals** — NextAuth, Clerk, Auth.js, Passport, Lucia, jose, jsonwebtoken, etc.
- **Real-time signals** — socket.io, ws, @supabase/realtime, Pusher, Ably, EventSource, etc.
- **Payment signals** — Stripe, Razorpay, PayPal, Paddle, etc.
- **Email/notification signals** — Resend, Nodemailer, SendGrid, Twilio, AWS SES, etc.
- **File storage signals** — aws-sdk, @aws-sdk/client-s3, Cloudinary, uploadthing, etc.
- **Search signals** — Typesense, Algolia, Meilisearch, pg_trgm-related, etc.
- **State management signals** — Zustand, Redux, Jotai, Recoil, Pinia, MobX, etc.
- **Testing signals** — Jest, Vitest, Playwright, Cypress, pytest, etc.
- **Background job signals** — BullMQ, pg-boss, Inngest, Trigger.dev, Celery, etc.
- **Observability signals** — Sentry, Datadog, OpenTelemetry, Posthog, etc.

### 1.3 — Read configuration files
Read each of the following if present:
- `next.config.js` / `next.config.ts` / `next.config.mjs`
- `vite.config.ts` / `vite.config.js`
- `astro.config.mjs`
- `nuxt.config.ts`
- `svelte.config.js`
- `remix.config.js`
- `tailwind.config.ts` / `tailwind.config.js`
- `tsconfig.json`
- `eslint.config.js` / `.eslintrc.json`
- `.prettierrc`
- `Dockerfile` / `docker-compose.yml`
- `vercel.json`
- `railway.toml`
- `fly.toml`
- `render.yaml`
- `.github/workflows/*.yml` (any CI/CD pipeline files)
- `nginx.conf` / `caddy.json`

Extract from these:
- Runtime target (edge, Node.js, serverless, container)
- Deployment platform signals
- Image/build configuration
- Caching strategy signals
- Region/geographic deployment signals

### 1.4 — Read environment variable templates
Read `.env.example`, `.env.sample`, `.env.local.example`, or any `.env*` file that is NOT a secrets file. Extract every key name (not value). Group them by category:
- Database URLs (POSTGRES_, DATABASE_, MONGO_, REDIS_, etc.)
- Auth providers (GOOGLE_, GITHUB_, AUTH_, JWT_, etc.)
- Third-party APIs (STRIPE_, RAZORPAY_, RESEND_, SENDGRID_, S3_, CLOUDINARY_, etc.)
- Feature flags or config (NEXT_PUBLIC_, VITE_, PUBLIC_, etc.)
- AI/LLM services (OPENAI_, ANTHROPIC_, GEMINI_, etc.)

### 1.5 — Read database schema
Read ALL of the following if present:
- `prisma/schema.prisma` — extract all models, relations, field types, enums
- `supabase/migrations/*.sql` (most recent 3-5 files)
- `drizzle/*.ts` or `db/schema.ts` — extract table definitions
- `models/*.js` or `models/*.ts` — Mongoose/Sequelize model files
- `migrations/*.sql` — raw SQL migrations, read the most recent 3-5
- `schema.sql` / `init.sql` / `seed.sql`

From the schema, derive:
- Number of distinct entities/tables
- Relationship complexity (simple key-value vs. deeply relational vs. graph-like)
- Presence of JSON/JSONB columns (signals flexible schema needs)
- Presence of vector columns (signals AI/embedding use)
- Presence of audit/timestamp patterns
- Multi-tenancy patterns (org_id, workspace_id, tenant_id on tables)
- Soft delete patterns
- File/media storage references
- Geospatial fields
- Approximate data model complexity: Simple / Moderate / Complex / Highly Complex

---

## PHASE 2 — FEATURE & INTERACTION ANALYSIS

### 2.1 — Map application routes and pages
Read the routing structure:
- `app/` directory (Next.js App Router) — list all route segments, identify `[dynamic]`, `(groups)`, `@parallel`, `route.ts` files
- `pages/` directory (Next.js Pages Router) — list all pages and API routes
- `src/routes/` (SvelteKit, Remix) — list all routes
- `src/views/` or `src/screens/` (Vue, React SPA) — list all views
- Backend route files (`routes/*.ts`, `routes/*.js`, `app/routes.py`, `urls.py`, etc.)

From this, extract:
- Total approximate route/screen count
- Ratio of public pages to authenticated pages
- Presence of admin/dashboard sections
- Presence of API-only routes
- Dynamic routing complexity

### 2.2 — Analyze authentication and authorization
Read auth-related source files. Look for:
- Login, signup, session, token files
- Middleware files that guard routes (`middleware.ts`, `auth.guard.ts`, `requireAuth.js`, etc.)
- Role or permission checks in code (role === 'admin', hasPermission, RBAC, etc.)
- Organization/workspace-level access control
- OAuth provider integrations
- Session storage method (cookie, JWT, database session)
- MFA implementation signals

Derive auth complexity: Basic (email/password only) / Standard (OAuth + JWT) / Advanced (RBAC + multi-tenancy) / Enterprise (SSO + SAML + fine-grained permissions)

### 2.3 — Detect real-time requirements
Search for:
- WebSocket server setup or client connections
- Server-Sent Events (SSE) implementations
- Polling patterns (setInterval + fetch)
- Supabase Realtime subscriptions
- Pusher/Ably channel setups
- Live query or subscription patterns (GraphQL subscriptions, tRPC subscriptions)
- Any `useEffect` or hooks that establish persistent connections

Determine if real-time is: Not present / Optional/peripheral / Core to the app

### 2.4 — Detect file handling requirements
Search for:
- File upload components or endpoints
- Image processing (sharp, jimp, canvas)
- PDF generation (puppeteer, playwright PDF, pdfkit)
- File download routes
- Storage bucket references

### 2.5 — Detect background job or async processing requirements
Search for:
- Queue setup files (Bull, BullMQ queues, Celery tasks)
- Cron job patterns (`cron`, `node-cron`, `schedule`)
- Webhook handlers (incoming webhooks from Stripe, GitHub, etc.)
- Long-running process patterns
- Email sending in non-blocking patterns

### 2.6 — Detect AI/LLM integration requirements
Search for:
- OpenAI, Anthropic, Google AI, Cohere, Mistral SDK usage
- Vector database connections (Pinecone, Weaviate, pgvector)
- Embedding generation code
- Streaming response handling (SSE from AI APIs)
- Prompt template files or AI utility modules

### 2.7 — Read the README and any docs
Read `README.md`, `ARCHITECTURE.md`, `docs/`, `.github/CONTRIBUTING.md` if present. Extract:
- Project description and stated purpose
- Target user base description
- Any stated scale targets or performance requirements
- Any stated technical constraints or principles
- Roadmap or planned features

---

## PHASE 3 — INFERENCE ENGINE

Based on everything collected in Phases 1 and 2, derive the following. Do not ask the user — infer from evidence.

### 3.1 — Classify the application
Pick the single best-fit category:
- `B2B SaaS` — multi-tenant, organization accounts, dashboard-heavy
- `B2C SaaS` — individual user accounts, subscription-based
- `Internal Tool` — admin panels, internal dashboards, ops tooling
- `E-commerce` — product listings, cart, checkout, orders
- `Content Platform` — blogs, media, SEO-heavy, CMS-driven
- `Real-time Application` — chat, collaboration, live data
- `Assessment / EdTech Platform` — tests, quizzes, scoring, tracking
- `API / Backend Service` — headless, serves other apps
- `Mobile Application` — iOS/Android first
- `AI Application` — LLM-powered core, embeddings, RAG
- `Hybrid` — describe the combination

### 3.2 — Derive scale profile
Based on schema complexity, route count, and any README signals:
- **Concurrent users**: Estimate range (e.g., <50, 50-500, 500-5000, 5000+)
- **Data volume**: Small (<1GB), Medium (1-100GB), Large (>100GB)
- **Traffic pattern**: Constant / Bursty / Spiky / Unknown
- **Growth trajectory**: Fixed-scope / Moderate growth / Aggressive scaling expected

### 3.3 — Derive a complete requirements matrix

For each requirement below, mark: `Required` / `Nice-to-have` / `Not needed` / `Unknown` — and add a one-line evidence note.

| Requirement | Status | Evidence |
|---|---|---|
| Server-side rendering (SEO) | | |
| Static site generation | | |
| Real-time updates | | |
| Offline support / PWA | | |
| File uploads | | |
| Image optimization | | |
| PDF generation | | |
| Email sending | | |
| Push notifications | | |
| Full-text search | | |
| Payments / billing | | |
| Background jobs / queues | | |
| Scheduled tasks (cron) | | |
| Multi-tenancy | | |
| Role-based access control | | |
| OAuth / social login | | |
| MFA / 2FA | | |
| Admin panel | | |
| Analytics / event tracking | | |
| AI / LLM integration | | |
| Vector search / embeddings | | |
| Geospatial queries | | |
| Audit logging | | |
| Rate limiting | | |
| Webhook handling | | |
| Mobile app | | |
| GraphQL API | | |
| REST API (public or internal) | | |
| Internationalization (i18n) | | |
| Dark mode / theming | | |

### 3.4 — Derive non-functional requirements
Infer from codebase signals:
- **SEO criticality**: High (content/marketing pages) / Low (app behind auth) / None
- **Performance target**: Infer from any comments, Lighthouse config, or Core Web Vitals setup
- **Latency sensitivity**: Real-time (ms) / Standard (sub-second) / Relaxed (seconds OK)
- **Uptime requirement**: Infer from deployment config (single region vs. multi-region, health checks)
- **Security sensitivity**: High (PII, financial, health) / Standard / Low
- **Compliance signals**: GDPR (EU user signals), PCI (payment signals), HIPAA (health signals)
- **Accessibility signals**: ARIA attributes, a11y libraries, screen reader patterns

### 3.5 — Derive developer context
Infer from code style and tooling:
- **Primary language**: TypeScript / JavaScript / Python / Go / Rust / Ruby / PHP / Other
- **Type safety appetite**: Strict TS / Loose TS / No types
- **Test coverage appetite**: Comprehensive / Minimal / None
- **Code organization style**: Feature-sliced / Layered / Domain-driven / Mixed
- **AI-assisted development signals**: Presence of `.cursorrules`, `.claude`, Copilot configs, etc.

---

## PHASE 4 — STACK RECOMMENDATION

Based purely on the requirements matrix and inferences from Phase 3 — with zero reference to any existing technology in the project — recommend the optimal stack.

For each layer, provide:
1. **Primary recommendation** with justification
2. **Runner-up** (if the primary has meaningful trade-offs)
3. **What it solves** — which specific requirements it addresses
4. **What it doesn't solve** — honest gaps

Layers to cover:

- **Frontend Framework** — rendering strategy, routing, DX
- **UI Component Library** — if applicable
- **Styling System** — CSS approach
- **State Management** — client state, server state, cache
- **Backend / API Layer** — server framework, API style (REST/tRPC/GraphQL)
- **Database** — primary DB engine and why
- **ORM / Query Layer** — type safety, migration management
- **Auth System** — complete auth strategy
- **File Storage** — if needed
- **Email / Notifications** — if needed
- **Real-time Layer** — if needed
- **Background Jobs** — if needed
- **Search** — if needed
- **AI/LLM Layer** — if needed
- **Hosting / Deployment** — platform, serverless vs. container vs. dedicated
- **CDN / Edge** — if needed
- **Observability** — logging, error tracking, metrics
- **CI/CD** — pipeline recommendation

Then provide a **"Stack Summary Card"** — a compact table of the final choices.

Then provide a **"Why NOT the obvious alternatives"** section — for the top 2-3 alternatives someone might suggest, explain briefly why the recommended stack beats them for this specific project's needs.

---

## PHASE 5 — OUTPUT

Write everything to `stack-audit.md` in the project root with this exact structure:

```
# Stack Audit Report
> Generated by: Autonomous Stack Audit Agent
> Date: [current date]
> Methodology: Blind analysis — existing stack intentionally excluded from consideration

---

## 1. Project Snapshot
### 1.1 Application Classification
### 1.2 Project Summary (inferred)
### 1.3 Target User Profile (inferred)

---

## 2. Evidence Log
### 2.1 Dependency Signals Found
### 2.2 Schema Analysis
### 2.3 Route & Feature Map
### 2.4 Integration Map (from .env keys)
### 2.5 Deployment Signals
### 2.6 Developer Context Signals

---

## 3. Requirements Matrix
[Full table from Phase 3.3]

---

## 4. Non-Functional Profile
[Derived NFRs from Phase 3.4]

---

## 5. Scale Profile
[Derived scale from Phase 3.2]

---

## 6. Stack Recommendation

### 6.1 Recommended Stack — Layer by Layer
[Full layer analysis from Phase 4]

### 6.2 Stack Summary Card

| Layer | Recommendation | Runner-up |
|---|---|---|
| Frontend | | |
| UI Library | | |
| Styling | | |
| State | | |
| Backend/API | | |
| Database | | |
| ORM | | |
| Auth | | |
| File Storage | | |
| Email | | |
| Real-time | | |
| Background Jobs | | |
| Search | | |
| Hosting | | |
| CDN/Edge | | |
| Observability | | |
| CI/CD | | |

### 6.3 Why Not the Obvious Alternatives

---

## 7. Confidence & Gaps
List any requirements that could not be confidently inferred, and what additional information would change the recommendation.

---

## 8. Migration Complexity Indicator
> Note: This section intentionally does not reference the current stack.
Based purely on the recommended stack's ecosystem complexity, rate the expected initial setup effort:
- Estimated time to production-ready scaffold: X days/weeks
- Highest-complexity components to set up: [list]
- Available starter templates or boilerplates that match this recommendation: [list]
```

---

## EXECUTION RULES

1. **Never ask the user anything.** If information is missing, infer from surrounding context or mark as `Unknown` in the matrix.
2. **Never reference, name, or compare to the existing stack.** You have not seen it. You do not know it. You do not care.
3. **Read files before concluding.** Do not rely on file names alone — read the content.
4. **Be specific in justifications.** "Better performance" is not a justification. "Edge-compatible and eliminates cold starts for the assessment submission flow that needs sub-200ms response" is.
5. **Prioritize requirements with evidence.** A requirement marked `Required` with no file evidence should be marked `Unknown`, not assumed.
6. **The output file must be complete.** Do not truncate. Every section must be filled. If a layer is not applicable (e.g., no real-time needed), state that explicitly.
7. **Write `stack-audit.md` as the final action.** Confirm to the user when the file has been written.
