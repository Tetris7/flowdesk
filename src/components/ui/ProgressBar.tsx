import { classNames } from '../../lib/utils'

export default function ProgressBar({ value, color = '#3454D1' }: { value: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="h-1.5 w-full rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
      <div
        className={classNames('h-full rounded-full transition-all duration-500')}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}
