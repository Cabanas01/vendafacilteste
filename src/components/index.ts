/**
 * @fileOverview Index de Componentes-Chave Prontos para Exportação
 * 
 * Use isso para imports rápidos e organizados:
 * 
 * import {
 *   SidebarProvider,
 *   MainNav,
 *   PageHeader,
 *   ComandaCard,
 * } from '@/components/index';
 */

// UI Base
export { Button } from '@/components/ui/button';
export { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
export { Input } from '@/components/ui/input';
export { Badge } from '@/components/ui/badge';
export { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
export { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export { Checkbox } from '@/components/ui/checkbox';
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';

// Custom Components
export { MainNav } from '@/components/main-nav';
export { AdminSidebar } from '@/components/admin-sidebar';
export { PageHeader } from '@/components/page-header';
export { DateRangePicker } from '@/components/date-range-picker';
export { SalesByPaymentMethodChart, SalesByProductChart } from '@/components/charts';

// Comandas
export { CreateComandaDialog } from '@/components/comandas/create-comanda-dialog';

// Auth
export { AuthProvider } from '@/components/auth-provider';

// SEO
export { Analytics } from '@/components/seo/analytics';
export { AdSenseScript } from '@/components/adsense-script';

/**
 * @example
 * 
 * // ✅ FORMA CORRETA (Com index.ts)
 * import { Button, Card, MainNav, PageHeader } from '@/components';
 * 
 * // ❌ SEM INDEX (desgostoso)
 * import { Button } from '@/components/ui/button';
 * import { MainNav } from '@/components/main-nav';
 * import { PageHeader } from '@/components/page-header';
 */
