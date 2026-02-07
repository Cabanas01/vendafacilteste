/**
 * ========================================================================
 * FRONTEND DATA FLOW DIAGRAMS (ASCII)
 * ========================================================================
 * 
 * Visual representation of key flows in VENDAFACIL frontend.
 * Useful for understanding request/response patterns.
 */

// ========================================================================
// 📋 FLOW 1: AUTH & BOOTSTRAP
// ========================================================================

const AUTH_FLOW = `

┌─────────────────────────────────────────────────────────────────┐
│ 1. User visits /dashboard                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    [Server Component]
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ↓                ↓                ↓
   [Auth check]    [Bootstrap check]  [Redirect]
        │                │                │
     JWT in          get_user_          → /login (not auth)
    cookies?       bootstrap_status()   → /onboarding (new)
        │                │              → /billing (expired)
        │           has_store?          → /admin (admin)
        │           is_member?          → /dashboard (ok)
        │           is_admin?
        │                │
        └────────────────┴────────────────┐
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                [Server Component RENDERS]    [Error Boundary]
                    │                               │
                    ↓                               ↓
        ┌──────────────────┐            ┌──────────────────┐
        │                  │            │   Error Page     │
        │ Children/Layout  │            │   Logged to      │
        │ (Protected)      │            │   console:       │
        │                  │            │ [GATEKEEPER_     │
        │ ✅ Can now use   │            │  FAILED]         │
        │ useAuth()        │            │                  │
        │ Server fetch()   │            └──────────────────┘
        │                  │
        └──────────────────┘

Result:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If user is:
✅ Authenticated → Serve protected page
❌ Not authenticated → Redirect to /login
❌ New user → Redirect to /onboarding
❌ Plan expired → Redirect to /billing
❌ Admin → Redirect to /admin
`;

// ========================================================================
// 🍽️ FLOW 2: CRIAR COMANDA
// ========================================================================

const CREATE_COMANDA_FLOW = `

┌─────────────────────┐
│ User in             │
│ /comandas page      │
│                     │
│ Clica "Nova Comanda"│
└──────────┬──────────┘
           │
           ↓
   ┌─────────────────┐
   │ Dialog opens    │
   │ (form)          │
   │                 │
   │ [] Mesa         │
   │ [] Cliente      │
   │ [Submit]        │
   └────────┬────────┘
            │
     User fills + clicks
            │
            ↓
   ┌─────────────────────────────────────┐
   │ Client Action:                      │
   │ createComandaAction({...})          │
   │                                     │
   │ 'use server' boundary               │
   └────────────┬────────────────────────┘
                │
                ↓
     ┌─────────────────────────────────────┐
     │ Server Side (Next.js Server)        │
     │                                     │
     │ 1. Check auth: user exists? ✅      │
     │ 2. Check session: valid JWT? ✅     │
     │ 3. Validate input (zod) ✅          │
     │ 4. Call Supabase:                   │
     │    supabase.from('comandas')        │
     │    .insert({ ... })                 │
     │                                     │
     │    ↓ RLS POLICY triggered:          │
     │    ✅ store_id matches auth.uid?    │
     │    ✅ User has permission?          │
     └────────────┬────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
      ↓ Success               ↓ Error
   ┌──────────┐           ┌────────────────┐
   │ Return:  │           │ Return:        │
   │ {        │           │ { success:     │
   │  success │           │   false,       │
   │  : true, │           │   error:       │
   │  data:   │           │   'RLS error'  │
   │  Comanda │           │ }              │
   │ }        │           └────────┬───────┘
   └────┬─────┘                    │
        │                          │
        ↓                          ↓
   Frontend:               Toast (error)
   ┌─────────────┐         ┌────────────────────────┐
   │ Toast:      │         │ "Erro ao criar comanda"│
   │ "Comanda    │         │ Duration: 3s           │
   │  criada!"   │         └────────────────────────┘
   │             │
   │ Redirect:   │
   │ → /comandas │
   │   /[id]     │
   └─────────────┘
                │
                ↓
        ┌───────────────────┐
        │ Realtime Sync:    │
        │                   │
        │ 1. Subscription:  │
        │    on('INSERT',   │
        │    'comandas')    │
        │                   │
        │ 2. Listener fires │
        │                   │
        │ 3. /comandas list │
        │    refetches      │
        │                   │
        │ 4. New card       │
        │    appears!       │
        └───────────────────┘
`;

// ========================================================================
// 📦 FLOW 3: ATUALIZAR COMANDA ITEM STATUS
// ========================================================================

