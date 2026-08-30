import type { LucideIcon } from 'lucide-react'

export default function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: number
  icon: LucideIcon
  accent: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-500 dark:text-ink-400">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${accent}1A`, color: accent }}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-mono text-3xl font-semibold text-ink-900 dark:text-ink-100">{value}</p>
    </div>
  )
}
