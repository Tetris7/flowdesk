import { useCallback, useMemo, useState } from 'react'
import { Plus, Search, LayoutList, Columns3, ListChecks } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../lib/useAsync'
import { listTasks, listProjects, listProfiles, createTask, updateTask, deleteTask } from '../lib/db'
import type { Task, TaskStatus, TaskPriority } from '../types'
import { STATUS_ORDER, STATUS_LABELS } from '../types'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates'
import TaskRow from '../components/tasks/TaskRow'
import TaskFormModal from '../components/tasks/TaskFormModal'
import KanbanBoard from '../components/kanban/KanbanBoard'
import { classNames } from '../lib/utils'

export default function TasksPage() {
  const { user } = useAuth()
  const [view, setView] = useState<'list' | 'board'>('list')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const fetcher = useCallback(async () => {
    if (!user) throw new Error('Not signed in')
    const [tasks, projects, profiles] = await Promise.all([
      listTasks(user.id),
      listProjects(user.id, 'all'),
      listProfiles(user.id),
    ])
    return { tasks, projects, profiles }
  }, [user])

  const { data, status, retry, setData } = useAsync(fetcher, [user?.id])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.tasks
    if (statusFilter !== 'all') list = list.filter((t) => t.status === statusFilter)
    if (priorityFilter !== 'all') list = list.filter((t) => t.priority === priorityFilter)
    if (query.trim()) list = list.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    return list
  }, [data, statusFilter, priorityFilter, query])

  async function handleCreateOrUpdate(input: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    if (!user || !data) return
    if (editingTask) {
      const updated = await updateTask(user.id, editingTask.id, input)
      setData({ ...data, tasks: data.tasks.map((t) => (t.id === updated.id ? updated : t)) })
    } else {
      const created = await createTask(user.id, input)
      setData({ ...data, tasks: [created, ...data.tasks] })
    }
  }

  async function handleDelete() {
    if (!user || !data || !editingTask) return
    await deleteTask(user.id, editingTask.id)
    setData({ ...data, tasks: data.tasks.filter((t) => t.id !== editingTask.id) })
    setModalOpen(false)
    setEditingTask(null)
  }

  if (status === 'loading') return <LoadingState label="Loading tasks…" />
  if (status === 'error' || !data) return <ErrorState onRetry={retry} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">Tasks</h1>
          <p className="mt-1 text-sm text-ink-400">{data.tasks.length} across all projects</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingTask(null)
            setModalOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> New task
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-ink-100 dark:bg-ink-800 p-1">
            <button onClick={() => setView('list')} className={classNames('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', view === 'list' ? 'bg-surface dark:bg-ink-700 shadow-sm text-ink-900 dark:text-ink-100' : 'text-ink-500 dark:text-ink-400')}>
              <LayoutList className="h-3.5 w-3.5" /> List
            </button>
            <button onClick={() => setView('board')} className={classNames('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', view === 'board' ? 'bg-surface dark:bg-ink-700 shadow-sm text-ink-900 dark:text-ink-100' : 'text-ink-500 dark:text-ink-400')}>
              <Columns3 className="h-3.5 w-3.5" /> Board
            </button>
          </div>
          <select className="field-input !w-auto !py-1.5" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}>
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select className="field-input !w-auto !py-1.5" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}>
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="relative sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input className="field-input pl-9" placeholder="Search tasks…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ListChecks className="h-5 w-5" />} title="No tasks match" description="Try adjusting your filters or create a new task." />
      ) : view === 'list' ? (
        <div className="card p-5 divide-y divide-ink-100 dark:divide-ink-800">
          {filtered.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              project={data.projects.find((p) => p.id === task.project_id)}
              assignee={data.profiles.find((p) => p.id === task.assignee_id)}
              onClick={() => {
                setEditingTask(task)
                setModalOpen(true)
              }}
            />
          ))}
        </div>
      ) : (
        user && (
          <KanbanBoard
            userId={user.id}
            tasks={filtered}
            profiles={data.profiles}
            projects={data.projects}
            onTasksChange={(next) => {
              const ids = new Set(next.map((t) => t.id))
              setData({ ...data, tasks: [...data.tasks.filter((t) => !ids.has(t.id)), ...next] })
            }}
            onCardClick={(task) => {
              setEditingTask(task)
              setModalOpen(true)
            }}
          />
        )
      )}

      {user && (
        <TaskFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingTask(null)
          }}
          onSubmit={handleCreateOrUpdate}
          onDelete={editingTask ? handleDelete : undefined}
          initial={editingTask}
          projects={data.projects}
          profiles={data.profiles}
          userId={user.id}
        />
      )}
    </div>
  )
}
