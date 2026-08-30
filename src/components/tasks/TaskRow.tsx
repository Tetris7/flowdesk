import type { Task, Project, Profile } from '../../types'
import { StatusChip, PriorityChip } from '../ui/Chips'
import Avatar from '../ui/Avatar'
import { formatShortDate, isOverdue, classNames } from '../../lib/utils'

export default function TaskRow({
  task,
  project,
  assignee,
  onClick,
}: {
  task: Task
  project?: Project
  assignee?: Profile
  onClick: () => void
}) {
  const overdue = isOverdue(task.due_date, task.status)
  return (
    <button
      onClick={onClick}
      className="flex w-full flex-col gap-2 py-3.5 text-left sm:flex-row sm:items-center sm:gap-4 hover:bg-ink-50 dark:hover:bg-ink-800/50 -mx-2 px-2 rounded-lg transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900 dark:text-ink-100">{task.title}</p>
        {project && (
          <span className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-400">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
            {project.name}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:w-auto">
        <PriorityChip priority={task.priority} />
        <StatusChip status={task.status} />
        <span className={classNames('w-20 flex-shrink-0 font-mono text-xs', overdue ? 'text-coral font-semibold' : 'text-ink-400')}>
          {formatShortDate(task.due_date)}
        </span>
        {assignee ? <Avatar name={assignee.full_name} color={assignee.avatar_color} size="sm" /> : <span className="h-9 w-9" />}
      </div>
    </button>
  )
}
