import { useCallback, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { ArrowLeft, Plus, Archive, Trash2, UserPlus, LayoutList, Columns3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../lib/useAsync'
import {
  getProject,
  listTasks,
  listMemberships,
  listProfiles,
  listActivity,
  createTask,
  updateTask,
  deleteTask,
  updateProject,
  deleteProject,
  addMember,
} from '../lib/db'
import type { Task } from '../types'
import { STATUS_ORDER, STATUS_LABELS } from '../types'
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates'
import { ProjectStatusChip } from '../components/ui/Chips'
import ProgressBar from '../components/ui/ProgressBar'
import Avatar from '../components/ui/Avatar'
import TaskRow from '../components/tasks/TaskRow'
import TaskFormModal from '../components/tasks/TaskFormModal'
import KanbanBoard from '../components/kanban/KanbanBoard'
import MemberCard from '../components/team/MemberCard'
import MemberProfileModal from '../components/team/MemberProfileModal'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import Modal from '../components/ui/Modal'
import { classNames } from '../lib/utils'
import type { Profile } from '../types'

const TABS = ['Overview', 'Members', 'Tasks', 'Activity', 'Progress'] as const
type Tab = (typeof TABS)[number]

const STATUS_COLORS: Record<string, string> = {
  todo: '#C7C9D4',
  in_progress: '#3454D1',
  review: '#E8A93D',
  completed: '#0EA5A4',
}

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('Overview')
  const [taskView, setTaskView] = useState<'list' | 'board'>('list')
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null)

  const fetcher = useCallback(async () => {
    if (!user || !id) throw new Error('Missing context')
    const project = await getProject(user.id, id)
    if (!project) throw new Error('Project not found')
    const [tasks, memberships, profiles, activity] = await Promise.all([
      listTasks(user.id, { projectId: id }),
      listMemberships(user.id, id),
      listProfiles(user.id),
      listActivity(user.id, id, 30),
    ])
    return { project, tasks, memberships, profiles, activity }
  }, [user, id])

  const { data, status, retry, setData } = useAsync(fetcher, [user?.id, id])

  const statusBreakdown = useMemo(() => {
    if (!data) return []
    return STATUS_ORDER.map((s) => ({
      name: STATUS_LABELS[s],
      value: data.tasks.filter((t) => t.status === s).length,
      key: s,
    })).filter((s) => s.value > 0)
  }, [data])

  if (status === 'loading') return <LoadingState label="Loading project…" />
  if (status === 'error' || !data) return <ErrorState onRetry={retry} message="Couldn't load this project. Please try again." />

  const { project, tasks, memberships, profiles, activity } = data
  const done = tasks.filter((t) => t.status === 'completed').length
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const memberProfiles = memberships.map((m) => ({ m, p: profiles.find((p) => p.id === m.profile_id) })).filter((x) => x.p) as { m: typeof memberships[0]; p: Profile }[]
  const nonMembers = profiles.filter((p) => !memberships.some((m) => m.profile_id === p.id))

  async function handleCreateOrUpdate(input: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    if (!user) return
    if (editingTask) {
      const updated = await updateTask(user.id, editingTask.id, input)
      setData((prev) => (prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === updated.id ? updated : t)) } : prev))
    } else {
      const created = await createTask(user.id, input)
      setData((prev) => (prev ? { ...prev, tasks: [created, ...prev.tasks] } : prev))
    }
  }

  async function handleDeleteTask() {
    if (!user || !editingTask) return
    await deleteTask(user.id, editingTask.id)
    setData((prev) => (prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== editingTask.id) } : prev))
    setTaskModalOpen(false)
    setEditingTask(null)
  }

  async function handleArchive() {
    if (!user) return
    const updated = await updateProject(user.id, project.id, { status: project.status === 'archived' ? 'active' : 'archived' })
    setData((prev) => (prev ? { ...prev, project: updated } : prev))
  }

  async function handleDeleteProject() {
    if (!user) return
    if (!confirm(`Delete "${project.name}"? This can't be undone.`)) return
    await deleteProject(user.id, project.id)
    navigate('/projects')
  }

  async function handleAddMember(profileId: string) {
    if (!user) return
    const membership = await addMember(user.id, project.id, profileId, 'member')
    setData((prev) => (prev ? { ...prev, memberships: [...prev.memberships, membership] } : prev))
    setAddMemberOpen(false)
  }

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-700 dark:hover:text-ink-200">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to projects
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1.5 h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-display font-semibold text-ink-900 dark:text-ink-100">{project.name}</h1>
              <ProjectStatusChip status={project.status} />
            </div>
            <p className="mt-1 max-w-xl text-sm text-ink-500 dark:text-ink-400">{project.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={handleArchive}>
            <Archive className="h-3.5 w-3.5" /> {project.status === 'archived' ? 'Unarchive' : 'Archive'}
          </button>
          <button className="btn-danger" onClick={handleDeleteProject}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      <div className="max-w-md">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-ink-400">{done} of {tasks.length} tasks complete</span>
          <span className="font-mono text-ink-500 dark:text-ink-300">{pct}%</span>
        </div>
        <ProgressBar value={pct} color={project.color} />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-ink-100 dark:border-ink-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={classNames(
              'flex-shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
              tab === t ? 'border-flow-500 text-flow-600 dark:text-flow-400' : 'border-transparent text-ink-400 hover:text-ink-700 dark:hover:text-ink-200'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs font-medium text-ink-400">Total tasks</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink-900 dark:text-ink-100">{tasks.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-ink-400">Team members</p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ink-900 dark:text-ink-100">{memberships.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-medium text-ink-400">Created</p>
            <p className="mt-1 text-sm text-ink-700 dark:text-ink-200">{new Date(project.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      )}

      {tab === 'Members' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button className="btn-secondary" onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="h-4 w-4" /> Add member
            </button>
          </div>
          {memberProfiles.length === 0 ? (
            <EmptyState title="No members yet" description="Add teammates to this project." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {memberProfiles.map(({ m, p }) => (
                <MemberCard
                  key={m.id}
                  profile={p}
                  membership={m}
                  taskCount={tasks.filter((t) => t.assignee_id === p.id).length}
                  onClick={() => {
                    setSelectedMember(p)
                    setMemberModalOpen(true)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-lg bg-ink-100 dark:bg-ink-800 p-1">
              <button onClick={() => setTaskView('list')} className={classNames('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', taskView === 'list' ? 'bg-surface dark:bg-ink-700 shadow-sm text-ink-900 dark:text-ink-100' : 'text-ink-500 dark:text-ink-400')}>
                <LayoutList className="h-3.5 w-3.5" /> List
              </button>
              <button onClick={() => setTaskView('board')} className={classNames('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium', taskView === 'board' ? 'bg-surface dark:bg-ink-700 shadow-sm text-ink-900 dark:text-ink-100' : 'text-ink-500 dark:text-ink-400')}>
                <Columns3 className="h-3.5 w-3.5" /> Board
              </button>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setEditingTask(null)
                setTaskModalOpen(true)
              }}
            >
              <Plus className="h-4 w-4" /> New task
            </button>
          </div>

          {tasks.length === 0 ? (
            <EmptyState title="No tasks yet" description="Break this project down into tasks to start tracking progress." />
          ) : taskView === 'list' ? (
            <div className="card p-5 divide-y divide-ink-100 dark:divide-ink-800">
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  assignee={profiles.find((p) => p.id === task.assignee_id)}
                  onClick={() => {
                    setEditingTask(task)
                    setTaskModalOpen(true)
                  }}
                />
              ))}
            </div>
          ) : (
            user && (
              <KanbanBoard
                userId={user.id}
                tasks={tasks}
                profiles={profiles}
                projects={[project]}
                onTasksChange={(next) => setData((prev) => (prev ? { ...prev, tasks: next } : prev))}
                onCardClick={(task) => {
                  setEditingTask(task)
                  setTaskModalOpen(true)
                }}
              />
            )
          )}
        </div>
      )}

      {tab === 'Activity' && (
        <div className="card p-5">
          <ActivityFeed activity={activity} profiles={profiles} />
        </div>
      )}

      {tab === 'Progress' && (
        <div className="card p-5">
          {tasks.length === 0 ? (
            <EmptyState title="Nothing to show yet" description="Add tasks to see a progress breakdown." />
          ) : (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie data={statusBreakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {statusBreakdown.map((s) => (
                      <Cell key={s.key} fill={STATUS_COLORS[s.key]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5">
                {statusBreakdown.map((s) => (
                  <div key={s.key} className="flex items-center gap-2.5 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.key] }} />
                    <span className="text-ink-600 dark:text-ink-300">{s.name}</span>
                    <span className="font-mono text-ink-400">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {user && (
        <TaskFormModal
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false)
            setEditingTask(null)
          }}
          onSubmit={handleCreateOrUpdate}
          onDelete={editingTask ? handleDeleteTask : undefined}
          initial={editingTask}
          projects={[project]}
          profiles={profiles}
          defaultProjectId={project.id}
          userId={user.id}
        />
      )}

      <MemberProfileModal
        open={memberModalOpen}
        onClose={() => setMemberModalOpen(false)}
        profile={selectedMember}
        tasks={tasks}
        projects={[project]}
      />

      <Modal open={addMemberOpen} onClose={() => setAddMemberOpen(false)} title="Add a member">
        {nonMembers.length === 0 ? (
          <p className="text-sm text-ink-400">Everyone in your workspace is already on this project.</p>
        ) : (
          <div className="space-y-2">
            {nonMembers.map((p) => (
              <button key={p.id} onClick={() => handleAddMember(p.id)} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 hover:bg-ink-100 dark:hover:bg-ink-800">
                <Avatar name={p.full_name} color={p.avatar_color} size="sm" />
                <span className="text-sm text-ink-700 dark:text-ink-200">{p.full_name}</span>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
