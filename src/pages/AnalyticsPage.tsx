import { useCallback, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../lib/useAsync'
import { listTasks, listProjects } from '../lib/db'
import { LoadingState, ErrorState } from '../components/ui/DataStates'
import { Clock, AlertTriangle, TrendingUp } from 'lucide-react'

const PROJECT_STATUS_COLORS: Record<string, string> = { active: '#3454D1', completed: '#0EA5A4', archived: '#C7C9D4' }

function weekLabel(offset: number) {
  const d = new Date()
  d.setDate(d.getDate() - offset * 7)
  return `Wk of ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
}

export default function AnalyticsPage() {
  const { user } = useAuth()

  const fetcher = useCallback(async () => {
    if (!user) throw new Error('Not signed in')
    const [tasks, projects] = await Promise.all([listTasks(user.id), listProjects(user.id, 'all')])
    return { tasks, projects }
  }, [user])

  const { data, status, retry } = useAsync(fetcher, [user?.id])

  const weeklyCompletion = useMemo(() => {
    if (!data) return []
    const weeks = Array.from({ length: 8 }, (_, i) => 7 - i)
    return weeks.map((weeksAgo) => {
      const start = new Date()
      start.setDate(start.getDate() - weeksAgo * 7)
      const end = new Date(start)
      end.setDate(end.getDate() + 7)
      const completed = data.tasks.filter((t) => {
        if (t.status !== 'completed') return false
        const d = new Date(t.updated_at)
        return d >= start && d < end
      }).length
      const created = data.tasks.filter((t) => {
        const d = new Date(t.created_at)
        return d >= start && d < end
      }).length
      return { week: weekLabel(weeksAgo), completed, created }
    })
  }, [data])

  const projectStatusDist = useMemo(() => {
    if (!data) return []
    const counts: Record<string, number> = { active: 0, completed: 0, archived: 0 }
    data.projects.forEach((p) => (counts[p.status] += 1))
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([status, value]) => ({ status, value, name: status.charAt(0).toUpperCase() + status.slice(1) }))
  }, [data])

  const overdueTasks = useMemo(() => {
    if (!data) return []
    return data.tasks.filter((t) => t.due_date && t.status !== 'completed' && new Date(t.due_date) < new Date())
  }, [data])

  const avgCompletionDays = useMemo(() => {
    if (!data) return 0
    const completed = data.tasks.filter((t) => t.status === 'completed')
    if (completed.length === 0) return 0
    const totalDays = completed.reduce((sum, t) => {
      const created = new Date(t.created_at).getTime()
      const done = new Date(t.updated_at).getTime()
      return sum + Math.max(0, (done - created) / 86400000)
    }, 0)
    return Math.round((totalDays / completed.length) * 10) / 10
  }, [data])

  if (status === 'loading') return <LoadingState label="Crunching your analytics…" />
  if (status === 'error' || !data) return <ErrorState onRetry={retry} />

  const completionRate = data.tasks.length ? Math.round((data.tasks.filter((t) => t.status === 'completed').length / data.tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">Analytics</h1>
        <p className="mt-1 text-sm text-ink-400">Productivity across your whole workspace</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs font-medium text-ink-400">Completion rate</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink-900 dark:text-ink-100">{completionRate}%</p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400"><Clock className="h-3.5 w-3.5" /> Avg. completion time</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink-900 dark:text-ink-100">{avgCompletionDays}d</p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400"><AlertTriangle className="h-3.5 w-3.5" /> Overdue tasks</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-coral">{overdueTasks.length}</p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink-400"><TrendingUp className="h-3.5 w-3.5" /> Total tasks</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ink-900 dark:text-ink-100">{data.tasks.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Weekly task completion</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E8ED" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#0EA5A4" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Project status distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={projectStatusDist} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                {projectStatusDist.map((s) => (
                  <Cell key={s.status} fill={PROJECT_STATUS_COLORS[s.status]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Productivity trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E8ED" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} interval={1} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3454D1" strokeWidth={2} name="Created" dot={false} />
              <Line type="monotone" dataKey="completed" stroke="#0EA5A4" strokeWidth={2} name="Completed" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
