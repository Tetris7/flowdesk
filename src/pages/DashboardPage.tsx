import { useCallback } from 'react'
import { FolderKanban, ListChecks, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../lib/useAsync'
import { getDashboardStats, listTasks, listProjects, listProfiles, listActivity } from '../lib/db'
import { LoadingState, ErrorState } from '../components/ui/DataStates'
import KpiCard from '../components/dashboard/KpiCard'
import RecentTasks from '../components/dashboard/RecentTasks'
import ProjectProgressList from '../components/dashboard/ProjectProgressList'
import ActivityFeed from '../components/dashboard/ActivityFeed'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { user } = useAuth()

  const fetcher = useCallback(async () => {
    if (!user) throw new Error('Not signed in')
    const [stats, tasks, allProjects, profiles, activity] = await Promise.all([
      getDashboardStats(user.id),
      listTasks(user.id),
      listProjects(user.id, 'all'),
      listProfiles(user.id),
      listActivity(user.id, undefined, 8),
    ])
    return { stats, tasks, allProjects, profiles, activity }
  }, [user])

  const { data, status, retry } = useAsync(fetcher, [user?.id])

  if (status === 'loading') return <LoadingState label="Loading your dashboard…" />
  if (status === 'error' || !data) return <ErrorState onRetry={retry} />

  const firstName = user?.full_name.split(' ')[0] ?? 'there'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-400">Here's what's happening across your work today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Total Projects" value={data.stats.totalProjects} icon={FolderKanban} accent="#3454D1" />
        <KpiCard label="Active Tasks" value={data.stats.activeTasks} icon={ListChecks} accent="#0EA5A4" />
        <KpiCard label="Completed Tasks" value={data.stats.completedTasks} icon={CheckCircle2} accent="#6B9E78" />
        <KpiCard label="Overdue Tasks" value={data.stats.overdueTasks} icon={AlertTriangle} accent="#E1493A" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100">Recent tasks</h2>
          </div>
          <RecentTasks tasks={data.tasks.slice(0, 6)} projects={data.allProjects} profiles={data.profiles} />
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Project progress</h2>
          <ProjectProgressList projects={data.stats.activeProjects} tasks={data.tasks} />
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-display font-semibold text-ink-900 dark:text-ink-100">Recent activity</h2>
        <ActivityFeed activity={data.activity} profiles={data.profiles} />
      </div>
    </div>
  )
}
