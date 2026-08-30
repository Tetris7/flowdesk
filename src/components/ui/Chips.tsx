import type { TaskStatus, TaskPriority, ProjectStatus } from '../../types'
import { STATUS_LABELS, PRIORITY_LABELS } from '../../types'
import { classNames } from '../../lib/utils'

const STATUS_STYLE: Record<TaskStatus, { dot: string; text: string; bg: string }> = {
  todo: { dot: 'bg-ink-300', text: 'text-ink-600 dark:text-ink-300', bg: 'bg-ink-100 dark:bg-ink-800' },
  in_progress: { dot: 'bg-flow-500', text: 'text-flow-600 dark:text-flow-400', bg: 'bg-flow-50 dark:bg-flow-500/10' },
  review: { dot: 'bg-amber', text: 'text-amber dark:text-amber', bg: 'bg-amber/10' },
  completed: { dot: 'bg-tide-500', text: 'text-tide-600 dark:text-tide-400', bg: 'bg-tide-50 dark:bg-tide-500/10' },
}

export function StatusChip({ status }: { status: TaskStatus }) {
  const s = STATUS_STYLE[status]
  return (
    <span className={classNames('chip', s.bg, s.text)}>
      <span className={classNames('status-dot', s.dot)} />
      {STATUS_LABELS[status]}
    </span>
  )
}

const PRIORITY_STYLE: Record<TaskPriority, { dot: string; text: string; bg: string }> = {
  low: { dot: 'bg-sage', text: 'text-sage', bg: 'bg-sage/10' },
  medium: { dot: 'bg-amber', text: 'text-amber', bg: 'bg-amber/10' },
  high: { dot: 'bg-coral', text: 'text-coral', bg: 'bg-coral/10' },
}

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  const s = PRIORITY_STYLE[priority]
  return (
    <span className={classNames('chip', s.bg, s.text)}>
      <span className={classNames('status-dot', s.dot)} />
      {PRIORITY_LABELS[priority]}
    </span>
  )
}

const PROJECT_STATUS_STYLE: Record<ProjectStatus, { dot: string; text: string; bg: string; label: string }> = {
  active: { dot: 'bg-flow-500', text: 'text-flow-600 dark:text-flow-400', bg: 'bg-flow-50 dark:bg-flow-500/10', label: 'Active' },
  completed: { dot: 'bg-tide-500', text: 'text-tide-600 dark:text-tide-400', bg: 'bg-tide-50 dark:bg-tide-500/10', label: 'Completed' },
  archived: { dot: 'bg-ink-300', text: 'text-ink-500 dark:text-ink-400', bg: 'bg-ink-100 dark:bg-ink-800', label: 'Archived' },
}

export function ProjectStatusChip({ status }: { status: ProjectStatus }) {
  const s = PROJECT_STATUS_STYLE[status]
  return (
    <span className={classNames('chip', s.bg, s.text)}>
      <span className={classNames('status-dot', s.dot)} />
      {s.label}
    </span>
  )
}
