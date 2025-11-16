import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUpdateTaskStatusMutation, useDeleteTaskMutation } from '../../store/api/taskApi'
import { CheckCircle2, Circle, Trash2, Edit, Clock, XCircle, Calendar, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'

const statusIcons = {
  completed: CheckCircle2,
  pending: Circle,
  in_progress: Clock,
  cancelled: XCircle,
}

const statusColors = {
  completed: 'text-green-600 bg-green-100',
  pending: 'text-yellow-600 bg-yellow-100',
  in_progress: 'text-blue-600 bg-blue-100',
  cancelled: 'text-red-600 bg-red-100',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export default function DraggableTaskCard({ task, onEdit }) {
  const [updateStatus] = useUpdateTaskStatusMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const StatusIcon = statusIcons[task.status] || Circle

  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    !['completed', 'cancelled'].includes(task.status)

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus({ id: task.id, status: newStatus }).unwrap()
      toast.success('Task status updated')
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to update status')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return

    setIsDeleting(true)
    try {
      await deleteTask(task.id).unwrap()
      toast.success('Task deleted')
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to delete task')
      setIsDeleting(false)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card hover:shadow-lg transition-shadow cursor-grab active:cursor-grabbing ${isOverdue ? 'border-l-4 border-red-500' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusIcon className={`h-4 w-4 ${statusColors[task.status]?.split(' ')[0]}`} />
            <h3 className="text-base font-semibold text-gray-900">{task.title}</h3>
            {isOverdue && (
              <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.due_date && (
              <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                <Calendar className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {new Date(task.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
        <select
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={`text-xs font-medium px-2 py-1 rounded flex-1 ${statusColors[task.status]}`}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(task)
          }}
          onMouseDown={(e) => e.stopPropagation()}
          className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded"
        >
          <Edit className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={isDeleting}
          className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

