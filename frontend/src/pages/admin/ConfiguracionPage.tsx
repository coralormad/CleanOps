import { useState, type FormEvent } from 'react'
import { Settings, MapPin, Copy, Check, Trash2 } from 'lucide-react'
import { useUbicaciones, type Ubicacion } from '../../hooks/useUbicaciones'
import { useTurnos } from '../../hooks/useTurnos'
import { useEmpleadas } from '../../hooks/useEmpleadas'
import { DireccionBuscador } from '../../components/DireccionBuscador'
import { Skeleton } from '../../components/Skeleton'
import { Alert } from '../../components/Alert'

type Tab = 'ubicaciones' | 'turnos'

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo']

interface FormUbicacionProps {
  crear: ReturnType<typeof useUbicaciones>['crear']
  guardando: boolean
  onCreada: (mensaje: string) => void
}

function FormNuevaUbicacion({ crear, guardando, onCreada }: FormUbicacionProps) {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [latitud, setLatitud] = useState<number | null>(null)
  const [longitud, setLongitud] = useState<number | null>(null)
  const [radio, setRadio] = useState('75')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const rad = parseInt(radio, 10)

    if (!nombre.trim() || latitud === null || longitud === null || isNaN(rad)) {
      setError('Escribe un nombre, busca y selecciona una direccion, y revisa el radio.')
      return
    }

    const resultado = await crear({ nombre: nombre.trim(), direccion, latitud, longitud, radio_geofence_metros: rad })

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }

    onCreada(resultado.mensaje)
    setNombre('')
    setDireccion('')
    setLatitud(null)
    setLongitud(null)
    setRadio('75')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3">
      <h3 className="font-display font-bold text-ink text-sm">Añadir nueva ubicacion</h3>

      <input type="text" placeholder="Nombre del edificio (interno, para identificarlo)" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" required />

      <DireccionBuscador onSeleccionar={(dir, lat, lon) => { setDireccion(dir); setLatitud(lat || null); setLongitud(lon || null) }} />

      <div>
        <label className="text-xs text-muted block mb-1">Radio de tolerancia GPS (metros)</label>
        <input type="number" value={radio} onChange={(e) => setRadio(e.target.value)} className="w-32 border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <button type="submit" disabled={guardando} className="bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-4 py-2 text-sm">
        {guardando ? 'Creando...' : 'Crear ubicacion'}
      </button>

      <p className="text-xs text-muted">El codigo QR se genera solo. Copialo de la lista de abajo y pegalo en un generador de QR externo para imprimirlo, igual que hicimos con TEST-001.</p>
    </form>
  )
}

