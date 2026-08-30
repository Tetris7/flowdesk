import type { ActivityLog, Profile } from '../../types'
import { formatRelativeTime } from '../../lib/utils'
import Avatar from '../ui/Avatar'
import { EmptyState } from '../ui/DataStates'
import { History } from 'lucide-react'

export default function ActivityFeed({ activity, profiles }: { activity: ActivityLog[]; profiles: Profile[] }) {
  if (activity.length === 0) {
    return <EmptyState icon={<History className="h-5 w-5" />} title="No activity yet" description="Actions across your projects will show up here." />
  }

  return (
    <ul className="space-y-4">
      {activity.map((item) => {
        const actor = profiles.find((p) => p.id === item.actor_id)
        return (
          <li key={item.id} className="flex gap-3">
            <Avatar name={actor?.full_name ?? 'Unknown'} color={actor?.avatar_color ?? '#9EA1B3'} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-700 dark:text-ink-200">
                <span className="font-semibold text-ink-900 dark:text-ink-100">{actor?.full_name ?? 'Someone'}</span>{' '}
                {item.detail}
              </p>
              <p className="text-xs text-ink-400">{formatRelativeTime(item.created_at)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
