/**
 * @fileOverview Index de Hooks Prontos para Exportação
 * 
 * Use para imports rápidos:
 * 
 * import { useToast, useMobile, useRealtimeNotifications } from '@/hooks';
 */

export { useToast } from '@/hooks/use-toast';
export { useMobile } from '@/hooks/use-mobile';
export { useEntitlements } from '@/hooks/use-entitlements';
export { useRealtimeNotifications, useRealtimeSync } from '@/hooks/use-realtime-notifications';

/**
 * @example
 * 
 * // ✅ FORMA CORRETA (Com index.ts)
 * import { useToast, useRealtimeNotifications } from '@/hooks';
 * 
 * // ❌ SEM INDEX (ruim)
 * import { useToast } from '@/hooks/use-toast';
 */
