import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!navigator.onLine) {
      setError('Sin conexión a internet. Necesitas red para iniciar sesión la primera vez.')
      return
    }

    const loginError = await iniciarSesion(email, password)
    if (loginError) {
      if (loginError.message.toLowerCase().includes('fetch')) {
        setError('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.')
      } else {
        setError('Correo o contraseña incorrectos.')
      }
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-4">
            <span className="font-display font-extrabold text-white text-2xl">V</span>
          </div>
          <h1 className="font-display font-bold text-xl text-ink">Vite Servicios</h1>
          <p className="text-sm text-muted">Fichaje y evidencia</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
          <input
            type="email"
            placeholder="Correo corporativo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            required
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark transition-colors text-white font-medium rounded-lg px-3 py-2.5"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}