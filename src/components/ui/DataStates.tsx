import { AlertTriangle, Inbox } from 'lucide-react'
import type { ReactNode } from 'react'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-flow-500 animate-bounce"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-coral/30 bg-coral/5 py-12 px-6 text-center">
      <AlertTriangle className="h-6 w-6 text-coral" />
      <p className="text-sm text-ink-700 dark:text-ink-200">{message}</p>
      {onRetry && (
        <button className="btn-danger" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border border-dashed border-ink-200 dark:border-ink-700 py-14 px-6 text-center">
      <div className="rounded-full bg-ink-100 dark:bg-ink-800 p-3 text-ink-400">{icon ?? <Inbox className="h-5 w-5" />}</div>
      <div>
        <p className="font-display font-semibold text-ink-800 dark:text-ink-100">{title}</p>
        {description && <p className="mt-1 text-sm text-ink-400 max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  )
}
