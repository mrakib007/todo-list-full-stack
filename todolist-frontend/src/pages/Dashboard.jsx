import { useState } from 'react'
import { useGetTasksQuery, useSearchTasksQuery } from '../store/api/taskApi'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskStats from '../components/tasks/TaskStats'
import KanbanBoard from '../components/tasks/KanbanBoard'
import { Plus, Grid3x3, LayoutGrid, ClipboardList, Search } from 'lucide-react'

export default function Dashboard() {
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filters, setFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('kanban') // 'grid' or 'kanban'
  
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
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="Grid View"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Task
            </button>
          </div>
        </div>

        <TaskStats />

        <TaskFilters
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {isLoading ? (
          viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          )
        ) : tasks && tasks.length > 0 ? (
          viewMode === 'kanban' ? (
            <KanbanBoard tasks={tasks} onEdit={handleEdit} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} onEdit={handleEdit} />
              ))}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-lg">
                {searchQuery ? (
                  <Search className="h-12 w-12 text-primary-600" />
                ) : (
                  <ClipboardList className="h-12 w-12 text-primary-600" />
                )}
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                <Plus className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No tasks match your search' : 'No tasks yet'}
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {searchQuery ? (
                <>
                  We couldn't find any tasks matching <span className="font-medium">"{searchQuery}"</span>
                  <br />
                  Try adjusting your search terms
                </>
              ) : (
                'Get started by creating your first task. Organize your work and stay productive!'
              )}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
              >
                <Plus className="h-5 w-5" />
                Create Your First Task
              </button>
            )}
          </div>
        )}

        {showTaskForm && (
          <TaskForm task={editingTask} onClose={handleCloseForm} />
        )}
      </div>
    </div>
  )
}

