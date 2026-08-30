import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import { StatusChip } from '../ui/Chips'
import type { Profile, Task, Project } from '../../types'
import { Link } from 'react-router-dom'

export default function MemberProfileModal({
  open,
  onClose,
  profile,
  tasks,
  projects,
}: {
  open: boolean
  onClose: () => void
  profile: Profile | null
  tasks: Task[]
  projects: Project[]
}) {
  if (!profile) return null
  const memberTasks = tasks.filter((t) => t.assignee_id === profile.id)
  const memberProjectIds = new Set(memberTasks.map((t) => t.project_id))
  const memberProjects = projects.filter((p) => memberProjectIds.has(p.id))

  return (
    <Modal open={open} onClose={onClose} title="Team member">
      <div className="mb-5 flex items-center gap-3">
        <Avatar name={profile.full_name} color={profile.avatar_color} size="lg" />
        <div>
          <p className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100">{profile.full_name}</p>
          <p className="text-sm text-ink-400">{profile.email}</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Projects</p>
        {memberProjects.length === 0 ? (
          <p className="text-sm text-ink-400">Not assigned to any tasks yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {memberProjects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} onClick={onClose} className="chip bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Assigned tasks ({memberTasks.length})</p>
        <div className="max-h-56 space-y-2 overflow-y-auto scrollbar-thin">
          {memberTasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg bg-ink-50 dark:bg-ink-800 px-3 py-2">
              <p className="truncate text-sm text-ink-700 dark:text-ink-200">{t.title}</p>
              <StatusChip status={t.status} />
            </div>
          ))}
        </div>
      </div>
    </Modal>
  )
}
