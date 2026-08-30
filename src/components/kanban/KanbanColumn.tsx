import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Profile, Project, TaskStatus } from '../../types'
import { STATUS_LABELS } from '../../types'
import KanbanCard from './KanbanCard'

const COLUMN_DOT: Record<TaskStatus, string> = {
  todo: 'bg-ink-300',
  in_progress: 'bg-flow-500',
  review: 'bg-amber',
  completed: 'bg-tide-500',
}

export default function KanbanColumn({
  status,
  tasks,
  profiles,
  projects,
  onCardClick,
}: {
  status: TaskStatus
  tasks: Task[]
  profiles: Profile[]
  projects: Project[]
  onCardClick: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl2 bg-ink-50 dark:bg-ink-900/60 p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${COLUMN_DOT[status]}`} />
        <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{STATUS_LABELS[status]}</h3>
        <span className="ml-auto font-mono text-xs text-ink-400">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2.5 rounded-lg p-1 min-h-[120px] transition-colors ${isOver ? 'bg-flow-50 dark:bg-flow-500/10' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              assignee={profiles.find((p) => p.id === task.assignee_id)}
              project={projects.find((p) => p.id === task.project_id)}
              onClick={() => onCardClick(task)}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="py-6 text-center text-xs text-ink-300 dark:text-ink-600">Drop tasks here</p>
        )}
      </div>
    </div>
  )
}
