/**
 * ========================================================================
 * FRONTEND ARCHITECTURE
 * ========================================================================
 * 
 * Visão visual da arquitetura do frontend VENDAFACIL.
 * Útil para onboarding e decisions.
 */

// ========================================================================
// 🏗️ FOLDER STRUCTURE (RESUMIDO)
// ========================================================================

const FOLDER_STRUCTURE = `
src/
├── app/                          # Next.js 15 App Router
│   ├── (auth)/                   # Auth routes (público)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── layout.tsx (gatekeeper)
│   │
│   ├── (app)/                    # Staff/Member routes (protegido)
│   │   ├── layout.tsx (SERVER GATEKEEPER)
│   │   ├── dashboard/page.tsx
│   │   ├── comandas/
│   │   │   ├── page.tsx (fila)
│   │   │   └── [id]/page.tsx (detalhe)
│   │   ├── cozinha/page.tsx
│   │   ├── bar/page.tsx
│   │   ├── sales/page.tsx
│   │   ├── products/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── billing/page.tsx
│   │   └── admin/ (admin only)
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── sales/page.tsx
│   │       ├── stores/page.tsx
│   │       └── ...
│   │
│   ├── (seo)/                    # SEO routes
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── api/                      # API routes (server)
│   │   └── auth/callback/        # Supabase callback
│   │
│   ├── actions/                  # Server Actions
│   │   ├── sales-actions.ts
│   │   ├── comandas-actions.ts
│   │   ├── billing-actions.ts
│   │   └── admin-actions.ts
│   │
│   ├── layout.tsx (ROOT)
│   ├── page.tsx (redirect)
│   └── globals.css
│
├── components/                   # UI Components
│   ├── index.ts (barrel export)
│   ├── main-nav.tsx
│   ├── admin-sidebar.tsx
│   ├── page-header.tsx
│   ├── date-range-picker.tsx
│   ├── charts.tsx
│   ├── auth-provider.tsx
│   ├── comandas/
│   │   └── create-comanda-dialog.tsx
│   ├── receipt/
│   ├── ui/ (Radix UI + shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── seo/
│
├── hooks/                        # Custom Hooks
│   ├── index.ts (barrel export)
│   ├── use-toast.ts
│   ├── use-mobile.tsx
│   ├── use-entitlements.ts
│   └── use-realtime-notifications.ts
│
├── lib/                          # Utilities & Configuration
│   ├── types.ts (definição de tipos)
│   ├── guards.ts (roteamento)
│   ├── utils.ts (helpers)
│   ├── plan-label.ts
│   ├── print-receipt.ts
│   ├── data.ts (mock data)
│   ├── FRONTEND_STATUS.ts (doc)
│   ├── supabase/
│   │   ├── server.ts (SSR client)
│   │   ├── client.ts (realtime)
│   │   ├── admin.ts (backend)
│   │   └── database.types.ts (auto-gen)
│   └── analytics/
│
├── middleware.ts                 # Session verification
│
└── next-env.d.ts

// ========================================================================
// 🔄 DATA FLOW DIAGRAM
// ========================================================================

User Action (frontend)
         ↓
   Client Component
  (useState, events)
         ↓
   Server Action
  (Auth + RLS check)
         ↓
   Supabase Database
  (Insert/Update/Query)
         ↓
   Response (ActionResponse<T>)
         ↓
   UI Update / Toast
         ↓
   [REALTIME] Supabase notifica outros clientes
         ↓
   toast notification aparece


// ========================================================================
// 🏛️ LAYER ARCHITECTURE
// ========================================================================

┌─────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                     │
│  Next.js Pages (Server Components) + UI (Client)        │
│  Responsibility: Render, handle events, show feedback   │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│              BUSINESS LOGIC LAYER                       │
│  Server Actions + Custom Hooks                          │
│  Responsibility: Validate, transform, coordinate        │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│               DATA ACCESS LAYER                         │
│  Supabase Client (server.ts + client.ts)                │
│  Responsibility: Query, subscribe, RLS enforcement      │
└──────────────────┬──────────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────────┐
│            EXTERNAL SERVICES                            │
│  Supabase Database + Auth + Realtime                     │
│  Google Genkit (AI)                                      │
│  Firebase (future)                                       │
└─────────────────────────────────────────────────────────┘


// ========================================================================
// 🔐 SECURITY LAYERS
// ========================================================================

Authentication Layer:
  ✅ Supabase Auth (JWT + cookies)
  ✅ Middleware refresh automático
  ✅ Server Components só rendem se autenticado

Authorization Layer:
  ✅ R.L.S (Row Level Security) em TODAS as tables
  ✅ Guards.ts (determinístico)
  ✅ Role-based: is_admin, is_member

Session Layer:
  ✅ Cookie refresh em cada request
  ✅ CSRF protection (Next.js built-in)
  ✅ Headers validation


// ========================================================================
// 📊 STATE MANAGEMENT STRATEGY
// ========================================================================

Global State (Context API):
  - AuthProvider
    - user
    - store
    - storeStatus
    - products
    - sales
    - customers
    
  → Read-only, refresh via Server Components

Local State (React Hooks):
  - Componentes descristos: useState para UI state
  - Exemplos:
    - Modal open/close
    - Form inputs
    - Loading states
    - Toast notifications

Server State (Supabase):
  - Single source of truth
  - RLS enforced
  - Realtime subscriptions
  - Zero-trust backend

Cache Strategy:
  - Dashboard: revalidar a cada 30s (SWR)
  - Comandas: realtime (websocket)
  - Products: cache com refetch manual


// ========================================================================
// 🚀 DEPLOYMENT TARGETS
// ========================================================================

Staging:
  - Deploy: Vercel (frontend) + Supabase (backend)
  - Env: staging-env
  - URL: staging.vendafacil.com
  - Database: staging (separate instance)

Production:
  - Deploy: Vercel + Supabase
  - Env: production-env
  - URL: app.vendafacil.com
  - Database: production (backup 3x/dia)

Performance:
  - Bundle: ~180KB (gzipped)
  - Load: ~1.2s homepage
  - Lighthouse: 85+ (target)
  - Core Web Vitals: Green


// ========================================================================
// 🧪 TESTING STRATEGY (TODO)
// ========================================================================

Unit Tests (Vitest):
  - Guards.routeByStoreStatus()
  - Helpers (isValidCnpj, formatCurrency)
  - Hooks behavior

Integration Tests (Playwright):
  - Auth: signup → login → logout
  - Comandas: create → update → close
  - PDV: add item → finalize → print

E2E Tests:
  - Full user journey (onboarding → operations)
  - Admin operations
  - Error handling


// ========================================================================
// 📈 MONITORING & LOGGING
// ========================================================================

Client Logs:
  - Console: [GATEKEEPER], [SERVER_ACTION], etc
  - Toast: User feedback (errors, success)
  - Error Boundary: Catch React errors

Backend Logs (Supabase):
  - RLS violations
  - Auth failures
  - Database errors

Monitoring (TODO):
  - Sentry: Error tracking
  - LogRocket: Session replay
  - DataDog: Performance monitoring


// ========================================================================
// 🔄 REALTIME SYNC FLOW
// ========================================================================

1. Client A: Create comanda
   ↓
2. Server Action: Insert into DB
   ↓
3. Supabase: Trigger change event
   ↓
4. Websocket: Notifica Clients B, C...
   ↓
5. useRealtimeNotifications hook: Mostra toast
   ↓
6. UI re-render com dados novos
   ↓
7. Todos os clientes sincronizados ✅


// ========================================================================
// 🎯 PERFORMANCE OPTIMIZATIONS
// ========================================================================

Rendering:
  ✅ Server Components por default
  ✅ Client Components isolados (use 'use client')
  ✅ Dynamic imports para modais/charts

Caching:
  ✅ NextJS ISR (Incremental Static Revalidation)
  ✅ Browser cache (Cache-Control headers)
  ✅ SWR para dados mutáveis

Code Splitting:
  ✅ Route-based splitting (automático no App Router)
  ✅ Component lazy loading

Network:
  ✅ API routes (no CORS)
  ✅ Server Components (fetch no server)


// ========================================================================
// 📚 DECISION LOG
// ========================================================================

Decision 1: Server Components como padrão
  Rationale: Menos JS no cliente, auth no server, dados frescos
  Trade-off: Menos interatividade em alguns places
  
Decision 2: Guards determinísticos (guards.ts)
  Rationale: Roteamento consistente, testável, sem magic
  Trade-off: Mais verbose que middleware
  
Decision 3: Supabase realtime vs polling
  Rationale: Melhor UX (instant updates), mais simples que websockets
  Trade-off: Mais conexões abertas
  
Decision 4: Barrel exports (index.ts)
  Rationale: Imports limpos, refactoring fácil
  Trade-off: Slight increase em bundle (negligível com tree-shaking)


// ========================================================================
// 🔮 FUTURE IMPROVEMENTS
// ========================================================================

Phase 2 (Próximo mês):
  - PWA + offline support
  - Mobile app (React Native)
  - Advanced analytics (BigQuery)
  - Webhook integrations (Zapier, etc)

Phase 3 (2-3 meses):
  - Multi-tenant platform improvements
  - Advanced AI features
  - Mobile app iOS/Android
  - API public (para integrações)

Phase 4 (Quarter seguinte):
  - White label
  - Advanced reporting
  - Inventory forecasting
  - Staff performance tracking
`;

export const ARCHITECTURE_DOC = FOLDER_STRUCTURE;
export const LAST_UPDATED = new Date().toISOString();
