import { Link } from 'react-router-dom'
import type { Task, Project, Profile } from '../../types'
import { StatusChip, PriorityChip } from '../ui/Chips'
import Avatar from '../ui/Avatar'
import { EmptyState } from '../ui/DataStates'
import { formatShortDate, isOverdue } from '../../lib/utils'
import { ListChecks } from 'lucide-react'

export default function RecentTasks({ tasks, projects, profiles }: { tasks: Task[]; projects: Project[]; profiles: Profile[] }) {
  if (tasks.length === 0) {
    return <EmptyState icon={<ListChecks className="h-5 w-5" />} title="No tasks yet" description="Create a project and add your first task to see it here." />
  }

  return (
    <div className="divide-y divide-ink-100 dark:divide-ink-800">
      {tasks.map((task) => {
        const project = projects.find((p) => p.id === task.project_id)
        const assignee = profiles.find((p) => p.id === task.assignee_id)
        const overdue = isOverdue(task.due_date, task.status)
        return (
          <Link
            key={task.id}
            to={project ? `/projects/${project.id}` : '/tasks'}
            className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 hover:bg-ink-50 dark:hover:bg-ink-800/50 -mx-2 px-2 rounded-lg transition-colors"
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
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <PriorityChip priority={task.priority} />
              <StatusChip status={task.status} />
              <span className={`font-mono text-xs ${overdue ? 'text-coral font-semibold' : 'text-ink-400'}`}>
                {formatShortDate(task.due_date)}
              </span>
              {assignee && <Avatar name={assignee.full_name} color={assignee.avatar_color} size="sm" />}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
