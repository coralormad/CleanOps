import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { EMPLOYEE_NAV_ITEMS } from '../config/employeeNav'

export function EmployeeSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { perfil, cerrarSesion } = useAuth()

  const cerrarMovil = () => setMobileOpen(false)

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-30 p-2 rounded-lg bg-white shadow-sm border border-black/10" aria-label="Abrir menu">
        <Menu size={20} className="text-ink" />
      </button>

      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={cerrarMovil} aria-hidden="true" />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/5 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-2 h-16 px-4 border-b border-black/5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="font-display font-extrabold text-white text-sm">V</span>
          </div>
          <span className="font-display font-bold text-ink text-sm">Vite Servicios</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {EMPLOYEE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={cerrarMovil} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? 'bg-primary text-white' : 'text-ink hover:bg-black/5'}`}>
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-black/5 p-3 space-y-2">
          <p className="px-3 text-xs text-muted truncate">{perfil?.nombreCompleto}</p>
          <button onClick={cerrarSesion} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-bg transition-colors">
            <LogOut size={18} className="shrink-0" />
            <span>Cerrar sesion</span>
          </button>
        </div>

        <button onClick={cerrarMovil} className="lg:hidden absolute top-4 right-4 text-muted" aria-label="Cerrar menu">
          <X size={20} />
        </button>
      </aside>
    </>
  )
}