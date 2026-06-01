# 🥬 Ice Cream IMS v4.0 — Structured Edition

A production-ready Inventory Management System rebuilt from a monolithic HTML file into a
**React + TypeScript** application with **Angular-style architecture**, **Supabase** backend,
and **Playwright POM** for end-to-end testing.

---

## 🏗️ Architecture Overview

```
Angular-Inspired Layers            React Rendering
────────────────────────────       ────────────────────
  Core Module                      Components
  ├── Services (singleton)    →    ├── UI (Button, Modal, …)
  ├── Guards (AuthGuard)      →    ├── Layout (Sidebar, Navbar)
  ├── Providers (AppStore)    →    └── Features (pages)
  └── Supabase client
                                   State Management
  Shared Module               →    Zustand + React Query
  ├── Types
  ├── Hooks
  └── Components

  POM Layer (Testing)
  └── BasePage → LoginPagePOM
              → DashboardPagePOM
              → InventoryPagePOM
              → SalesPagePOM
              → OrdersPagePOM
              → SettingsPagePOM
```

---

## 📁 Project Structure

```
lettuce-ims/
├── e2e/
│   └── lettuce-ims.spec.ts         # Playwright e2e tests (uses POM)
├── supabase/
│   └── schema.sql                  # Full DB schema with RLS policies
├── src/
│   ├── app/
│   │   ├── core/                   # ── CORE MODULE (Angular equiv.) ──
│   │   │   ├── supabase/
│   │   │   │   └── client.ts       # Singleton Supabase client
│   │   │   ├── services/           # Angular-style class services
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── InventoryService.ts
│   │   │   │   ├── SalesService.ts
│   │   │   │   ├── OrdersService.ts
│   │   │   │   ├── SettingsService.ts
│   │   │   │   └── index.ts        # Barrel export
│   │   │   ├── guards/
│   │   │   │   └── AuthGuard.tsx   # CanActivate equivalent
│   │   │   └── providers/
│   │   │       ├── AppStore.ts     # Zustand global store
│   │   │       └── AppProvider.tsx # APP_INITIALIZER equivalent
│   │   ├── shared/                 # ── SHARED MODULE ──
│   │   │   ├── types/
│   │   │   │   └── index.ts        # Single source of truth for types
│   │   │   ├── hooks/
│   │   │   │   └── index.ts        # useToast, usePagination, useSort…
│   │   │   └── components/
│   │   │       ├── ui/             # Reusable atoms
│   │   │       │   ├── Button/
│   │   │       │   ├── Modal/
│   │   │       │   ├── Toast/
│   │   │       │   ├── DataTable/
│   │   │       │   └── StatusBadge/
│   │   │       └── layout/         # Layout organisms
│   │   │           ├── Sidebar/
│   │   │           └── Navbar/
│   │   └── features/               # ── FEATURE MODULES ──
│   │       ├── auth/               # Login
│   │       ├── dashboard/          # Analytics + charts
│   │       ├── inventory/          # CRUD inventory
│   │       ├── sales/              # Sales transactions
│   │       ├── orders/             # Order management
│   │       └── settings/           # App configuration
│   ├── pom/                        # ── PAGE OBJECT MODELS ──
│   │   ├── BasePage.pom.ts
│   │   ├── LoginPage.pom.ts
│   │   ├── InventoryPage.pom.ts
│   │   ├── PageObjects.pom.ts      # Dashboard/Sales/Orders/Settings POMs
│   │   └── index.ts
│   ├── styles/
│   │   ├── variables.css           # Design token CSS vars (light + dark)
│   │   └── globals.css             # Resets + layout + shared styles
│   ├── App.tsx                     # Root router + AppShell layout
│   └── main.tsx
├── .env.example
├── package.json
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone <repo-url> lettuce-ims
cd lettuce-ims
npm install
```

### 2. Configure Supabase
```bash
cp .env.example .env
# Edit .env with your Supabase URL and anon key
```

### 3. Set up database
1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Open **SQL Editor → New Query**
4. Paste and run the contents of `supabase/schema.sql`

### 4. Create a user
In Supabase: **Authentication → Users → Add user** (or use the Sign Up API).

### 5. Run dev server
```bash
npm run dev
# → http://localhost:3000
```

---

## 🧪 Testing

### Run e2e tests
```bash
# Set test credentials in .env
TEST_EMAIL=your@email.com
TEST_PASSWORD=yourpassword

npm run test:e2e
npm run test:e2e:ui   # Interactive UI mode
```

### Unit tests
```bash
npm test
```

---

## 🧩 Angular-Style Architecture Patterns Used

| Angular Pattern         | Implementation Here                          |
|-------------------------|----------------------------------------------|
| `NgModule`              | Barrel `index.ts` in `core/`, `shared/`      |
| `Injectable` Service    | TypeScript class + singleton export          |
| `providedIn: 'root'`    | Module-level `const service = new Service()` |
| `CanActivate` Guard     | `AuthGuard.tsx` HOC wrapping `<Route>`       |
| `APP_INITIALIZER`       | `AppProvider.tsx` bootstrap `useEffect`      |
| `BehaviorSubject` Store | Zustand store in `AppStore.ts`               |
| `OnPush` Change Detect  | React Query + Zustand selective subscriptions|
| DI Constructor          | Service constructors accept `SupabaseClient` |

---

## 🔒 Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- Each farm's data is isolated to its owner via `auth.uid()` policies
- JWT session managed by Supabase Auth SDK
- No raw SQL; all queries via type-safe Supabase client
- Passwords managed entirely by Supabase Auth (bcrypt)

---

## 📊 Supabase Schema

| Table             | Key Columns                                         |
|-------------------|-----------------------------------------------------|
| `farms`           | id, name, owner_id (FK → auth.users)                |
| `inventory_items` | farm_id, name, quantity, price, total_value (computed), status |
| `sales`           | farm_id, transaction_id, quantity_sold, total_amount (computed) |
| `orders`          | farm_id, customer_name, quantity, total_price (computed), status |
| `app_settings`    | farm_id (unique), app_name, low_stock_threshold, custom_columns (JSONB) |

---

## 🎨 Theming

All colors are CSS custom properties in `src/styles/variables.css`.
Dark mode is applied by toggling the `dark-mode` class on `<body>`,
persisted to `localStorage` via Zustand.

---

## 📦 Key Dependencies

| Package              | Purpose                                      |
|----------------------|----------------------------------------------|
| `react` 18           | UI rendering                                 |
| `@supabase/supabase-js` | Database, Auth, realtime                  |
| `@tanstack/react-query` | Server state, caching, background refetch |
| `zustand`            | Client/global state                          |
| `react-router-dom` 6 | Client-side routing                          |
| `chart.js` + `react-chartjs-2` | Dashboard analytics charts        |
| `@playwright/test`   | E2E testing                                  |
| `vite`               | Build tool                                   |