function FilaUbicacion({ ubicacion, indice }: { ubicacion: Ubicacion; indice: number }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(ubicacion.codigo_qr)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-3 transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${indice * 30}ms` }}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{ubicacion.nombre}</p>
        <p className="text-xs text-muted truncate">{ubicacion.direccion || 'Sin direccion'} - radio {ubicacion.radio_geofence_metros}m</p>
      </div>
      <button onClick={copiar} className="shrink-0 flex items-center gap-1.5 text-xs bg-black/5 hover:bg-black/10 transition-all hover:scale-[1.03] rounded-lg px-3 py-1.5 font-mono">
        {copiado ? <Check size={13} className="text-success" /> : <Copy size={13} />}
        {ubicacion.codigo_qr}
      </button>
    </div>
  )
}

function TabUbicaciones() {
  const { ubicaciones, cargando, guardando, crear } = useUbicaciones()
  const [mensaje, setMensaje] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {mensaje && <Alert type="success">{mensaje}</Alert>}

      <FormNuevaUbicacion crear={crear} guardando={guardando} onCreada={setMensaje} />

      <div>
        <h3 className="font-display font-bold text-ink text-sm mb-2">Ubicaciones existentes</h3>
        <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
          {cargando && (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          )}
          {!cargando && ubicaciones.map((u, i) => <FilaUbicacion key={u.id} ubicacion={u} indice={i} />)}
          {!cargando && ubicaciones.length === 0 && <p className="text-sm text-muted p-5">No hay ubicaciones registradas todavia.</p>}
        </div>
      </div>
    </div>
  )
}

function FormNuevoTurno({ crear, guardando, onCreado }: { crear: ReturnType<typeof useTurnos>['crear']; guardando: boolean; onCreado: (mensaje: string) => void }) {
  const { empleadas } = useEmpleadas()
  const { ubicaciones } = useUbicaciones()
  const [empleadaId, setEmpleadaId] = useState('')
  const [ubicacionId, setUbicacionId] = useState('')
  const [diaSemana, setDiaSemana] = useState('1')
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFin, setHoraFin] = useState('11:00')
  const [error, setError] = useState<string | null>(null)

  const empleadasActivas = empleadas.filter((e) => e.rol === 'empleada' && e.activo)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!empleadaId || !ubicacionId) {
      setError('Selecciona una empleada y una ubicacion.')
      return
    }

    if (horaFin <= horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.')
      return
    }

    const resultado = await crear({ empleadaId, ubicacionId, diaSemana: parseInt(diaSemana, 10), horaInicio, horaFin })

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }

    onCreado(resultado.mensaje)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3">
      <h3 className="font-display font-bold text-ink text-sm">Asignar nuevo turno</h3>

      <select value={empleadaId} onChange={(e) => setEmpleadaId(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm" required>
        <option value="">Selecciona una empleada</option>
        {empleadasActivas.map((emp) => <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>)}
      </select>

      <select value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm" required>
        <option value="">Selecciona un edificio</option>
        {ubicaciones.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
      </select>

      <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm">
        {DIAS_SEMANA.slice(1).map((dia, indice) => <option key={indice + 1} value={indice + 1}>{dia}</option>)}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Hora de inicio</label>
          <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Hora de fin</label>
          <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <button type="submit" disabled={guardando} className="bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-4 py-2 text-sm">
        {guardando ? 'Guardando...' : 'Asignar turno'}
      </button>
    </form>
  )
}

function TabTurnos() {
  const { turnos, cargando, guardando, crear, eliminar } = useTurnos()
  const [mensaje, setMensaje] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {mensaje && <Alert type="success">{mensaje}</Alert>}

      <FormNuevoTurno crear={crear} guardando={guardando} onCreado={setMensaje} />

      <div>
        <h3 className="font-display font-bold text-ink text-sm mb-2">Turnos asignados</h3>
        <div className="bg-white border border-black/5 rounded-2xl shadow-sm overflow-hidden">
          {cargando && (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          )}

          {!cargando && turnos.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02]">
                    <th className="text-left font-medium text-muted px-4 py-3">Empleada</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Dia</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Horario</th>
                    <th className="text-left font-medium text-muted px-4 py-3">Edificio</th>
                    <th className="text-left font-medium text-muted px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {turnos.map((t, i) => (
                    <tr key={t.id} className="transition-colors hover:bg-black/[0.02] animate-fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
                      <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">{t.empleadas?.nombre_completo ?? 'Empleada desconocida'}</td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">{DIAS_SEMANA[t.dia_semana]}</td>
                      <td className="px-4 py-3 text-ink whitespace-nowrap">{t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}</td>
                      <td className="px-4 py-3 text-ink">{t.ubicaciones_portales?.nombre ?? 'Edificio desconocido'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => eliminar(t.id)} className="text-danger hover:bg-danger-bg transition-all hover:scale-110 rounded-lg p-1.5" aria-label="Eliminar turno">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!cargando && turnos.length === 0 && <p className="text-sm text-muted p-5">No hay turnos asignados todavia.</p>}
        </div>
      </div>
    </div>
  )
}

export function ConfiguracionPage() {
  const [tab, setTab] = useState<Tab>('ubicaciones')

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-black/5">
        <button onClick={() => setTab('ubicaciones')} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'ubicaciones' ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
          <MapPin size={16} /> Ubicaciones QR
        </button>
        <button onClick={() => setTab('turnos')} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === 'turnos' ? 'border-primary text-primary' : 'border-transparent text-muted'}`}>
          <Settings size={16} /> Turnos
        </button>
      </div>

      {tab === 'ubicaciones' ? <TabUbicaciones /> : <TabTurnos />}
    </div>
  )
}