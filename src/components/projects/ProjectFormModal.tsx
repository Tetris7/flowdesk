import { useState } from 'react'
import Modal from '../ui/Modal'
import type { Project } from '../../types'

const COLOR_OPTIONS = ['#3454D1', '#0EA5A4', '#E8A93D', '#E1493A', '#6B9E78', '#8B5CF6']

export default function ProjectFormModal({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (input: { name: string; description: string; color: string }) => Promise<void>
  initial?: Project | null
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState(initial?.color ?? COLOR_OPTIONS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), color })
      setName('')
      setDescription('')
      onClose()
      } catch (err) {
          setError(err instanceof Error ? err.message : 'Could not save the project. Please try again.')
      } finally {

      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit project' : 'New project'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label" htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website Relaunch"
            required
          />
        </div>
        <div>
          <label className="field-label" htmlFor="project-desc">Description</label>
          <textarea
            id="project-desc"
            className="field-input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </div>
        <div>
          <p className="field-label">Color</p>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-full ring-offset-2 ring-offset-surface dark:ring-offset-ink-900 transition-shadow"
                style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : 'none' }}
                aria-label={`Choose color ${c}`}
              />
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-coral">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting || !name.trim()}>
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
