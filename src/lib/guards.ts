/**
 * @fileOverview Guards para decisões de roteamento frontend
 * 
 * Todas as decisões de ONDE o usuário deve estar são feitas aqui.
 * Server Components vencem gatekeepers. Componentes descristos no layout.tsx fazem chamadas a essas funções.
 */

import type { StoreAccessStatus } from '@/lib/types';

export interface GuardUserState {
  hasStore: boolean;
  isMember: boolean;
  isAdmin: boolean;
  accessStatus?: StoreAccessStatus;
}

/**
 * Decisão Principal de Rota baseada no Estado da Loja
 * 
 * Retorna a rota ABSOLUTA para onde o usuário deveria estar.
 * Usado em Server Components apenas (em layouts como gatekeeper).
 */
export function routeByStoreStatus({
  hasStore,
  isMember,
  isAdmin,
  accessStatus,
}: GuardUserState): string {
  // Novo usuário (sem loja, não é membro, não é admin)
  if (!hasStore && !isMember && !isAdmin) {
    return '/onboarding';
  }

  // Usuário é admin - vai para admin
  if (isAdmin) {
    // Se tem acesso expirado/bloqueado, ainda assim admin, mas pode ir para billing depois
    if (accessStatus?.acesso_liberado === false) {
      return '/admin';
    }
    return '/admin';
  }

  // Staff/Member (não é admin) - validar acesso
  if (!accessStatus?.acesso_liberado) {
    // Acesso bloqueado/expirado → cobrança
    return '/billing';
  }

  // Membro com acesso ativo → dashboard
  return '/dashboard';
}

/**
 * Determina se o usuário pode acessar uma rota ESPECÍFICA
 * 
 * Retorna `true` se pode, `false` se deve ser redirecionado.
 * Útil para validação síncrona em Client Components.
 */
export function canAccessRoute(
  pathname: string,
  state: GuardUserState
): boolean {
  const targetRoute = routeByStoreStatus(state);

  // Se o usuário está tentando acessar a rota permitida
  if (pathname.startsWith(targetRoute)) {
    return true;
  }

  // Rotas públicas (sempre acessíveis)
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return true;
  }

  // Qualquer outra rota → redirecionado
  return false;
}

/**
 * Extrai rota target de pathname, caso o usuário esteja tentando acessar algo inválido.
 * Retorna a rota para a qual ele DEVERIA ser redirecionado.
 */
export function getRedirectRoute(
  currentPathname: string,
  state: GuardUserState
): string | null {
  const allowedRoute = routeByStoreStatus(state);

  // Se já está na rota certa
  if (currentPathname.startsWith(allowedRoute)) {
    return null;
  }

  // Rotas públicas sempre permitem-se a si mesmas
  if (currentPathname.startsWith('/login') || currentPathname.startsWith('/signup')) {
    return null;
  }

  // Precisa redirecionar
  return allowedRoute;
}

/**
 * Determina qual SIDEBAR mostrar baseado no estado
 */
export function getSidebarType(state: GuardUserState): 'admin' | 'app' | 'none' {
  if (state.isAdmin) return 'admin';
  if (state.hasStore || state.isMember) return 'app';
  return 'none';
}

/**
 * Determina se o usuário pode ver a seção BILLING
 * (apenas membros que NÃO são admin, ou quando acesso está vencido)
 */
export function canAccessBilling(state: GuardUserState): boolean {
  if (state.isAdmin) return true; // Admin sempre pode acessar
  if (!state.hasStore && !state.isMember) return false; // Novo usuário não
  return true; // Membros sempre podem ver cobranças
}

/**
 * Determina rota após logout (com segurança)
 */
export function getLogoutRedirect(): string {
  return '/login';
}
