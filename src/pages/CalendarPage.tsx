import { useCallback, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../lib/useAsync'
import { listTasks, listProjects, listProfiles, updateTask, deleteTask, createTask } from '../lib/db'
import type { Task } from '../types'
import { LoadingState, ErrorState } from '../components/ui/DataStates'
import TaskFormModal from '../components/tasks/TaskFormModal'
import { classNames } from '../lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = first.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ date: Date; inMonth: boolean }> = []
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, 1 - (startOffset - i))
    cells.push({ date: d, inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), inMonth: true })
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false })
  }
  return cells
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [cursor, setCursor] = useState(() => new Date())
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetcher = useCallback(async () => {
    if (!user) throw new Error('Not signed in')
    const [tasks, projects, profiles] = await Promise.all([listTasks(user.id), listProjects(user.id, 'all'), listProfiles(user.id)])
    return { tasks, projects, profiles }
  }, [user])

  const { data, status, retry, setData } = useAsync(fetcher, [user?.id])

  const grid = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()), [cursor])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    if (!data) return map
    data.tasks.forEach((t) => {
      if (!t.due_date) return
      const key = t.due_date.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    })
    return map
  }, [data])

  async function handleUpdate(input: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
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

  if (status === 'loading') return <LoadingState label="Loading calendar…" />
  if (status === 'error' || !data) return <ErrorState onRetry={retry} />

  const today = new Date()
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">Calendar</h1>
          <p className="mt-1 text-sm text-ink-400">Deadlines across every project</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost !p-2" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[140px] text-center font-display font-semibold text-ink-900 dark:text-ink-100">{monthLabel}</span>
          <button className="btn-ghost !p-2" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-800/50">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-ink-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map(({ date, inMonth }, i) => {
            const key = date.toISOString().slice(0, 10)
            const dayTasks = tasksByDay.get(key) ?? []
            const isToday = date.toDateString() === today.toDateString()
            return (
              <div key={i} className={classNames('min-h-[92px] border-b border-r border-ink-100 dark:border-ink-800 p-1.5 sm:p-2', !inMonth && 'bg-ink-50/50 dark:bg-ink-900/40')}>
                <span className={classNames('inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-mono', isToday ? 'bg-flow-500 text-white' : inMonth ? 'text-ink-600 dark:text-ink-300' : 'text-ink-300 dark:text-ink-700')}>
                  {date.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 2).map((t) => {
                    const project = data.projects.find((p) => p.id === t.project_id)
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setEditingTask(t)
                          setModalOpen(true)
                        }}
                        className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white"
                        style={{ backgroundColor: project?.color ?? '#3454D1' }}
                        title={t.title}
                      >
                        {t.title}
                      </button>
                    )
                  })}
                  {dayTasks.length > 2 && <p className="text-[10px] text-ink-400">+{dayTasks.length - 2} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {data.tasks.every((t) => !t.due_date) && (
        <p className="flex items-center gap-2 text-sm text-ink-400">
          <CalendarIcon className="h-4 w-4" /> No tasks have due dates yet.
        </p>
      )}

      {user && (
        <TaskFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setEditingTask(null)
          }}
          onSubmit={handleUpdate}
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
