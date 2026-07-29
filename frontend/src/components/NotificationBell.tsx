import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotificaciones } from '../hooks/useNotificaciones'
import type { Rol } from '../hooks/useAuth'

interface Props {
  empleadaId: string | undefined
  rol: Rol | undefined
}

export function NotificationBell({ empleadaId, rol }: Props) {
  const { notificaciones, cargando, noLeidas, marcarLeida, marcarTodasLeidas } = useNotificaciones(empleadaId, rol)
  const [abierto, setAbierto] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="relative text-muted hover:text-ink transition-colors"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] rounded-full flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-black/5 rounded-2xl shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
              <span className="font-display font-bold text-sm text-ink">Notificaciones</span>
              {noLeidas > 0 && (
                <button onClick={marcarTodasLeidas} className="text-xs text-primary font-medium">
                  Marcar todas leídas
                </button>
              )}
            </div>

            {cargando && <p className="text-sm text-muted p-4">Cargando...</p>}
            {!cargando && notificaciones.length === 0 && (
              <p className="text-sm text-muted p-4">No hay notificaciones.</p>
            )}

            {notificaciones.map((n) => (
              <button
                key={n.id}
                onClick={() => marcarLeida(n.id)}
                className={`w-full text-left px-4 py-3 border-b border-black/5 last:border-0 hover:bg-black/5 transition-colors ${
                  !n.leida ? 'bg-primary/5' : ''
                }`}
              >
                <p className="text-sm text-ink">{n.mensaje}</p>
                <p className="text-xs text-muted mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}