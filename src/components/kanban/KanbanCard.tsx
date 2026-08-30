import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, Profile, Project } from '../../types'
import { PriorityChip } from '../ui/Chips'
import Avatar from '../ui/Avatar'
import { formatShortDate, isOverdue, classNames } from '../../lib/utils'

export default function KanbanCard({
  task,
  assignee,
  project,
  onClick,
}: {
  task: Task
  assignee?: Profile
  project?: Project
  onClick: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const overdue = isOverdue(task.due_date, task.status)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={classNames(
        'card cursor-grab active:cursor-grabbing p-3.5 touch-none select-none',
        isDragging && 'opacity-40'
      )}
    >
      {project && (
        <span className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
          {project.name}
        </span>
      )}
      <p className="text-sm font-medium text-ink-900 dark:text-ink-100 leading-snug">{task.title}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <PriorityChip priority={task.priority} />
        </div>
        {assignee && <Avatar name={assignee.full_name} color={assignee.avatar_color} size="sm" />}
      </div>
      {task.due_date && (
        <p className={classNames('mt-2 font-mono text-[11px]', overdue ? 'text-coral font-semibold' : 'text-ink-400')}>
          Due {formatShortDate(task.due_date)}
        </p>
      )}
    </div>
  )
}
