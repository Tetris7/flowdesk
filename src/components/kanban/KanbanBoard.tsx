import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import type { Task, Profile, Project, TaskStatus } from '../../types'
import { STATUS_ORDER } from '../../types'
import KanbanColumn from './KanbanColumn'
import { updateTask } from '../../lib/db'

export default function KanbanBoard({
  userId,
  tasks,
  profiles,
  projects,
  onTasksChange,
  onCardClick,
}: {
  userId: string
  tasks: Task[]
  profiles: Profile[]
  projects: Project[]
  onTasksChange: (tasks: Task[]) => void
  onCardClick: (task: Task) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    let targetStatus: TaskStatus | undefined
    if (STATUS_ORDER.includes(over.id as TaskStatus)) {
      targetStatus = over.id as TaskStatus
    } else {
      targetStatus = tasks.find((t) => t.id === over.id)?.status
    }

    if (!targetStatus || targetStatus === activeTask.status) return

    const next = tasks.map((t) => (t.id === activeTask.id ? { ...t, status: targetStatus! } : t))
    onTasksChange(next)
    updateTask(userId, activeTask.id, { status: targetStatus }).catch(() => {
      onTasksChange(tasks)
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-2">
        {STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            profiles={profiles}
            projects={projects}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  )
}
