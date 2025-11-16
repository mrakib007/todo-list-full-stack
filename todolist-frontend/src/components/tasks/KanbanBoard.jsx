import React, { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useUpdateTaskStatusMutation } from '../../store/api/taskApi'
import DraggableTaskCard from './DraggableTaskCard'
import { Circle, Clock, CheckCircle2, XCircle, Inbox } from 'lucide-react'
import toast from 'react-hot-toast'

// Droppable Column Component
function DroppableColumn({ id, status, children, config, taskCount, isEmpty }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  const Icon = config.icon

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border-2 ${
        isOver ? 'border-primary-400 border-4' : config.color
      } ${isEmpty ? 'min-h-[400px]' : ''}`}
    >
      {/* Column Header */}
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg ${config.headerColor} font-semibold flex-shrink-0`}
      >
        <Icon className="h-5 w-5" />
        <span>{config.label}</span>
        <span className="ml-auto bg-white/50 px-2 py-0.5 rounded-full text-xs">
          {taskCount}
        </span>
      </div>

      {/* Droppable Area */}
      <div className="p-3 space-y-3">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[300px]">
            <div className="relative mb-4">
              <div className={`w-16 h-16 rounded-full ${config.headerColor} flex items-center justify-center opacity-20`}>
                <Icon className="h-8 w-8" />
              </div>
              <Inbox className="absolute -bottom-1 -right-1 h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-sm">No tasks here</p>
            <p className="text-gray-400 text-xs mt-1 text-center">
              Drag tasks here or create new ones
            </p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Circle,
    color: 'bg-yellow-50 border-yellow-200',
    headerColor: 'bg-yellow-100 text-yellow-800',
  },
  in_progress: {
    label: 'In Progress',
    icon: Clock,
    color: 'bg-blue-50 border-blue-200',
    headerColor: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'bg-green-50 border-green-200',
    headerColor: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-red-50 border-red-200',
    headerColor: 'bg-red-100 text-red-800',
  },
}

const statusOrder = ['pending', 'in_progress', 'completed', 'cancelled']

export default function KanbanBoard({ tasks, onEdit }) {
  const [updateStatus] = useUpdateTaskStatusMutation()
  const [activeId, setActiveId] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    }

    tasks?.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    return grouped
  }, [tasks])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = parseInt(active.id)
    let newStatus = over.id

    // If dropped on a task card, get the status from that task
    if (typeof newStatus === 'number' || (typeof newStatus === 'string' && !isNaN(parseInt(newStatus)))) {
      const targetTask = tasks.find((t) => t.id === parseInt(newStatus))
      if (targetTask) {
        newStatus = targetTask.status
      } else {
        return
      }
    }

    // Find the task being dragged
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    // If status hasn't changed, do nothing
    if (task.status === newStatus) return

    // Validate status
    if (!statusOrder.includes(newStatus)) return

    // Update task status
    try {
      await updateStatus({ id: taskId, status: newStatus }).unwrap()
      toast.success('Task status updated')
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to update task status')
    }
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {statusOrder.map((status) => {
          const config = statusConfig[status]
          const columnTasks = tasksByStatus[status] || []

          return (
            <DroppableColumn
              key={status}
              id={status}
              status={status}
              config={config}
              taskCount={columnTasks.length}
              isEmpty={columnTasks.length === 0}
            >
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {columnTasks.map((task) => (
                  <DraggableTaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                  />
                ))}
              </SortableContext>
            </DroppableColumn>
          )
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? (
          <div className="card opacity-90 rotate-3 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTask.title}
                </h3>
                {activeTask.description && (
                  <p className="text-gray-600 text-sm mt-1">
                    {activeTask.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

