import { useState } from 'react'
import { useGetTasksQuery, useSearchTasksQuery } from '../store/api/taskApi'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskStats from '../components/tasks/TaskStats'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: tasksData, isLoading: tasksLoading } = useGetTasksQuery(filters, {
    skip: !!searchQuery,
  })
  const { data: searchData, isLoading: searchLoading } = useSearchTasksQuery(searchQuery, {
    skip: !searchQuery,
  })

  const tasks = searchQuery ? searchData?.data : tasksData?.data
  const isLoading = searchQuery ? searchLoading : tasksLoading

  const handleEdit = (task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setSearchQuery('')
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (query) {
      setFilters({})
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="mt-2 text-gray-600">Manage and track your tasks</p>
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Task
          </button>
        </div>

        <TaskStats />

        <TaskFilters
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">No tasks found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchQuery ? 'Try a different search term' : 'Create your first task to get started'}
            </p>
          </div>
        )}

        {showTaskForm && (
          <TaskForm task={editingTask} onClose={handleCloseForm} />
        )}
      </div>
    </div>
  )
}

