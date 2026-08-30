import { Link } from 'react-router-dom'
import type { Project, Task, TeamMembership, Profile } from '../../types'
import { ProjectStatusChip } from '../ui/Chips'
import ProgressBar from '../ui/ProgressBar'
import Avatar from '../ui/Avatar'

export default function ProjectCard({
  project,
  tasks,
  members,
  profiles,
}: {
  project: Project
  tasks: Task[]
  members: TeamMembership[]
  profiles: Profile[]
}) {
  const done = tasks.filter((t) => t.status === 'completed').length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const memberProfiles = members.map((m) => profiles.find((p) => p.id === m.profile_id)).filter(Boolean) as Profile[]

  return (
    <Link to={`/projects/${project.id}`} className="card flex flex-col p-5 transition-shadow hover:shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: project.color }} />
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-ink-900 dark:text-ink-100 truncate">{project.name}</h3>
        </div>
        <ProjectStatusChip status={project.status} />
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-ink-500 dark:text-ink-400 flex-1">{project.description}</p>

      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-ink-400">
            {done} / {tasks.length} tasks
          </span>
          <span className="font-mono text-ink-500 dark:text-ink-300">{pct}%</span>
        </div>
        <ProgressBar value={pct} color={project.color} />
      </div>

      <div className="flex items-center -space-x-2">
        {memberProfiles.slice(0, 4).map((p) => (
          <Avatar key={p.id} name={p.full_name} color={p.avatar_color} size="sm" />
        ))}
        {memberProfiles.length > 4 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-700 text-[10px] font-semibold text-ink-500 dark:text-ink-300 ring-2 ring-surface dark:ring-ink-900">
            +{memberProfiles.length - 4}
          </span>
        )}
      </div>
    </Link>
  )
}
