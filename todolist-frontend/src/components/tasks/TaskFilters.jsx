import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'

export default function TaskFilters({ onFilterChange, onSearch }) {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const clearFilters = () => {
    const cleared = {
      status: '',
      priority: '',
      sortBy: 'created_at',
      sortOrder: 'DESC',
    }
    setFilters(cleared)
    setSearchQuery('')
    onFilterChange(cleared)
    onSearch('')
  }

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="input-field pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
        {(filters.status || filters.priority || searchQuery) && (
          <button
            onClick={clearFilters}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="card grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="input-field"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              className="input-field"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              className="input-field"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="created_at">Created Date</option>
              <option value="updated_at">Updated Date</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              className="input-field"
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

