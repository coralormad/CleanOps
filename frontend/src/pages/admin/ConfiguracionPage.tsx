import { useState, type FormEvent } from 'react'
import { Settings, MapPin, Copy, Check, Trash2 } from 'lucide-react'
import { useUbicaciones, type Ubicacion } from '../../hooks/useUbicaciones'
import { useTurnos } from '../../hooks/useTurnos'
import { useEmpleadas } from '../../hooks/useEmpleadas'

type Tab = 'ubicaciones' | 'turnos'

const DIAS_SEMANA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

interface FormUbicacionProps {
  crear: ReturnType<typeof useUbicaciones>['crear']
  guardando: boolean
  onCreada: (mensaje: string) => void
}

function FormNuevaUbicacion({ crear, guardando, onCreada }: FormUbicacionProps) {
  const [nombre, setNombre] = useState('')
  const [direccion, setDireccion] = useState('')
  const [latitud, setLatitud] = useState('')
  const [longitud, setLongitud] = useState('')
  const [radio, setRadio] = useState('75')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    const lat = parseFloat(latitud)
    const lon = parseFloat(longitud)
    const rad = parseInt(radio, 10)

    if (!nombre.trim() || isNaN(lat) || isNaN(lon) || isNaN(rad)) {
      setError('Revisa que nombre, latitud, longitud y radio estén rellenos correctamente.')
      return
    }

    const resultado = await crear({
      nombre: nombre.trim(),
      direccion,
      latitud: lat,
      longitud: lon,
      radio_geofence_metros: rad,
    })

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }

    onCreada(resultado.mensaje)
    setNombre('')
    setDireccion('')
    setLatitud('')
    setLongitud('')
    setRadio('75')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3">
      <h3 className="font-display font-bold text-ink text-sm">Añadir nueva ubicación</h3>

      <input
        type="text"
        placeholder="Nombre del edificio"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
        required
      />
      <input
        type="text"
        placeholder="Dirección (opcional)"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Latitud (ej. 37.393439)"
          value={latitud}
          onChange={(e) => setLatitud(e.target.value)}
          className="border border-black/10 rounded-lg px-3 py-2 text-sm"
          required
        />
        <input
          type="text"
          placeholder="Longitud (ej. -5.986623)"
          value={longitud}
          onChange={(e) => setLongitud(e.target.value)}
          className="border border-black/10 rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>
      <div>
        <label className="text-xs text-muted block mb-1">Radio de tolerancia GPS (metros)</label>
        <input
          type="number"
          value={radio}
          onChange={(e) => setRadio(e.target.value)}
          className="w-32 border border-black/10 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-4 py-2 text-sm"
      >
        {guardando ? 'Creando...' : 'Crear ubicación'}
      </button>

      <p className="text-xs text-muted">
        El código QR se genera solo. Cópialo de la lista de abajo y pégalo en un generador de QR
        externo para imprimirlo, igual que hicimos con TEST-001.
      </p>
    </form>
  )
}

