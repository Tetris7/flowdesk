import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import type { Task, Project, Profile, TaskStatus, TaskPriority, Comment } from '../../types'
import { STATUS_ORDER, STATUS_LABELS } from '../../types'
import { listComments, addComment } from '../../lib/db'
import { formatRelativeTime } from '../../lib/utils'
import { Trash2, Send } from 'lucide-react'

interface TaskFormInput {
  title: string
  description: string
  project_id: string
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  due_date: string | null
}

export default function TaskFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  initial,
  projects,
  profiles,
  defaultProjectId,
  userId,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: TaskFormInput) => Promise<void>
  onDelete?: () => Promise<void>
  initial?: Task | null
  projects: Project[]
  profiles: Profile[]
  defaultProjectId?: string
  userId: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setDescription(initial?.description ?? '')
    setProjectId(initial?.project_id ?? defaultProjectId ?? projects[0]?.id ?? '')
    setStatus(initial?.status ?? 'todo')
    setPriority(initial?.priority ?? 'medium')
    setAssigneeId(initial?.assignee_id ?? '')
    setDueDate(initial?.due_date?.slice(0, 10) ?? '')
    setError(null)
    if (initial) listComments(userId, initial.id).then(setComments)
    else setComments([])
  }, [open, initial, defaultProjectId, projects, userId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !projectId) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        project_id: projectId,
        status,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      })
      onClose()
    } catch {
      setError('Could not save the task. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || !initial) return
    const comment = await addComment(userId, initial.id, newComment.trim())
    setComments((prev) => [...prev, comment])
    setNewComment('')
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Task details' : 'New task'} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="task-title">Title</label>
          <input id="task-title" className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Build responsive navbar" required />
        </div>

        <div>
          <label className="field-label" htmlFor="task-desc">Description</label>
          <textarea id="task-desc" className="field-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed task description" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="task-project">Project</label>
            <select id="task-project" className="field-input" value={projectId} onChange={(e) => setProjectId(e.target.value)} required>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="task-status">Status</label>
            <select id="task-status" className="field-input" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="task-priority">Priority</label>
            <select id="task-priority" className="field-input" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="task-due">Due date</label>
            <input id="task-due" type="date" className="field-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" className="field-input" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
            <option value="">Unassigned</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-coral">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          {initial && onDelete ? (
            <button type="button" onClick={onDelete} className="btn-danger">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting || !title.trim()}>
              {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </div>
      </form>

      {initial && (
        <div className="mt-6 border-t border-ink-100 dark:border-ink-800 pt-5">
          <p className="mb-3 text-sm font-semibold text-ink-700 dark:text-ink-200">Comments</p>
          <div className="mb-3 max-h-48 space-y-3 overflow-y-auto scrollbar-thin">
            {comments.length === 0 && <p className="text-sm text-ink-400">No comments yet.</p>}
            {comments.map((c) => {
              const author = profiles.find((p) => p.id === c.author_id)
              return (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={author?.full_name ?? 'Unknown'} color={author?.avatar_color ?? '#9EA1B3'} size="sm" />
                  <div className="min-w-0 flex-1 rounded-lg bg-ink-50 dark:bg-ink-800 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">{author?.full_name ?? 'Unknown'}</p>
                      <p className="text-[10px] text-ink-400">{formatRelativeTime(c.created_at)}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-600 dark:text-ink-300">{c.body}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input
              className="field-input flex-1"
              placeholder="Write a comment…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment())}
            />
            <button type="button" className="btn-secondary !px-3" onClick={handleAddComment} aria-label="Send comment">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
