import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  titulo: string
  descripcion: string
}

export function ProximamentePage({ icon: Icon, titulo, descripcion }: Props) {
  return (
    <div className="bg-white border border-black/5 rounded-2xl shadow-sm p-10 flex flex-col items-center text-center max-w-md mx-auto mt-8">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon size={22} className="text-primary" />
      </div>
      <h2 className="font-display font-bold text-ink mb-1">{titulo}</h2>
      <p className="text-sm text-muted">{descripcion}</p>
    </div>
  )
}