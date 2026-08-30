import Avatar from '../ui/Avatar'
import type { Profile, TeamMembership } from '../../types'
import { classNames } from '../../lib/utils'

const ROLE_STYLE: Record<string, string> = {
  owner: 'bg-flow-50 text-flow-600 dark:bg-flow-500/10 dark:text-flow-400',
  admin: 'bg-amber/10 text-amber',
  member: 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400',
}

export default function MemberCard({
  profile,
  membership,
  taskCount,
  onClick,
}: {
  profile: Profile
  membership?: TeamMembership
  taskCount: number
  onClick?: () => void
}) {
  return (
    <button onClick={onClick} className="card flex items-center gap-3 p-4 text-left w-full hover:shadow-lg transition-shadow">
      <Avatar name={profile.full_name} color={profile.avatar_color} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-100">{profile.full_name}</p>
        <p className="truncate text-xs text-ink-400">{profile.email}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        {membership && (
          <span className={classNames('chip', ROLE_STYLE[membership.role])}>
            {membership.role}
          </span>
        )}
        <span className="font-mono text-[11px] text-ink-400">{taskCount} tasks</span>
      </div>
    </button>
  )
}
