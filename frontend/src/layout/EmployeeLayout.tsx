import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { EmployeeSidebar } from './EmployeeSidebar'
import { EMPLOYEE_NAV_ITEMS } from '../config/employeeNav'
import { NotificationBell } from '../components/NotificationBell'

function useTituloActual(): string {
  const { pathname } = useLocation()
  return EMPLOYEE_NAV_ITEMS.find((i) => pathname.startsWith(i.to))?.label ?? 'Fichar'
}

export function EmployeeLayout() {
  const { perfil } = useAuth()
  const titulo = useTituloActual()

  const iniciales = perfil?.nombreCompleto?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="min-h-screen flex bg-surface">
      <EmployeeSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-black/5 bg-white flex items-center justify-between px-6 lg:px-8">
          <h1 className="font-display font-bold text-ink text-lg pl-12 lg:pl-0">{titulo}</h1>
          <div className="flex items-center gap-4">
            <NotificationBell empleadaId={perfil?.id} rol={perfil?.rol} />
            <div className="w-9 h-9 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
              {iniciales}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}