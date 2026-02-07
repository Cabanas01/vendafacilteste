/**
 * ========================================================================
 * FRONTEND BUG FIXES - ERRO 1 & ERRO 2
 * ========================================================================
 */

// ========================================================================
// ❌ ERRO 1: COZINHA/BAR - UUID undefined
// ========================================================================
/**
 * Problema: Components cozinha/bar não têm botão "Marcar como Pronto"
 * 
 * Causa:
 * - /cozinha/page.tsx e /bar/page.tsx apenas renderizam cards informativos
 * - Não há onClick handler para marcar item como pronto
 * - Se existisse, estaria usando comanda.id em vez de item.id
 * 
 * Solução:
 * 1. Adicionar Button "Marcar como Pronto" nos cards
 * 2. Handler chama updateComandaItemStatusAction()
 * 3. Passa item.id (não comanda.id)
 * 4. Status muda para 'pronto'
 * 
 * Arquivos a Corrigir:
 * ✓ src/app/(app)/cozinha/page.tsx
 * ✓ src/app/(app)/bar/page.tsx
 * 
 * Implementação:
 * 
 * ```tsx
 * import { updateComandaItemStatusAction } from '@/app/actions/comandas-actions';
 * 
 * const handleMarcarPronto = async (itemId: string) => {
 *   if (!itemId) {
 *     toast.error('Item inválido');
 *     return;
 *   }
 *   
 *   setMarking(itemId);
 *   const result = await updateComandaItemStatusAction({
 *     itemId,
 *     status: 'pronto'
 *   });
 *   
 *   if (result.success) {
 *     toast.success('Item marcado como pronto! 🍽️');
 *   } else {
 *     toast.error(result.error || 'Erro ao marcar');
 *   }
 *   setMarking(null);
 * };
 * ```
 * 
 * No card:
 * ```tsx
 * <Button
 *   onClick={() => handleMarcarPronto(p.item_id)}
 *   disabled={marking === p.item_id}
 *   className="w-full mt-4"
 * >
 *   {marking === p.item_id ? 'Marcando...' : 'Marcar como Pronto'}
 * </Button>
 * ```
 * 
 * ⚠️ IMPORTANTE: Use `p.item_id` (PainelProducaoView.item_id)
 *                Nunca use `p.comanda_id`
 */

// ========================================================================
// ❌ ERRO 2: ABRIR COMANDA - RPC não existe
// ========================================================================
/**
 * Problema: Frontend chama RPC 'abrir_comanda_cliente_cpf' que não existe
 * 
 * Causa:
 * - Esta RPC foi referenciada no código mas nunca foi criada no backend
 * - Função não está em sql/02_functions.sql
 * - Supabase retorna: "Could not find the function public.abrir_comanda_cliente_cpf"
 * 
 * Responsabilidade: BACKEND
 * 
 * Ações necessárias no BACKEND:
 * 
 * 1. Criar RPC em sql/02_functions.sql:
 *    
 *    CREATE OR REPLACE FUNCTION public.abrir_comanda_cliente_cpf(
 *      p_store_id UUID,
 *      p_cpf VARCHAR,
 *      p_mesa VARCHAR DEFAULT NULL
 *    )
 *    RETURNS JSONB AS $$
 *    DECLARE
 *      v_customer_id UUID;
 *      v_comanda_id UUID;
 *    BEGIN
 *      -- Buscar cliente por CPF
 *      SELECT id INTO v_customer_id
 *      FROM customers
 *      WHERE cpf = p_cpf AND store_id = p_store_id
 *      LIMIT 1;
 *      
 *      -- Se não encontrar, retorna erro
 *      IF v_customer_id IS NULL THEN
 *        RETURN jsonb_build_object(
 *          'success', false,
 *          'error', 'Cliente não encontrado'
 *        );
 *      END IF;
 *      
 *      -- Inserir comanda
 *      INSERT INTO comandas (store_id, customer_id, mesa, numero, status, created_at)
 *      VALUES (p_store_id, v_customer_id, p_mesa, 
 *              COALESCE((SELECT MAX(numero) + 1 FROM comandas WHERE store_id = p_store_id), 1),
 *              'aberta', NOW())
 *      RETURNING id INTO v_comanda_id;
 *      
 *      RETURN jsonb_build_object(
 *        'success', true,
 *        'comanda_id', v_comanda_id
 *      );
 *    END;
 *    $$ LANGUAGE plpgsql SECURITY DEFINER;
 * 
 * 
 * 2. Se frontend chama esta função, atualizar em:
 *    - Procurar por "abrir_comanda_cliente_cpf" em TODO o código
 *    - Converter para usar createComandaAction() em vez de RPC
 * 
 * 
 * Backend Checklist:
 * [ ] Criar RPC abrir_comanda_cliente_cpf() ou
 * [ ] Remover chamadas desta RPC do frontend
 * [ ] Usar createComandaAction() em vez
 * 
 * Frontend Checklist:
 * [ ] Não há chamadas diretas desta RPC no código atual
 * [ ] Se encontrar, substituir por createComandaAction()
 */

// ========================================================================
// 📋 ACTIONS JÁ PRONTAS NO FRONTEND (USE ESTAS)
// ========================================================================

/**
 * ✅ Para marcar item como pronto (ERRO 1):
 * 
 * import { updateComandaItemStatusAction } from '@/app/actions/comandas-actions';
 * 
 * await updateComandaItemStatusAction({
 *   itemId: 'uuid-aqui',     // ← NUNCA comanda.id
 *   status: 'pronto'
 * });
 */

/**
 * ✅ Para criar comanda (ERRO 2 workaround):
 * 
 * import { createComandaAction } from '@/app/actions/comandas-actions';
 * 
 * await createComandaAction({
 *   storeId: store.id,
 *   numero: 1,
 *   mesa: 'Balcão',
 *   customerId: customer.id  // ← Já busca o cliente
 * });
 */

// ========================================================================
// 🔍 ONDE PROCURAR PELO ERRO 2
// ========================================================================

const searchLocations = `
Procure em TODO O CÓDIGO por:
"abrir_comanda_cliente_cpf"
"abrir_comanda"
".rpc("

Se encontrar, SUBSTITUA por:
createComandaAction() (já pronta)

Arquivos suspeitos:
- src/app/(app)/onboarding/page.tsx
- src/app/(app)/billing/page.tsx
- src/components/comandas/*.tsx
- Qualquer arquivo que tenha "cliente" + "cpf"
`;

export const BUG_FIXES = {
  erro1: 'Adicionar handler "Marcar como Pronto" nos cards (cozinha/bar)',
  erro2: 'Criar RPC abrir_comanda_cliente_cpf no backend OU remover chamadas',
  urgencia: 'Erro 1: CRÍTICO (sem botão)', 
  urgencia2: 'Erro 2: BLOCKER (backend)',
};
