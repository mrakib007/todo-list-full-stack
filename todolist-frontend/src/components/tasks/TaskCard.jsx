import { useState } from 'react'
import { useUpdateTaskStatusMutation, useDeleteTaskMutation } from '../../store/api/taskApi'
import { CheckCircle2, Circle, Trash2, Edit, Clock, AlertCircle, XCircle, Calendar, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

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

export default function TaskCard({ task, onEdit }) {
  const [updateStatus] = useUpdateTaskStatusMutation()
  const [deleteTask] = useDeleteTaskMutation()
  const [isDeleting, setIsDeleting] = useState(false)

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
    <div className={`card hover:shadow-lg transition-shadow relative ${isOverdue ? 'border-l-4 border-red-500' : ''} overflow-hidden`}>
      {/* Drag indicator icon - top right (visual only, not functional in grid view) */}
      <div 
        className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-gray-400 transition-colors z-10"
        title="Tasks can be reordered in Kanban view"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div className="flex items-start justify-between gap-2 pr-10 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <StatusIcon className={`h-5 w-5 flex-shrink-0 ${statusColors[task.status]?.split(' ')[0]}`} />
            <h3 className="text-lg font-semibold text-gray-900 break-words">{task.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1 flex-shrink-0">
                <AlertCircle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-gray-600 text-sm mb-3 break-words">{task.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
            {task.due_date && (
              <span className={`flex items-center gap-1 flex-shrink-0 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="break-words">Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            )}
            <span className="flex-shrink-0">Created: {new Date(task.created_at).toLocaleDateString()}</span>
            {task.updated_at !== task.created_at && (
              <span className="flex-shrink-0">Updated: {new Date(task.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className={`text-xs font-medium px-2 py-1 rounded ${statusColors[task.status]}`}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onEdit && typeof onEdit === 'function') {
                onEdit(task)
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors cursor-pointer"
            title="Edit task"
            aria-label="Edit task"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleDelete()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={isDeleting}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

