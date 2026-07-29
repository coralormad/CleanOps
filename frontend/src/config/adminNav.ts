import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, Users, Clock, CalendarClock, FileBarChart, Settings } from 'lucide-react'

export interface AdminNavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/empleadas', label: 'Empleadas', icon: Users },
  { to: '/admin/fichajes', label: 'Control de Fichajes', icon: Clock },
  { to: '/admin/solicitudes', label: 'Solicitudes', icon: CalendarClock },
  { to: '/admin/informes', label: 'Informes', icon: FileBarChart },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
]