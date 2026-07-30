import { useState, type FormEvent } from 'react'
import { UserPlus, Ban, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useEmpleadas } from '../../hooks/useEmpleadas'
import { useAsistenciaHoy } from '../../hooks/useAsistenciaHoy'
import { Skeleton } from '../../components/Skeleton'
import { Alert } from '../../components/Alert'

type Tab = 'asistencia' | 'plantilla' | 'nueva'

function badgeRol(rol: string) {
  if (rol === 'gerencia') return 'bg-primary/10 text-primary'
  if (rol === 'supervisor') return 'bg-warning-bg text-warning'
  return 'bg-black/5 text-ink'
}

function TabAsistenciaHoy() {
  const { asistencia, cargando } = useAsistenciaHoy()

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
      {cargando && (
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {!cargando && asistencia.map((a, i) => (
        <div
          key={a.empleadaId}
          className={`flex items-center justify-between px-5 py-3.5 gap-3 border-l-4 animate-fade-in-up ${a.ok ? 'border-l-success' : 'border-l-danger'}`}
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{a.nombreCompleto}</p>
            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
              {a.horaFichaje && (
                <>
                  <Clock size={11} />
                  {new Date(a.horaFichaje).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </p>
          </div>

          <span className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${a.ok ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>
            {a.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
            {a.motivo}
          </span>
        </div>
      ))}

      {!cargando && asistencia.length === 0 && (
        <p className="text-sm text-muted p-5">No hay turnos asignados para hoy.</p>
      )}
    </div>
  )
}

function TabPlantilla() {
  const { empleadas, cargando, cambiarActivo } = useEmpleadas()

  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
      {cargando && (
        <div className="p-5 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {!cargando && empleadas.map((e, i) => (
        <div
          key={e.id}
          className={`flex items-center justify-between px-5 py-3.5 gap-3 transition-colors hover:bg-black/[0.02] animate-fade-in-up ${!e.activo ? 'opacity-50' : ''}`}
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{e.nombre_completo}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${badgeRol(e.rol)}`}>
              {e.rol}
            </span>
          </div>

          {e.rol === 'empleada' && (
            <button
              onClick={() => cambiarActivo(e.id, !e.activo)}
              className={`shrink-0 flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 font-medium transition-all hover:scale-[1.03] ${e.activo ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success'}`}
            >
              {e.activo ? <><Ban size={13} /> Desactivar</> : <><CheckCircle2 size={13} /> Activar</>}
            </button>
          )}
        </div>
      ))}

      {!cargando && empleadas.length === 0 && <p className="text-sm text-muted p-5">No hay empleadas registradas todavia.</p>}
    </div>
  )
}

function TabNuevaEmpleada() {
  const { guardando, crear } = useEmpleadas()
  const [nombreCompleto, setNombreCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMensaje(null)

    if (!nombreCompleto.trim() || !email.trim() || password.length < 6) {
      setError('Revisa nombre, correo y que la contrasena tenga al menos 6 caracteres.')
      return
    }

    const resultado = await crear({ nombreCompleto: nombreCompleto.trim(), email: email.trim(), password })

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }

    setMensaje(resultado.mensaje)
    setNombreCompleto('')
    setEmail('')
    setPassword('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3 max-w-lg">
      <h3 className="font-display font-bold text-ink text-sm flex items-center gap-2">
        <UserPlus size={16} /> Añadir nueva empleada
      </h3>

      <input type="text" placeholder="Nombre completo" value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" required />
      <input type="email" placeholder="Correo (para el login)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" required />
      <input type="text" placeholder="Contrasena provisional (minimo 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" required />

      {error && <Alert type="error">{error}</Alert>}
      {mensaje && <Alert type="success">{mensaje}</Alert>}

      <button type="submit" disabled={guardando} className="bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-4 py-2 text-sm">
        {guardando ? 'Creando...' : 'Crear empleada'}
      </button>

      <p className="text-xs text-muted">
        Comunicale el correo y la contrasena provisional directamente — todavia no se envia
        ningun email automatico. La cuenta se crea siempre con rol "empleada".
      </p>
    </form>
  )
}

export function EmpleadasPage() {
  const [tab, setTab] = useState<Tab>('asistencia')

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-black/5">
        <button onClick={() => setTab('asistencia')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'asistencia' ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
          Asistencia de hoy
        </button>
        <button onClick={() => setTab('plantilla')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'plantilla' ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
          Plantilla completa
        </button>
        <button onClick={() => setTab('nueva')} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'nueva' ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
          Nueva empleada
        </button>
      </div>

      {tab === 'asistencia' && <TabAsistenciaHoy />}
      {tab === 'plantilla' && <TabPlantilla />}
      {tab === 'nueva' && <TabNuevaEmpleada />}
    </div>
  )
}