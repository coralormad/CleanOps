import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useCheckIn } from '../../hooks/useCheckIn'
import { QRScanner } from '../../components/QRScanner'
import { Alert } from '../../components/Alert'

type Tipo = 'entrada' | 'salida'

export function FicharPage() {
  const { perfil } = useAuth()
  const { registrarFichaje, procesando, pendientes, actualizarContadorPendientes, sincronizarPendientes } = useCheckIn(perfil?.id, perfil?.nombreCompleto)
  const [tipo, setTipo] = useState<Tipo>('entrada')
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [exito, setExito] = useState(false)
  const [escaneando, setEscaneando] = useState(false)
  const [codigoManual, setCodigoManual] = useState('')
  const [foto, setFoto] = useState<File | null>(null)

  useEffect(() => {
    actualizarContadorPendientes()
    if (navigator.onLine) sincronizarPendientes()
    const handleOnline = () => sincronizarPendientes()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [actualizarContadorPendientes, sincronizarPendientes])

  const handleScan = async (codigo: string) => {
    setEscaneando(false)
    const resultado = await registrarFichaje(codigo, tipo, foto)
    setMensaje(resultado.mensaje)
    setExito(resultado.ok)
    setFoto(null)
  }

  const handleManual = async () => {
    if (!codigoManual.trim()) return
    const resultado = await registrarFichaje(codigoManual.trim(), tipo, foto)
    setMensaje(resultado.mensaje)
    setExito(resultado.ok)
    setCodigoManual('')
    setFoto(null)
  }

  return (
    <div className="max-w-sm mx-auto space-y-4">
      {pendientes > 0 && (
        <Alert type="warning">
          {pendientes} fichaje{pendientes > 1 ? 's' : ''} pendiente{pendientes > 1 ? 's' : ''} de sincronizar
        </Alert>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 space-y-4 animate-fade-in-up">
        <div className="flex gap-2">
          <button onClick={() => { setTipo('entrada'); setMensaje(null) }} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tipo === 'entrada' ? 'bg-primary text-white' : 'bg-black/5 text-ink hover:bg-black/10'}`}>
            Entrada
          </button>
          <button onClick={() => { setTipo('salida'); setMensaje(null) }} className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${tipo === 'salida' ? 'bg-primary text-white' : 'bg-black/5 text-ink hover:bg-black/10'}`}>
            Salida
          </button>
        </div>

        <div className="text-left">
          <label className="text-xs text-muted block mb-1.5">Foto {tipo === 'entrada' ? 'de antes' : 'de despues'} (opcional)</label>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} className="w-full text-sm text-muted" />
        </div>

        {!escaneando && (
          <button onClick={() => { setMensaje(null); setEscaneando(true) }} disabled={procesando} className="w-full bg-primary hover:bg-primary-dark transition-all hover:scale-[1.01] text-white font-medium rounded-lg px-3 py-2.5">
            {procesando ? 'Procesando...' : `Escanear QR para fichar ${tipo}`}
          </button>
        )}

        {escaneando && <QRScanner onScan={handleScan} />}

        <div className="pt-3 border-t border-black/5 space-y-2">
          <p className="text-xs text-muted">No funciona la camara? Escribe el codigo:</p>
          <input type="text" value={codigoManual} onChange={(e) => setCodigoManual(e.target.value)} placeholder="Codigo del edificio" className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={handleManual} disabled={procesando} className="w-full bg-black/5 hover:bg-black/10 transition-all hover:scale-[1.01] text-ink font-medium rounded-lg px-3 py-2 text-sm">
            Fichar {tipo} con codigo manual
          </button>
        </div>

        {mensaje && <Alert type={exito ? 'success' : 'error'}>{mensaje}</Alert>}
      </div>
    </div>
  )
}