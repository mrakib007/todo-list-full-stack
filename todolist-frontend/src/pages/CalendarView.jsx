import { useState, useMemo } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { useGetTasksQuery } from '../store/api/taskApi'
import TaskForm from '../components/tasks/TaskForm'
import TaskCard from '../components/tasks/TaskCard'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import './CalendarView.css'

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' or 'week'
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  // Fetch all tasks
  const { data: tasksData, isLoading } = useGetTasksQuery({})
  const tasks = tasksData?.data || []

  // Group tasks by due date
  const tasksByDate = useMemo(() => {
    const grouped = {}
    tasks.forEach((task) => {
      if (task.due_date) {
        const dateKey = new Date(task.due_date).toDateString()
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(task)
      }
    })
    return grouped
  }, [tasks])

  // Get tasks for selected date
  const getTasksForDate = (date) => {
    const dateKey = date.toDateString()
    return tasksByDate[dateKey] || []
  }

  // Handle date click
  const handleDateClick = (date) => {
    setSelectedDate(date)
  }

  // Handle task edit
  const handleEdit = (task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  // Handle create new task
  const handleCreateTask = (date) => {
    // Create a task object with the due date pre-filled
    const dateStr = date.toISOString().slice(0, 16)
    setEditingTask({ due_date: dateStr })
    setShowTaskForm(true)
  }

  // Handle close form
  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  // Custom tile content to show task count
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = date.toDateString()
      const dayTasks = tasksByDate[dateKey] || []
      if (dayTasks.length > 0) {
        return (
          <div className="flex flex-wrap gap-0.5 justify-center mt-1">
            {dayTasks.slice(0, 3).map((task, idx) => (
              <div
                key={task.id}
                className={`w-1.5 h-1.5 rounded-full ${
                  task.status === 'completed'
                    ? 'bg-green-500'
                    : task.status === 'cancelled'
                    ? 'bg-gray-400'
                    : task.priority === 'urgent'
                    ? 'bg-red-500'
                    : task.priority === 'high'
                    ? 'bg-orange-500'
                    : task.priority === 'medium'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
                title={task.title}
              />
            ))}
            {dayTasks.length > 3 && (
              <div className="text-xs text-gray-500 font-semibold">+{dayTasks.length - 3}</div>
            )}
          </div>
        )
      }
    }
    return null
  }

  // Custom tile className for styling
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateKey = date.toDateString()
      const today = new Date().toDateString()
      const selected = selectedDate.toDateString()
      const hasTasks = tasksByDate[dateKey]?.length > 0
      const isOverdue = tasksByDate[dateKey]?.some(
        (task) =>
          task.due_date &&
          new Date(task.due_date) < new Date() &&
          task.status !== 'completed' &&
          task.status !== 'cancelled'
      )

      let classes = []
      if (dateKey === today) classes.push('today')
      if (dateKey === selected) classes.push('selected-date')
      if (hasTasks) classes.push('has-tasks')
      if (isOverdue) classes.push('has-overdue')

      return classes.join(' ')
    }
    return null
  }

  const selectedDateTasksList = getTasksForDate(selectedDate)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <CalendarIcon className="h-8 w-8 text-primary-600" />
              Calendar View
            </h1>
            <p className="mt-2 text-gray-600">View and manage your tasks by date</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('month')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'month'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Month View"
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'week'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Week View"
              >
                Week
              </button>
            </div>
            <button
              onClick={() => handleCreateTask(selectedDate)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Task
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="card p-4">
              <Calendar
                onChange={handleDateClick}
                value={selectedDate}
                view={viewMode}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="custom-calendar"
                onClickDay={handleDateClick}
                prevLabel={<ChevronLeft className="h-5 w-5" />}
                nextLabel={<ChevronRight className="h-5 w-5" />}
                prev2Label={null}
                next2Label={null}
              />

              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Urgent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Date Tasks */}
          <div className="lg:col-span-1">
            <div className="card flex flex-col h-full max-h-[calc(100vh-200px)]">
              <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900 break-words">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h2>
                <button
                  onClick={() => handleCreateTask(selectedDate)}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Add task for this date
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading tasks...</p>
                  </div>
                ) : selectedDateTasksList.length > 0 ? (
                  selectedDateTasksList.map((task) => (
                    <div key={task.id} onClick={() => handleEdit(task)} className="cursor-pointer">
                      <TaskCard task={task} onEdit={handleEdit} />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No tasks for this date</p>
                    <p className="text-gray-400 text-sm mt-1">Click "Add task" to create one</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Task Form Modal */}
        {showTaskForm && (
          <TaskForm task={editingTask} onClose={handleCloseForm} />
        )}
      </div>
    </div>
  )
}

