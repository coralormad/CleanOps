export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-black/10 rounded ${className}`} />
}