export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'
export type ProjectStatus = 'active' | 'completed' | 'archived'
export type MemberRole = 'owner' | 'admin' | 'member'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_color: string
  created_at: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  owner_id: string
  color: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TeamMembership {
  id: string
  project_id: string
  profile_id: string
  role: MemberRole
  active: boolean
  created_at: string
}

export interface Comment {
  id: string
  task_id: string
  author_id: string
  body: string
  created_at: string
}

export type NotificationType = 'assigned' | 'status_change' | 'comment' | 'due_soon'

export interface Notification {
  id: string
  profile_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
  link?: string
}

export type ActivityAction =
  | 'project_created'
  | 'project_archived'
  | 'task_created'
  | 'task_status_changed'
  | 'task_assigned'
  | 'task_completed'
  | 'member_added'
  | 'comment_added'

export interface ActivityLog {
  id: string
  project_id: string
  actor_id: string
  action: ActivityAction
  detail: string
  created_at: string
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  completed: 'Completed',
}

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'completed']

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}
