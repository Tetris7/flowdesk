import { useCallback, useMemo, useState } from 'react'
import { Plus, Search, FolderKanban } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../lib/useAsync'
import { listProjects, listTasks, listMemberships, listProfiles, createProject } from '../lib/db'
import type { ProjectStatus } from '../types'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates'
import ProjectCard from '../components/projects/ProjectCard'
import ProjectFormModal from '../components/projects/ProjectFormModal'
import { classNames } from '../lib/utils'

const FILTERS: Array<{ label: string; value: ProjectStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Archived', value: 'archived' },
]

export default function ProjectsPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const fetcher = useCallback(async () => {
    if (!user) throw new Error('Not signed in')
    const [projects, tasks, memberships, profiles] = await Promise.all([
      listProjects(user.id, 'all'),
      listTasks(user.id),
      listMemberships(user.id),
      listProfiles(user.id),
    ])
    return { projects, tasks, memberships, profiles }
  }, [user])

  const { data, status, retry, setData } = useAsync(fetcher, [user?.id])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.projects
    if (filter !== 'all') list = list.filter((p) => p.status === filter)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    return list
  }, [data, filter, query])

  async function handleCreate(input: { name: string; description: string; color: string }) {
    if (!user) return
    const project = await createProject(user.id, input)
    setData((prev) => (prev ? { ...prev, projects: [project, ...prev.projects] } : prev))
  }

  if (status === 'loading') return <LoadingState label="Loading projects…" />
  if (status === 'error' || !data) return <ErrorState onRetry={retry} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">Projects</h1>
          <p className="mt-1 text-sm text-ink-400">{data.projects.length} total</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-lg bg-ink-100 dark:bg-ink-800 p-1 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={classNames(
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                filter === f.value
                  ? 'bg-surface dark:bg-ink-700 text-ink-900 dark:text-ink-100 shadow-sm'
                  : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            className="field-input pl-9"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" />}
          title={query ? 'No projects match your search' : 'No projects here yet'}
          description={query ? 'Try a different search term.' : 'Create your first project to start organizing work.'}
          action={
            !query && (
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" /> New project
              </button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={data.tasks.filter((t) => t.project_id === project.id)}
              members={data.memberships.filter((m) => m.project_id === project.id)}
              profiles={data.profiles}
            />
          ))}
        </div>
      )}

      <ProjectFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
    </div>
  )
}
