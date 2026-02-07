'use server';

/**
 * @fileOverview Server Actions para Gerenciamento de Comandas
 * 
 * Todas as mutações em Comandas passam por aqui.
 * Cada ação valida autenticação e RLS automaticamente.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Comanda, ComandaItem } from '@/lib/types';

interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Cria uma nova Comanda
 */
export async function createComandaAction(input: {
  storeId: string;
  numero: number;
  mesa?: string;
  customerId?: string;
}): Promise<ActionResponse<Comanda>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sessão expirada' };
    }

    const { data: comanda, error: commandaError } = await supabase
      .from('comandas')
      .insert({
        store_id: input.storeId,
        numero: input.numero,
        mesa: input.mesa || null,
        customer_id: input.customerId || null,
        status: 'aberta',
      })
      .select()
      .single();

    if (commandaError) {
      console.error('[CREATE_COMANDA_ERROR]', commandaError);
      return { success: false, error: 'Erro ao criar comanda' };
    }

    return { success: true, data: comanda };
  } catch (err) {
    console.error('[CREATE_COMANDA_CATCH]', err);
    return { success: false, error: 'Erro inesperado' };
  }
}

/**
 * Adiciona item a uma Comanda
 */
export async function addComandaItemAction(input: {
  comandaId: string;
  productId: string;
  productName: string;
  quantidade: number;
  precoUnitario: number;
  destinoPreparo: 'cozinha' | 'bar' | 'nenhum';
}): Promise<ActionResponse<ComandaItem>> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sessão expirada' };
    }

    const { data: item, error: itemError } = await supabase
      .from('comanda_itens')
      .insert({
        comanda_id: input.comandaId,
        product_id: input.productId,
        product_name: input.productName,
        quantidade: input.quantidade,
        preco_unitario: input.precoUnitario,
        destino_preparo: input.destinoPreparo,
        status: 'pendente',
      })
      .select()
      .single();

    if (itemError) {
      console.error('[ADD_COMANDA_ITEM_ERROR]', itemError);
      return { success: false, error: 'Erro ao adicionar item' };
    }

    return { success: true, data: item };
  } catch (err) {
    console.error('[ADD_COMANDA_ITEM_CATCH]', err);
    return { success: false, error: 'Erro inesperado' };
  }
}

/**
 * Atualiza status de preparo de um item (manualmente via interface)
 */
export async function updateComandaItemStatusAction(input: {
  itemId: string;
  status: 'pendente' | 'em_preparo' | 'pronto' | 'cancelado';
}): Promise<ActionResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sessão expirada' };
    }

    const { error: updateError } = await supabase
      .from('comanda_itens')
      .update({ status: input.status })
      .eq('id', input.itemId);

    if (updateError) {
      console.error('[UPDATE_COMANDA_ITEM_ERROR]', updateError);
      return { success: false, error: 'Erro ao atualizar status' };
    }

    return { success: true };
  } catch (err) {
    console.error('[UPDATE_COMANDA_ITEM_CATCH]', err);
    return { success: false, error: 'Erro inesperado' };
  }
}

/**
 * Fecha uma Comanda (marca como fechada)
 */
export async function fecharComandaAction(input: {
  comandaId: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sessão expirada' };
    }

    const { error: updateError } = await supabase
      .from('comandas')
      .update({
        status: 'fechada',
        closed_at: new Date().toISOString(),
      })
      .eq('id', input.comandaId);

    if (updateError) {
      console.error('[FECHAR_COMANDA_ERROR]', updateError);
      return { success: false, error: 'Erro ao fechar comanda' };
    }

    return { success: true };
  } catch (err) {
    console.error('[FECHAR_COMANDA_CATCH]', err);
    return { success: false, error: 'Erro inesperado' };
  }
}

/**
 * Cancela uma Comanda inteira (marca como cancelada)
 */
export async function cancelarComandaAction(input: {
  comandaId: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sessão expirada' };
    }

    const { error: updateError } = await supabase
      .from('comandas')
      .update({
        status: 'cancelada',
        closed_at: new Date().toISOString(),
      })
      .eq('id', input.comandaId);

    if (updateError) {
      console.error('[CANCELAR_COMANDA_ERROR]', updateError);
      return { success: false, error: 'Erro ao cancelar comanda' };
    }

    return { success: true };
  } catch (err) {
    console.error('[CANCELAR_COMANDA_CATCH]', err);
    return { success: false, error: 'Erro inesperado' };
  }
}

/**
 * Remove um item específico de uma Comanda
 */
export async function removeComandaItemAction(input: {
  itemId: string;
}): Promise<ActionResponse> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sessão expirada' };
    }

    const { error: deleteError } = await supabase
      .from('comanda_itens')
      .delete()
      .eq('id', input.itemId);

    if (deleteError) {
      console.error('[REMOVE_COMANDA_ITEM_ERROR]', deleteError);
      return { success: false, error: 'Erro ao remover item' };
    }

    return { success: true };
  } catch (err) {
    console.error('[REMOVE_COMANDA_ITEM_CATCH]', err);
    return { success: false, error: 'Erro inesperado' };
  }
}

/**
 * Busca os detalhes completos de uma Comanda (header + items)
 */
export async function getComandaDetailsAction(comandaId: string): Promise<
  ActionResponse<{
    comanda: Comanda;
    items: ComandaItem[];
    total: number;
  }>
> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Sessão expirada' };
    }

    // Busca Comanda
    const { data: comanda, error: comandaError } = await supabase
      .from('comandas')
      .select()
      .eq('id', comandaId)
      .single();

    if (comandaError) {
      return { success: false, error: 'Comanda não encontrada' };
    }

    // Busca Itens
    const { data: items, error: itemsError } = await supabase
      .from('comanda_itens')
      .select()
      .eq('comanda_id', comandaId)
      .order('created_at', { ascending: true });

    if (itemsError) {
      return { success: false, error: 'Erro ao buscar itens' };
    }

    // Calcula total
    const total = (items || []).reduce(
      (sum, item) => sum + item.quantidade * item.preco_unitario,
      0
    );

    return {
      success: true,
      data: {
        comanda,
        items: items || [],
        total,
      },
    };
  } catch (err) {
    console.error('[GET_COMANDA_DETAILS_CATCH]', err);
    return { success: false, error: 'Erro inesperado' };
  }
}
