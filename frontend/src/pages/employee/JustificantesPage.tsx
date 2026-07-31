import { useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useMisJustificantes, type TipoJustificante } from '../../hooks/useMisJustificantes'
import { Skeleton } from '../../components/Skeleton'
import { Alert } from '../../components/Alert'

const TIPOS: { value: TipoJustificante; label: string }[] = [
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'baja_medica', label: 'Baja medica' },
  { value: 'asuntos_propios', label: 'Asuntos propios' },
  { value: 'otro', label: 'Otro' },
]

function badgeStyle(estado: string) {
  if (estado === 'aprobado') return 'bg-success-bg text-success'
  if (estado === 'rechazado') return 'bg-danger-bg text-danger'
  return 'bg-warning-bg text-warning'
}

export function JustificantesPage() {
  const { perfil } = useAuth()
  const { justificantes, cargando, guardando, crear, cancelar } = useMisJustificantes(perfil?.id, perfil?.nombreCompleto)

  const [tipo, setTipo] = useState<TipoJustificante>('vacaciones')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [motivo, setMotivo] = useState('')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMensaje(null)

    if (!fechaInicio || !fechaFin) {
      setError('Selecciona la fecha de inicio y de fin.')
      return
    }

    if (fechaFin < fechaInicio) {
      setError('La fecha de fin no puede ser anterior a la de inicio.')
      return
    }

    const resultado = await crear({ tipo, fechaInicio, fechaFin, motivo })

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }

    setMensaje(resultado.mensaje)
    setFechaInicio('')
    setFechaFin('')
    setMotivo('')
  }

  return (
    <div className="space-y-4 max-w-lg">
      <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3 animate-fade-in-up">
        <h3 className="font-display font-bold text-ink text-sm">Enviar justificante</h3>

        <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoJustificante)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm">
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted block mb-1">Desde</label>
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" required />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Hasta</label>
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" required />
          </div>
        </div>

        <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (opcional)" rows={3} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm resize-none transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />

        {error && <Alert type="error">{error}</Alert>}
        {mensaje && <Alert type="success">{mensaje}</Alert>}

        <button type="submit" disabled={guardando} className="bg-primary hover:bg-primary-dark transition-all hover:scale-[1.01] text-white font-medium rounded-lg px-4 py-2 text-sm">
          {guardando ? 'Enviando...' : 'Enviar justificante'}
        </button>
      </form>

      <div>
        <h3 className="font-display font-bold text-ink text-sm mb-2">Mis justificantes</h3>
        <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
          {cargando && (
            <div className="p-5 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          )}
          {!cargando && justificantes.map((j, i) => (
            <div key={j.id} className="flex items-center justify-between px-5 py-3.5 gap-3 transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 30}ms` }}>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink capitalize">{j.tipo.replace('_', ' ')}</p>
                <p className="text-xs text-muted">{j.fecha_inicio} a {j.fecha_fin}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeStyle(j.estado)}`}>{j.estado}</span>
                {j.estado === 'pendiente' && (
                  <button onClick={() => cancelar(j.id)} className="text-xs text-danger underline transition-opacity hover:opacity-70">Cancelar</button>
                )}
              </div>
            </div>
          ))}
          {!cargando && justificantes.length === 0 && <p className="text-sm text-muted p-5">No has enviado ningun justificante todavia.</p>}
        </div>
      </div>
    </div>
  )
}