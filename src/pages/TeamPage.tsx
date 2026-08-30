import { useCallback, useMemo, useState } from 'react'
import { Search, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../lib/useAsync'
import { listProfiles, listMemberships, listTasks, listProjects } from '../lib/db'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates'
import MemberCard from '../components/team/MemberCard'
import MemberProfileModal from '../components/team/MemberProfileModal'
import type { Profile } from '../types'
import { classNames } from '../lib/utils'

const ROLE_FILTERS = ['all', 'owner', 'admin', 'member'] as const

export default function TeamPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<(typeof ROLE_FILTERS)[number]>('all')
  const [selected, setSelected] = useState<Profile | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetcher = useCallback(async () => {
    if (!user) throw new Error('Not signed in')
    const [profiles, memberships, tasks, projects] = await Promise.all([
      listProfiles(user.id),
      listMemberships(user.id),
      listTasks(user.id),
      listProjects(user.id, 'all'),
    ])
    return { profiles, memberships, tasks, projects }
  }, [user])

  const { data, status, retry } = useAsync(fetcher, [user?.id])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.profiles
    if (query.trim()) list = list.filter((p) => p.full_name.toLowerCase().includes(query.toLowerCase()))
    if (role !== 'all') {
      const idsWithRole = new Set(data.memberships.filter((m) => m.role === role).map((m) => m.profile_id))
      list = list.filter((p) => idsWithRole.has(p.id))
    }
    return list
  }, [data, query, role])

  if (status === 'loading') return <LoadingState label="Loading team…" />
  if (status === 'error' || !data) return <ErrorState onRetry={retry} />

  function highestRole(profileId: string) {
    const roles = data!.memberships.filter((m) => m.profile_id === profileId).map((m) => m.role)
    if (roles.includes('owner')) return 'owner'
    if (roles.includes('admin')) return 'admin'
    return 'member'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">Team</h1>
        <p className="mt-1 text-sm text-ink-400">{data.profiles.length} people across your workspace</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-ink-100 dark:bg-ink-800 p-1 w-fit">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={classNames(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                role === r ? 'bg-surface dark:bg-ink-700 text-ink-900 dark:text-ink-100 shadow-sm' : 'text-ink-500 dark:text-ink-400'
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input className="field-input pl-9" placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No one matches" description="Try a different search or filter." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <MemberCard
              key={p.id}
              profile={p}
              membership={data.memberships.find((m) => m.profile_id === p.id && m.role === highestRole(p.id))}
              taskCount={data.tasks.filter((t) => t.assignee_id === p.id).length}
              onClick={() => {
                setSelected(p)
                setModalOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <MemberProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        profile={selected}
        tasks={data.tasks}
        projects={data.projects}
      />
    </div>
  )
}