function FilaUbicacion({ ubicacion }: { ubicacion: Ubicacion }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(ubicacion.codigo_qr)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <div className="flex items-center justify-between px-5 py-3.5 gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink truncate">{ubicacion.nombre}</p>
        <p className="text-xs text-muted truncate">
          {ubicacion.direccion || 'Sin dirección'} · radio {ubicacion.radio_geofence_metros}m
        </p>
      </div>
      <button
        onClick={copiar}
        className="shrink-0 flex items-center gap-1.5 text-xs bg-black/5 hover:bg-black/10 transition-colors rounded-lg px-3 py-1.5 font-mono"
      >
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
      {mensaje && <p className="text-sm bg-success-bg text-success rounded-lg px-4 py-2.5">{mensaje}</p>}

      <FormNuevaUbicacion crear={crear} guardando={guardando} onCreada={setMensaje} />

      <div>
        <h3 className="font-display font-bold text-ink text-sm mb-2">Ubicaciones existentes</h3>
        <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
          {cargando && <p className="text-sm text-muted p-5">Cargando ubicaciones...</p>}
          {!cargando && ubicaciones.map((u) => <FilaUbicacion key={u.id} ubicacion={u} />)}
          {!cargando && ubicaciones.length === 0 && (
            <p className="text-sm text-muted p-5">No hay ubicaciones registradas todavía.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function FormNuevoTurno({
  crear,
  guardando,
  onCreado,
}: {
  crear: ReturnType<typeof useTurnos>['crear']
  guardando: boolean
  onCreado: (mensaje: string) => void
}) {
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
      setError('Selecciona una empleada y una ubicación.')
      return
    }

    if (horaFin <= horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.')
      return
    }

    const resultado = await crear({
      empleadaId,
      ubicacionId,
      diaSemana: parseInt(diaSemana, 10),
      horaInicio,
      horaFin,
    })

    if (!resultado.ok) {
      setError(resultado.mensaje)
      return
    }

    onCreado(resultado.mensaje)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-black/5 rounded-2xl shadow-sm p-5 space-y-3">
      <h3 className="font-display font-bold text-ink text-sm">Asignar nuevo turno</h3>

      <select
        value={empleadaId}
        onChange={(e) => setEmpleadaId(e.target.value)}
        className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
        required
      >
        <option value="">Selecciona una empleada</option>
        {empleadasActivas.map((emp) => (
          <option key={emp.id} value={emp.id}>{emp.nombre_completo}</option>
        ))}
      </select>

      <select
        value={ubicacionId}
        onChange={(e) => setUbicacionId(e.target.value)}
        className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
        required
      >
        <option value="">Selecciona un edificio</option>
        {ubicaciones.map((u) => (
          <option key={u.id} value={u.id}>{u.nombre}</option>
        ))}
      </select>

      <select
        value={diaSemana}
        onChange={(e) => setDiaSemana(e.target.value)}
        className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
      >
        {DIAS_SEMANA.slice(1).map((dia, i) => (
          <option key={i + 1} value={i + 1}>{dia}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted block mb-1">Hora de inicio</label>
          <input
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1">Hora de fin</label>
          <input
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {error && <p className="text-danger text-sm">{error}</p>}

      <button
        type="submit"
        disabled={guardando}
        className="bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-4 py-2 text-sm"
      >
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
      {mensaje && <p className="text-sm bg-success-bg text-success rounded-lg px-4 py-2.5">{mensaje}</p>}

      <FormNuevoTurno crear={crear} guardando={guardando} onCreado={setMensaje} />

      <div>
        <h3 className="font-display font-bold text-ink text-sm mb-2">Turnos asignados</h3>
        <div className="bg-white border border-black/5 rounded-2xl shadow-sm divide-y divide-black/5">
          {cargando && <p className="text-sm text-muted p-5">Cargando turnos...</p>}

          {!cargando && turnos.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3.5 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">
                  {t.empleadas?.nombre_completo ?? 'Empleada desconocida'}
                </p>
                <p className="text-xs text-muted truncate">
                  {DIAS_SEMANA[t.dia_semana]} · {t.hora_inicio.slice(0, 5)}–{t.hora_fin.slice(0, 5)} ·{' '}
                  {t.ubicaciones_portales?.nombre ?? 'Edificio desconocido'}
                </p>
              </div>
              <button
                onClick={() => eliminar(t.id)}
                className="shrink-0 text-danger hover:bg-danger-bg transition-colors rounded-lg p-2"
                aria-label="Eliminar turno"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {!cargando && turnos.length === 0 && (
            <p className="text-sm text-muted p-5">No hay turnos asignados todavía.</p>
          )}
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
        <button
          onClick={() => setTab('ubicaciones')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'ubicaciones' ? 'border-primary text-primary' : 'border-transparent text-muted'
          }`}
        >
          <MapPin size={16} /> Ubicaciones QR
        </button>
        <button
          onClick={() => setTab('turnos')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'turnos' ? 'border-primary text-primary' : 'border-transparent text-muted'
          }`}
        >
          <Settings size={16} /> Turnos
        </button>
      </div>

      {tab === 'ubicaciones' ? <TabUbicaciones /> : <TabTurnos />}
    </div>
  )
}