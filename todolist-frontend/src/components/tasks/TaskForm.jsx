import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useCreateTaskMutation, useUpdateTaskMutation } from '../../store/api/taskApi'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TaskForm({ task, onClose }) {
  console.log('TaskForm rendered with task:', task)
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    due_date: '',
  })

  useEffect(() => {
    if (task) {
      // Check if task has an id - if not, it's a new task with pre-filled data
      const isNewTask = !task.id
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
      })
    }
  }, [task])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }

    try {
      const submitData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      }
      
      if (task && task.id) {
        // Existing task - update it
        submitData.status = formData.status
        await updateTask({ id: task.id, ...submitData }).unwrap()
        toast.success('Task updated successfully')
      } else {
        // New task - create it
        await createTask(submitData).unwrap()
        toast.success('Task created successfully')
      }
      onClose()
    } catch (error) {
      toast.error(error?.data?.error || 'Failed to save task')
    }
  }

  const formContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {task && task.id ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="input-field"
              placeholder="Enter task title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              className="input-field"
              placeholder="Enter task description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                className="input-field"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                id="due_date"
                name="due_date"
                type="datetime-local"
                className="input-field"
                value={formData.due_date}
                onChange={handleChange}
              />
              {formData.due_date && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, due_date: '' })}
                  className="mt-1 text-xs text-red-600 hover:text-red-800 block"
                >
                  Clear due date
                </button>
              )}
            </div>
          </div>

          {task && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                className="input-field"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(formContent, document.body)
}

