import { useState, type FormEvent } from 'react'
import { UserPlus, Ban, CheckCircle2 } from 'lucide-react'
import { useEmpleadas } from '../../hooks/useEmpleadas'

function badgeRol(rol: string) {
  if (rol === 'gerencia') return 'bg-primary/10 text-primary'
  if (rol === 'supervisor') return 'bg-warning-bg text-warning'
  return 'bg-black/5 text-ink'
}

export function EmpleadasPage() {
  const { empleadas, cargando, guardando, crear, cambiarActivo } = useEmpleadas()
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
      setError('Revisa nombre, correo y que la contraseña tenga al menos 6 caracteres.')
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
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3">
        <h3 className="font-display font-bold text-ink text-sm flex items-center gap-2">
          <UserPlus size={16} /> Añadir nueva empleada
        </h3>

        <input
          type="text"
          placeholder="Nombre completo"
          value={nombreCompleto}
          onChange={(e) => setNombreCompleto(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
          required
        />
        <input
          type="email"
          placeholder="Correo (para el login)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Contraseña provisional (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
          required
        />

        {error && <p className="text-danger text-sm">{error}</p>}
        {mensaje && <p className="text-success text-sm">{mensaje}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-4 py-2 text-sm"
        >
          {guardando ? 'Creando...' : 'Crear empleada'}
        </button>

        <p className="text-xs text-muted">
          Comunícale el correo y la contraseña provisional directamente — todavía no se envía
          ningún email automático. La cuenta se crea siempre con rol "empleada".
        </p>
      </form>

      <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
        {cargando && <p className="text-sm text-muted p-5">Cargando plantilla...</p>}

        {!cargando && empleadas.map((e) => (
          <div key={e.id} className={`flex items-center justify-between px-5 py-3.5 gap-3 ${!e.activo ? 'opacity-50' : ''}`}>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{e.nombre_completo}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${badgeRol(e.rol)}`}>
                {e.rol}
              </span>
            </div>

            {e.rol === 'empleada' && (
              <button
                onClick={() => cambiarActivo(e.id, !e.activo)}
                className={`shrink-0 flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5 font-medium transition-colors ${
                  e.activo ? 'bg-danger-bg text-danger' : 'bg-success-bg text-success'
                }`}
              >
                {e.activo ? <><Ban size={13} /> Desactivar</> : <><CheckCircle2 size={13} /> Activar</>}
              </button>
            )}
          </div>
        ))}

        {!cargando && empleadas.length === 0 && (
          <p className="text-sm text-muted p-5">No hay empleadas registradas todavía.</p>
        )}
      </div>
    </div>
  )
}