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
    due_date_date: '',
    due_date_time: '',
    due_date_ampm: 'AM',
  })

  const parseDateTime = (dateValue) => {
    if (!dateValue) return { date: '', time: '', ampm: 'AM' }
    
    let year, month, day, hours, minutes
    
    if (typeof dateValue === 'string') {
      const cleanDate = dateValue.replace(/[Z+-]\d{2}:?\d{2}$/, '').replace(/\.\d{3}$/, '')
      const match = cleanDate.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(:(\d{2}))?/)
      if (match) {
        year = parseInt(match[1], 10)
        month = parseInt(match[2], 10)
        day = parseInt(match[3], 10)
        hours = parseInt(match[4], 10)
        minutes = parseInt(match[5], 10)
      } else {
        const date = new Date(dateValue)
        if (isNaN(date.getTime())) return { date: '', time: '', ampm: 'AM' }
        year = date.getUTCFullYear()
        month = date.getUTCMonth() + 1
        day = date.getUTCDate()
        hours = date.getUTCHours()
        minutes = date.getUTCMinutes()
      }
    } else if (dateValue instanceof Date) {
      if (isNaN(dateValue.getTime())) return { date: '', time: '', ampm: 'AM' }
      year = dateValue.getUTCFullYear()
      month = dateValue.getUTCMonth() + 1
      day = dateValue.getUTCDate()
      hours = dateValue.getUTCHours()
      minutes = dateValue.getUTCMinutes()
    } else {
      // Fallback
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) return { date: '', time: '', ampm: 'AM' }
      year = date.getUTCFullYear()
      month = date.getUTCMonth() + 1
      day = date.getUTCDate()
      hours = date.getUTCHours()
      minutes = date.getUTCMinutes()
    }
    
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12 // Convert to 12-hour format
    const timeStr = `${hours12}:${String(minutes).padStart(2, '0')}`
    
    return { date: dateStr, time: timeStr, ampm }
  }

  const combineDateTime = (date, time, ampm) => {
    if (!date || !time) return ''
    
    const timeMatch = time.match(/^(\d{1,2}):(\d{2})$/)
    if (!timeMatch) return ''
    
    let hours24 = parseInt(timeMatch[1], 10)
    const minutes = timeMatch[2]
    
    if (hours24 < 1 || hours24 > 12) return ''
    
    if (ampm === 'PM' && hours24 !== 12) {
      hours24 += 12
    } else if (ampm === 'AM' && hours24 === 12) {
      hours24 = 0
    }
    
    const hours24Str = String(hours24).padStart(2, '0')
    return `${date}T${hours24Str}:${minutes}`
  }

  useEffect(() => {
    if (task) {
      // Check if task has an id - if not, it's a new task with pre-filled data
      const isNewTask = !task.id
      const dateTimeParts = parseDateTime(task.due_date)
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        due_date: task.due_date ? combineDateTime(dateTimeParts.date, dateTimeParts.time, dateTimeParts.ampm) : '',
        due_date_date: dateTimeParts.date,
        due_date_time: dateTimeParts.time,
        due_date_ampm: dateTimeParts.ampm,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        due_date_date: '',
        due_date_time: '',
        due_date_ampm: 'AM',
      })
    }
  }, [task])

  const handleChange = (e) => {
    const { name, value } = e.target
    const newFormData = {
      ...formData,
      [name]: value,
    }
    
    if (name === 'due_date_date' || name === 'due_date_time' || name === 'due_date_ampm') {
      const date = name === 'due_date_date' ? value : newFormData.due_date_date
      const time = name === 'due_date_time' ? value : newFormData.due_date_time
      const ampm = name === 'due_date_ampm' ? value : newFormData.due_date_ampm
      newFormData.due_date = combineDateTime(date, time, ampm)
    }
    
    setFormData(newFormData)
  }

  const convertToISO = (dateTimeLocal) => {
    if (!dateTimeLocal) return null
    
    const match = dateTimeLocal.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/)
    if (!match) return null
    
    const [, year, month, day, hours, minutes] = match
    
    return `${year}-${month}-${day}T${hours}:${minutes}:00`
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
        due_date: convertToISO(formData.due_date),
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto overflow-x-hidden" onClick={(e) => e.stopPropagation()}>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label htmlFor="due_date_date" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 min-w-0">
                  <input
                    id="due_date_date"
                    name="due_date_date"
                    type="date"
                    className="input-field w-full"
                    value={formData.due_date_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                    <input
                      id="due_date_time"
                      name="due_date_time"
                      type="text"
                      className="input-field w-20 flex-shrink-0"
                      placeholder="12:00"
                      pattern="[0-9]{1,2}:[0-5][0-9]"
                      value={formData.due_date_time}
                      onChange={handleChange}
                      onBlur={(e) => {
                        // Format time input (e.g., "9:5" -> "9:05", "12:30" -> "12:30")
                        const time = e.target.value
                        if (time && /^\d{1,2}:\d{1,2}$/.test(time)) {
                          const [hours, minutes] = time.split(':')
                          const formattedTime = `${hours}:${minutes.padStart(2, '0')}`
                          if (formattedTime !== time) {
                            // Update with formatted time and recalculate due_date
                            const updatedFormData = {
                              ...formData,
                              due_date_time: formattedTime,
                            }
                            updatedFormData.due_date = combineDateTime(
                              updatedFormData.due_date_date,
                              updatedFormData.due_date_time,
                              updatedFormData.due_date_ampm
                            )
                            setFormData(updatedFormData)
                          }
                        }
                      }}
                    />
                  <select
                    id="due_date_ampm"
                    name="due_date_ampm"
                    className="input-field w-16 flex-shrink-0"
                    value={formData.due_date_ampm}
                    onChange={handleChange}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">Format: HH:MM (e.g., 2:30 PM, 11:45 AM)</p>
              {(formData.due_date_date || formData.due_date_time) && (
                <button
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    due_date: '',
                    due_date_date: '',
                    due_date_time: '',
                    due_date_ampm: 'AM'
                  })}
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

