import { supabase } from './supabaseClient'
import type {
  Project,
  Task,
  TeamMembership,
  Comment,
  Notification,
  ActivityLog,
  Profile,
  TaskStatus,
  ProjectStatus,
} from '../types'

/**
 * Real Supabase data layer. Every function keeps the same name and shape
 * it had as a localStorage mock, so no component above this file needed to
 * change when this was swapped in. Row-level security (see
 * supabase-schema.sql) is what actually keeps one user's data invisible to
 * another — the `userId` params here are mostly for logging/ownership, not
 * access control.
 */

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  if (res.data === null) throw new Error('No data returned')
  return res.data
}

async function logActivity(projectId: string, actorId: string, action: ActivityLog['action'], detail: string) {
  await supabase.from('activity_logs').insert({ project_id: projectId, actor_id: actorId, action, detail })
}

// ---------- Profiles / Team ----------

export async function listProfiles(_userId: string): Promise<Profile[]> {
  const res = await supabase.from('profiles').select('*').order('full_name')
  return unwrap(res)
}

export async function listMemberships(_userId: string, projectId?: string): Promise<TeamMembership[]> {
  let query = supabase.from('team_memberships').select('*')
  if (projectId) query = query.eq('project_id', projectId)
  return unwrap(await query)
}

export async function addMember(userId: string, projectId: string, profileId: string, role: TeamMembership['role']) {
  const membership = unwrap(
    await supabase
      .from('team_memberships')
      .insert({ project_id: projectId, profile_id: profileId, role, active: true })
      .select()
      .single()
  )
  await logActivity(projectId, userId, 'member_added', 'added a new member to the project')
  return membership
}

// ---------- Projects ----------

export async function listProjects(_userId: string, status?: ProjectStatus | 'all'): Promise<Project[]> {
  let query = supabase.from('projects').select('*').order('updated_at', { ascending: false })
  if (status && status !== 'all') query = query.eq('status', status)
  return unwrap(await query)
}

export async function getProject(_userId: string, projectId: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single()
  if (error) return null
  return data
}

export async function createProject(
  userId: string,
  input: { name: string; description: string; color: string }
): Promise<Project> {
  const project = unwrap(
    await supabase
      .from('projects')
      .insert({ name: input.name, description: input.description, color: input.color, owner_id: userId, status: 'active' })
      .select()
      .single()
  )
  await supabase.from('team_memberships').insert({ project_id: project.id, profile_id: userId, role: 'owner', active: true })
  await logActivity(project.id, userId, 'project_created', `created the project "${project.name}"`)
  return project
}

export async function updateProject(userId: string, projectId: string, patch: Partial<Project>): Promise<Project> {
  const updated = unwrap(
    await supabase
      .from('projects')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', projectId)
      .select()
      .single()
  )
  if (patch.status === 'archived') {
    await logActivity(projectId, userId, 'project_archived', `archived "${updated.name}"`)
  }
  return updated
}

export async function deleteProject(_userId: string, projectId: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', projectId)
  if (error) throw new Error(error.message)
}

// ---------- Tasks ----------

export async function listTasks(_userId: string, filters?: { projectId?: string; status?: TaskStatus }): Promise<Task[]> {
  let query = supabase.from('tasks').select('*').order('created_at', { ascending: false })
  if (filters?.projectId) query = query.eq('project_id', filters.projectId)
  if (filters?.status) query = query.eq('status', filters.status)
  return unwrap(await query)
}

export async function createTask(
  userId: string,
  input: Omit<Task, 'id' | 'created_at' | 'updated_at'>
): Promise<Task> {
  const task = unwrap(await supabase.from('tasks').insert(input).select().single())
  const { data: project } = await supabase.from('projects').select('name').eq('id', task.project_id).single()
  await logActivity(task.project_id, userId, 'task_created', `created task "${task.title}"${project ? ` in ${project.name}` : ''}`)
  if (task.assignee_id && task.assignee_id !== userId) {
    await supabase.from('notifications').insert({
      profile_id: task.assignee_id,
      type: 'assigned',
      message: `You were assigned "${task.title}"`,
      read: false,
      link: `/projects/${task.project_id}`,
    })
  }
  return task
}

