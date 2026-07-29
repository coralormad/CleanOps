import type { LucideIcon } from 'lucide-react'
import { QrCode, CalendarClock, History, FileText } from 'lucide-react'

export interface EmployeeNavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const EMPLOYEE_NAV_ITEMS: EmployeeNavItem[] = [
  { to: '/fichar', label: 'Fichar', icon: QrCode },
  { to: '/horario', label: 'Mi horario', icon: CalendarClock },
  { to: '/historial', label: 'Historial', icon: History },
  { to: '/justificantes', label: 'Justificantes', icon: FileText },
]