const UPDATE_ITEM_STATUS_FLOW = `

┌──────────────────────────┐
│ Cozinheiro em            │
│ /cozinha (KDS)           │
│                          │
│ Vê card com "Café x2"    │
│                          │
│ Clica "Pronto" button    │
└───────────┬──────────────┘
            │
            ↓
      ┌──────────────────────────────┐
      │ Client State:                │
      │ marking = item_id            │
      │ button disabled + loading    │
      └───────────┬──────────────────┘
                  │
                  ↓
      ┌──────────────────────────────────────────┐
      │ Server Action:                           │
      │ updateComandaItemStatusAction({          │
      │   itemId: abc123,                        │
      │   status: 'pronto'                       │
      │ })                                        │
      └───────────┬──────────────────────────────┘
                  │
                  ↓
      ┌──────────────────────────────┐
      │ Server:                      │
      │ 1. Auth check ✅             │
      │ 2. supabase.from('comanda    │
      │    _itens').update({ status  │
      │    : 'pronto' }).eq('id',    │
      │    itemId)                   │
      │                              │
      │    RLS checks:               │
      │    ✅ Item exists?           │
      │    ✅ Comanda belongs to     │
      │       auth store?            │
      │                              │
      │ 3. If success → return       │
      │    { success: true }         │
      └───────────┬──────────────────┘
                  │
                  ├──────────────────┐
                  │                  │
          Success │                  │ Error
                  ↓                  ↓
      ┌──────────────────┐   ┌──────────────────┐
      │ Frontend:        │   │ Toast:           │
      │ marking = null   │   │ "Erro ao         │
      │ (button active)  │   │  atualizar"      │
      │                  │   └──────────────────┘
      │ Toast:           │
      │ "✅ Item pronto!"│
      │ (soundEffect?)   │
      └────────┬─────────┘
               │
               ↓
      ┌──────────────────────────┐
      │ Realtime Trigger:        │
      │                          │
      │ Supabase detects UPDATE  │
      │ on comanda_itens         │
      │                          │
      │ WHERE:                   │
      │ status: 'pendente'→pronto│
      │                          │
      │ Broadcast to:            │
      │ - All cozinha clients ✓  │
      │ - All garçom clients ✓   │
      │ - Kitchen display X      │
      │   (item card disappears) │
      └────────┬─────────────────┘
               │
               ↓
      ┌──────────────────────────┐
      │ GARÇOM receives:         │
      │ useRealtimeNotifications │
      │ .subscribe(              │
      │   'item_ready',          │
      │   handler                │
      │ )                        │
      │                          │
      │ Toast appears:           │
      │ "🍽️ Café pronto!"        │
      │ (auto-dismissed 5s)      │
      └──────────────────────────┘
`;

// ========================================================================
// 💳 FLOW 4: SERVER ACTION ERROR HANDLING
// ========================================================================

const ERROR_HANDLING_FLOW = `

User Action
    │
    ↓
Server Action called
    │
    ├─ Try Block
    │  │
    │  ├─ Step 1: Check Auth
    │  │  │
    │  │  ├─ ❌ No user
    │  │  │  └─ Return { success: false, error: 'Sessão expirada' }
    │  │  │
    │  │  └─ ✅ User found
    │  │
    │  ├─ Step 2: Validate Input
    │  │  │
    │  │  ├─ ❌ Invalid data
    │  │  │  └─ Return { success: false, error: 'Dados inválidos' }
    │  │  │
    │  │  └─ ✅ Input valid
    │  │
    │  ├─ Step 3: Database Operation
    │  │  │
    │  │  ├─ ❌ RLS violation
    │  │  │  └─ Supabase error caught
    │  │  │     └─ Return { success: false, error: 'Sem permissão' }
    │  │  │
    │  │  ├─ ❌ Duplicate key
    │  │  │  └─ Return { success: false, error: 'Já existe' }
    │  │  │
    │  │  └─ ✅ INSERT/UPDATE/DELETE success
    │  │
    │  └─ Return { success: true, data: result }
    │
    └─ Catch Block
       │
       ├─ Log error to console: [SERVER_ACTION_ERROR]
       │
       └─ Return { success: false, error: 'Erro inesperado' }


Frontend receives:
    │
    ├─ success: true
    │  └─ Use data, update UI, show success toast
    │
    └─ success: false
       └─ Show error toast with error message
          Duration: 3-5 seconds
`;

// ========================================================================
// 🔄 FLOW 5: REALTIME SYNC
// ========================================================================

const REALTIME_SYNC_FLOW = `

SETUP PHASE:
════════════

Client A: useRealtimeSync() in useEffect
    │
    ├─ supabase
    │  .channel('comanda_items_sync')
    │  .on('postgres_changes', {
    │    event: '*',
    │    table: 'comanda_itens'
    │  }, callback)
    │  .subscribe()
    │
    └─ Websocket connection ✅


TRIGGER PHASE:
══════════════

Client B: updateComandaItemStatusAction()
    │
    └─ Database: UPDATE comanda_itens SET status='pronto'
       │
       └─ Supabase Realtime: Event broadcast
          │
          ├─ To Client A: postgres_changes event
          │  │
          │  ├─ Event type: UPDATE
          │  ├─ Table: comanda_itens
          │  ├─ Old values: { status: 'em_preparo' }
          │  └─ New values: { status: 'pronto' }
          │
          └─ To Client C: postgres_changes event (same)
             
             
HANDLE PHASE:
═════════════

Client A & C receive event:
    │
    ├─ on_postgres_changes() callback fired
    │  │
    │  └─ Call refetch() or setState()
    │     │
    │     └─ Query updated data from server
    │        │
    │        └─ UI re-renders with fresh data
    │
    └─ If status changed to 'pronto': Show toast
       │
       └─ Toast message: "🍽️ Item pronto!"
          Duration: 5s
          Auto-dismiss


RESULT:
═══════
🟢 Client A: Sees item marked ready
🟢 Client B: Sees confirmation
🟢 Client C: Sees item marked ready

All in < 100ms latency ✅
`;

export const FLOWS = {
  AUTH_FLOW,
  CREATE_COMANDA_FLOW,
  UPDATE_ITEM_STATUS_FLOW,
  ERROR_HANDLING_FLOW,
  REALTIME_SYNC_FLOW,
};

console.log('Data Flows documented:');
Object.keys(FLOWS).forEach(key => console.log(`✓ ${key}`));