export async function updateTask(userId: string, taskId: string, patch: Partial<Task>): Promise<Task> {
  const { data: before } = await supabase.from('tasks').select('*').eq('id', taskId).single()
  const updated = unwrap(
    await supabase
      .from('tasks')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .select()
      .single()
  )
  if (patch.status && before && patch.status !== before.status) {
    const action = patch.status === 'completed' ? 'task_completed' : 'task_status_changed'
    await logActivity(updated.project_id, userId, action, `moved "${updated.title}" to ${patch.status.replace('_', ' ')}`)
  }
  return updated
}

export async function deleteTask(_userId: string, taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error(error.message)
}

// ---------- Comments ----------

export async function listComments(_userId: string, taskId: string): Promise<Comment[]> {
  const res = await supabase.from('comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true })
  return unwrap(res)
}

export async function addComment(userId: string, taskId: string, body: string): Promise<Comment> {
  const comment = unwrap(
    await supabase.from('comments').insert({ task_id: taskId, author_id: userId, body }).select().single()
  )
  const { data: task } = await supabase.from('tasks').select('title, project_id').eq('id', taskId).single()
  if (task) await logActivity(task.project_id, userId, 'comment_added', `commented on "${task.title}"`)
  return comment
}

// ---------- Notifications ----------

export async function listNotifications(userId: string): Promise<Notification[]> {
  const res = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
  return unwrap(res)
}

export async function markNotificationRead(_userId: string, notifId: string): Promise<void> {
  await supabase.from('notifications').update({ read: true }).eq('id', notifId)
}

// ---------- Activity ----------

export async function listActivity(_userId: string, projectId?: string, limit = 20): Promise<ActivityLog[]> {
  let query = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit)
  if (projectId) query = query.eq('project_id', projectId)
  return unwrap(await query)
}

// ---------- Dashboard aggregate ----------

export async function getDashboardStats(userId: string) {
  const [projects, tasks] = await Promise.all([listProjects(userId, 'all'), listTasks(userId)])
  const activeProjects = projects.filter((p) => p.status === 'active')
  const activeTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const overdueTasks = tasks.filter((t) => t.due_date && t.status !== 'completed' && new Date(t.due_date) < new Date())
  return {
    totalProjects: projects.length,
    activeTasks: activeTasks.length,
    completedTasks: completedTasks.length,
    overdueTasks: overdueTasks.length,
    activeProjects,
  }
}

// ---------- First-login starter content ----------

/**
 * Gives a brand-new account one real project with a few tasks, so the
 * dashboard and Kanban board aren't empty on first login. Safe to call on
 * every sign-in — it only acts if the user owns zero projects.
 */
export async function ensureWorkspace(userId: string, _fullName: string, _email: string): Promise<void> {
  const { data: existing } = await supabase.from('projects').select('id').eq('owner_id', userId).limit(1)
  if (existing && existing.length > 0) return

  const project = await createProject(userId, {
    name: 'Welcome to FlowDesk',
    description: 'A starter project so you can see how everything fits together. Feel free to edit or delete it.',
    color: '#3454D1',
  })

  const starterTasks: Array<Pick<Task, 'title' | 'status' | 'priority'>> = [
    { title: 'Explore the Kanban board', status: 'todo', priority: 'medium' },
    { title: 'Invite a teammate', status: 'todo', priority: 'low' },
    { title: 'Create your first real project', status: 'in_progress', priority: 'high' },
  ]

  for (const t of starterTasks) {
    await createTask(userId, {
      project_id: project.id,
      title: t.title,
      description: '',
      status: t.status,
      priority: t.priority,
      assignee_id: userId,
      due_date: null,
    })
  }
}
