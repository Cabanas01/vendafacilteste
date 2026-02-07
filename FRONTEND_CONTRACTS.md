/**
 * ========================================================================
 * CONTRACTS: FRONTEND ↔ BACKEND
 * ========================================================================
 * 
 * Este documento define os contratos (interfaces + fluxos) entre
 * frontend e backend. Use para validação e testes.
 * 
 * Formato: Fluxo → Tipos → Actions → API Calls
 */

// ========================================================================
// 📋 FLUXO 1: AUTENTICAÇÃO
// ========================================================================

/**
 * Fluxo:
 * 1. User: Email + Senha
 * 2. Frontend: auth.signUpWithPassword() ou signInWithPassword()
 * 3. Backend: Supabase Auth (JWT)
 * 4. Response: User + Session
 * 5. Frontend: Set Cookie (middleware)
 * 6. Redirect: Depends on bootstrap status
 * 
 * Tipos:
 * - User { id, email, name, avatar_url, is_admin }
 * 
 * RLS: ✅ session.user.id valida próprio usuário
 * 
 * ✅ IMPLEMENTADO em: src/app/(auth)/login/page.tsx
 * ✅ PRONTO para: Testar
 */

// ========================================================================
// 🛍️ FLUXO 2: ONBOARDING (Novo User)
// ========================================================================

/**
 * Fluxo:
 * 1. User: Dados da loja (CNPJ, email, etc)
 * 2. Frontend: Envia via Server Action
 * 3. Backend: RPC create_initial_store()
 * 4. Database: INSERT stores, store_members, entitlements
 * 5. Response: Store object
 * 6. Frontend: Redirect → /dashboard
 * 
 * Tipos:
 * - Store { id, name, cnpj, address, timezone, settings }
 * - StoreMember { user_id, store_id, role: 'admin' | 'staff' }
 * 
 * RLS:
 * ✅ Apenas auth.uid pode criar própria loja
 * ✅ Apenas admin pode convidar staff
 * 
 * ✅ IMPLEMENTADO em: src/app/(app)/onboarding/page.tsx
 * ✅ PRONTO para: Testar com backend
 */

// ========================================================================
// 💰 FLUXO 3: FILA DE COMANDAS
// ========================================================================

