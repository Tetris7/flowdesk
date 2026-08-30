import { Link } from 'react-router-dom'
import type { Project, Task } from '../../types'
import ProgressBar from '../ui/ProgressBar'
import { EmptyState } from '../ui/DataStates'
import { FolderKanban } from 'lucide-react'

export default function ProjectProgressList({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban className="h-5 w-5" />}
        title="No active projects"
        description="Start a new project to track its progress here."
      />
    )
  }

  return (
    <div className="space-y-5">
      {projects.map((project) => {
        const projectTasks = tasks.filter((t) => t.project_id === project.id)
        const done = projectTasks.filter((t) => t.status === 'completed').length
        const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0
        return (
          <Link key={project.id} to={`/projects/${project.id}`} className="block group">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-medium text-ink-800 dark:text-ink-100 group-hover:text-flow-600">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                {project.name}
              </span>
              <span className="font-mono text-xs text-ink-400">{pct}%</span>
            </div>
            <ProgressBar value={pct} color={project.color} />
            <p className="mt-1 text-xs text-ink-400">
              {done} of {projectTasks.length} tasks complete
            </p>
          </Link>
        )
      })}
    </div>
  )
}
