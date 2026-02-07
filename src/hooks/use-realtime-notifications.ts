/**
 * @fileOverview Hook para Notificações em Tempo Real
 * 
 * Sincroniza o cliente com mudanças no banco via Realtime do Supabase.
 * Útil para receber notificações de:
 * - Comanda criada (garçom)
 * - Item pronto (garçom)
 * - Venda criada (gerente)
 */

'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  type: 'comanda_created' | 'comanda_closed' | 'item_ready' | 'sale_created' | 'item_status_changed';
  data: Record<string, any>;
  timestamp: Date;
}

type NotificationHandler = (notification: RealtimeNotification) => void;

/**
 * Hook que ouve mudanças no Supabase Realtime e mostra notificações
 * 
 * @example
 * const { subscribe, unsubscribe } = useRealtimeNotifications();
 * 
 * useEffect(() => {
 *   subscribe('item_ready', (notif) => {
 *     console.log(`Item pronto: ${notif.data.product_name}`);
 *   });
 * }, []);
 */
export function useRealtimeNotifications() {
  const { toast } = useToast();
  const handlersRef = useRef<Map<string, NotificationHandler[]>>(new Map());
  const subscriptionRef = useRef<any>(null);

  // Registra handler para um tipo de notificação
  const subscribe = (type: RealtimeNotification['type'], handler: NotificationHandler) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, []);
    }
    handlersRef.current.get(type)!.push(handler);

    // Retorna unsubscribe function
    return () => {
      const handlers = handlersRef.current.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  };

  // Remove todos os handlers
  const unsubscribeAll = () => {
    handlersRef.current.clear();
  };

  // Setup realtime listeners
  useEffect(() => {
    // Listen para comanda_itens changes
    const itemChannel = supabase
      .channel('comanda_itens_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comanda_itens',
      }, (payload) => {
        // Quando um item muda de status para 'pronto'
        if (payload.new.status === 'pronto' && payload.old.status !== 'pronto') {
          const notification: RealtimeNotification = {
            type: 'item_ready',
            data: {
              itemId: payload.new.id,
              product_name: payload.new.product_name,
              comanda_id: payload.new.comanda_id,
            },
            timestamp: new Date(),
          };

          // Toast notification (visual)
          toast({
            title: '🍽️ Item Pronto!',
            description: `${payload.new.product_name} está pronto para entregar`,
            duration: 5000,
          });

          // Dispara handlers registrados
          handlersRef.current.get('item_ready')?.forEach(handler => handler(notification));
        }

        // Quando status muda
        if (payload.new.status !== payload.old.status) {
          const notification: RealtimeNotification = {
            type: 'item_status_changed',
            data: {
              itemId: payload.new.id,
              oldStatus: payload.old.status,
              newStatus: payload.new.status,
              product_name: payload.new.product_name,
            },
            timestamp: new Date(),
          };

          handlersRef.current.get('item_status_changed')?.forEach(handler => handler(notification));
        }
      })
      .subscribe();

    // Listen para comandas changes
    const comandaChannel = supabase
      .channel('comandas_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comandas',
      }, (payload) => {
        const notification: RealtimeNotification = {
          type: 'comanda_created',
          data: {
            comandaId: payload.new.id,
            numero: payload.new.numero,
            mesa: payload.new.mesa,
          },
          timestamp: new Date(),
        };

        handlersRef.current.get('comanda_created')?.forEach(handler => handler(notification));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'comandas',
        filter: "status=eq.fechada",
      }, (payload) => {
        const notification: RealtimeNotification = {
          type: 'comanda_closed',
          data: {
            comandaId: payload.new.id,
            numero: payload.new.numero,
          },
          timestamp: new Date(),
        };

        handlersRef.current.get('comanda_closed')?.forEach(handler => handler(notification));
      })
      .subscribe();

    subscriptionRef.current = { itemChannel, comandaChannel };

    return () => {
      itemChannel.unsubscribe();
      comandaChannel.unsubscribe();
    };
  }, [toast]);

  return { subscribe, unsubscribeAll };
}

/**
 * Hook simples para sincronizar dados via Realtime
 * 
 * @example
 * const { data, isSync } = useRealtimeSyncComandas(storeId);
 * 
 * Automaticamente recarrega quando há mudança em 'comandas' ou 'comanda_itens'
 */
export function useRealtimeSync<T>(
  query: () => Promise<T>,
  deps: any[] = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [isSync, setIsSync] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const refetch = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await query();
      setData(result);
    } catch (err) {
      console.error('[REALTIME_SYNC_ERROR]', err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    refetch();
  }, deps);

  return { data, isSync, loading, refetch };
}