/**
 * Actor: Garçom (staff)
 * 
 * 3.1 - VER LISTA
 * ─────────────────
 * 1. Frontend: GET /api/comandas?status=aberta
 * 2. Backend: Query v_comandas_totais WHERE status='aberta'
 * 3. Response: ComandaTotalView[]
 * 4. Frontend: Renderiza cards em grid
 * 
 * Query:
 * SELECT * FROM v_comandas_totais
 * WHERE store_id = auth_store_id
 * AND status = 'aberta'
 * ORDER BY numero ASC
 * 
 * Tipos:
 * - ComandaTotalView {
 *     comanda_id, numero, mesa, cliente_nome,
 *     status, total_value, item_count
 *   }
 * 
 * RLS: ✅ Filtrado por store_id (automaticamente)
 * Realtime: ✅ Já implementado
 * 
 * ✅ IMPLEMENTADO em: src/app/(app)/comandas/page.tsx
 * ✅ PRONTO para: Usar agora
 * 
 * 
 * 3.2 - VER DETALHE
 * ──────────────────
 * 1. Frontend: GET /api/comandas/[id]
 * 2. Backend: Query comanda + items com JOIN product
 * 3. Response: { comanda, items[], total }
 * 4. Frontend: Renderiza comanda em detalhes
 * 
 * Queries:
 * SELECT * FROM comandas WHERE id = $1
 * SELECT * FROM comanda_itens WHERE comanda_id = $1
 * JOIN products ON product_id = id
 * 
 * Tipos:
 * - Comanda { id, numero, mesa, status }
 * - ComandaItem[] { product_name, quantidade, status }
 * 
 * RLS: ✅ Validado por store_id (comanda → store)
 * Realtime: ✅ Já implementado
 * 
 * ✅ IMPLEMENTADO em: src/app/(app)/comandas/[id]/page.tsx
 * ✅ PRONTO para: Usar agora
 * 
 * 
 * 3.3 - CRIAR COMANDA
 * ───────────────────
 * 1. Frontend: Action createComandaAction({ numero, mesa, customerId })
 * 2. Backend: INSERT INTO comandas
 * 3. Response: Comanda { id, numero, mesa, status: 'aberta' }
 * 4. Frontend: Navigate → /comandas/[id]
 * 
 * Action:
 * export async function createComandaAction(input: {
 *   storeId: string;
 *   numero: number;
 *   mesa?: string;
 *   customerId?: string;
 * }): Promise<ActionResponse<Comanda>>
 * 
 * RLS: ✅ INSERT policiy valida store_id
 * 
 * ✅ IMPLEMENTADO em: src/app/actions/comandas-actions.ts
 * ✅ PRONTO para: Usar agora
 * 
 * 
 * 3.4 - ADICIONAR ITEM
 * ────────────────────
 * 1. Frontend: Action addComandaItemAction({ comandaId, productId, quantidade })
 * 2. Backend: INSERT INTO comanda_itens
 * 3. Response: ComandaItem { id, status: 'pendente' }
 * 4. Frontend: Realtime atualiza UI
 * 5. Cozinha: Recebe notificação
 * 
 * Action:
 * export async function addComandaItemAction(input: {
 *   comandaId: string;
 *   productId: string;
 *   productName: string;
 *   quantidade: number;
 *   precoUnitario: number;
 *   destinoPreparo: 'cozinha' | 'bar' | 'nenhum';
 * }): Promise<ActionResponse<ComandaItem>>
 * 
 * Trigger: Backend deve notificar painel cozinha/bar
 * RLS: ✅ INSERT policy valida comanda.store_id
 * Realtime: ✅ Cozinha ouve table 'comanda_itens'
 * 
 * ✅ IMPLEMENTADO em: src/app/actions/comandas-actions.ts
 * ⚠️ TODO: Backend webhook para notificar cozinha (toast sonoro)
 * 
 * 
 * 3.5 - FECHAR COMANDA
 * ────────────────────
 * 1. Frontend: Action fecharComandaAction({ comandaId })
 * 2. Backend: UPDATE comandas SET status='fechada'
 * 3. Response: Sucesso
 * 4. Frontend: Print receipt
 * 5. Frontend: Redirect → /comandas
 * 
 * Observação:
 * "Fechar comanda" = finalizar consumo, não criar venda
 * Se usar comanda = venda, fazer UPDATE em vez de INSERT
 * 
 * ✅ IMPLEMENTADO em: src/app/actions/comandas-actions.ts
 * ✅ PRONTO para: Usar agora
 */

// ========================================================================
// 🍳 FLUXO 4: PAINEL DE PRODUÇÃO (Cozinha/Bar)
// ========================================================================

/**
 * Actor: Cozinheiro/Bartender
 * 
 * 4.1 - VER FILA
 * ───────────────
 * 1. Frontend: GET /api/painel_producao?destino=cozinha
 * 2. Backend: Query v_painel_cozinha WHERE status != 'pronto'
 * 3. Response: PainelProducaoView[]
 * 4. Frontend: Renderiza em cards gigantes
 * 
 * Query:
 * SELECT * FROM v_painel_producao
 * WHERE store_id = auth_store_id
 * AND destino_preparo = 'cozinha'
 * AND status != 'pronto'
 * AND status != 'cancelado'
 * ORDER BY created_at ASC
 * 
 * Tipos:
 * - PainelProducaoView {
 *     item_id, comanda_numero, mesa, produto,
 *     quantidade, status, tempo_passado
 *   }
 * 
 * RLS: ✅ Filtrado por store_id
 * Realtime: ✅ Já implementado
 * 
 * ✅ IMPLEMENTADO em: src/app/(app)/cozinha/page.tsx
 * ✅ PRONTO para: Usar agora
 * 
 * 
 * 4.2 - MARCAR COMO "EM PREPARO"
 * ───────────────────────────────
 * 1. Cozinheiro: Clica no card
 * 2. Frontend: Action updateComandaItemStatusAction({ itemId, status: 'em_preparo' })
 * 3. Backend: UPDATE comanda_itens SET status='em_preparo'
 * 4. Response: Sucesso
 * 5. Painel: Atualiza card (muda cor de pendente → laranja)
 * 
 * ✅ IMPLEMENTADO em: src/app/actions/comandas-actions.ts
 * ⚠️ TODO: UI do card muda cor (não há UI ainda para este status)
 * 
 * 
 * 4.3 - MARCAR COMO "PRONTO"
 * ──────────────────────────
 * 1. Cozinheiro: Clica "Concluir"
 * 2. Frontend: Action updateComandaItemStatusAction({ itemId, status: 'pronto' })
 * 3. Backend: UPDATE comanda_itens SET status='pronto'
 * 4. Trigger: Backend notifica garçom (realtime)
 * 5. Garçom: Recebe toast "🍽️ Item Pronto!"
 * 6. Painel: Card desaparece (filtro status != 'pronto')
 * 
 * ✅ IMPLEMENTADO em: src/app/actions/comandas-actions.ts
 * ✅ Toast implementado em: src/hooks/use-realtime-notifications.ts
 * ✅ PRONTO para: Usar agora
 */

// ========================================================================
// 💻 FLUXO 5: PDV (CAIXA)
// ========================================================================

/**
 * Actor: Caixa/Vendedor
 * 
 * 5.1 - CARRINHO
 * ───────────────
 * State (no React, não em DB):
 * cart = [
 *   { product_id, product_name, quantidade, unit_price, subtotal }
 * ]
 * 
 * 5.2 - FINALIZAR VENDA
 * ──────────────────────
 * 1. Frontend: Action processSaleAction(storeId, cart, paymentMethod)
 * 2. Backend:
 *    - INSERT INTO sales (store_id, total, payment_method)
 *    - INSERT INTO sale_items (sale_id, product_id, quantity, unit_price)
 *    - UPDATE products SET stock_qty -= quantity (se ativo)
 *    - Trigger: Gera NF-e (?)
 * 3. Response: Sale { id, items[], total }
 * 4. Frontend: Print receipt
 * 5. Frontend: Clear cart
 * 
 * Tipos:
 * - Sale { id, store_id, total, payment_method }
 * - SaleItem[] { product_id, quantity, unit_price_cents }
 * 
 * RLS:
 * ✅ INSERT policy valida store_id = auth_store
 * ✅ Stock update também validado
 * 
 * ✅ IMPLEMENTADO em: src/app/actions/sales-actions.ts
 * ✅ PRONTO para: Usar agora
 */

// ========================================================================
// 📞 CONTRATOS DE ERRO
// ========================================================================

/**
 * Padrão de Resposta:
 * 
 * Sucesso:
 * { success: true, data: T }
 * 
 * Erro:
 * { success: false, error: 'mensagem' }
 * 
 * Códigos de Erro:
 * - 'Sessão expirada'      → Login novamente
 * - 'Sem permissão'        → RLS violada ou plan expirado
 * - 'Recurso não encontrado' → 404
 * - 'Erro inesperado'      → Contacte support
 * 
 * ✅ Padrão implementado em TODAS as actions
 */

// ========================================================================
// ✅ CHECKLIST DE VALIDAÇÃO
// ========================================================================

/**
 * Antes de pr para produção:
 * 
 * [ ] Testar autenticação (login/signup)
 * [ ] Testar onboarding (criar loja)
 * [ ] Testar fluxo comandas (criar → detalhe → fechar)
 * [ ] Testar cozinha (marcar pronto)
 * [ ] Testar PDV (criar venda)
 * [ ] Verificar RLS (tentar acessar dados de outra loja)
 * [ ] Verificar realtime (abrir em 2 abas)
 * [ ] Verificar toast notifications
 * [ ] Load test (N comandas simultâneas)
 * [ ] Security audit (OWASP)
 */

export const CONTRACTS_VERSION = '1.0.0';
export const LAST_UPDATED = new Date().toISOString();
