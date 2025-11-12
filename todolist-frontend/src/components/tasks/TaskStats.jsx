import { useGetTaskStatsQuery } from '../../store/api/taskApi'
import { CheckCircle2, Clock, Circle, XCircle, AlertCircle } from 'lucide-react'

export default function TaskStats() {
  const { data: stats, isLoading } = useGetTaskStatsQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats?.data) return null

  const statItems = [
    { label: 'Total', value: stats.data.total, icon: AlertCircle, color: 'text-gray-600 bg-gray-100' },
    { label: 'Pending', value: stats.data.pending, icon: Circle, color: 'text-yellow-600 bg-yellow-100' },
    { label: 'In Progress', value: stats.data.in_progress, icon: Clock, color: 'text-blue-600 bg-blue-100' },
    { label: 'Completed', value: stats.data.completed, icon: CheckCircle2, color: 'text-green-600 bg-green-100' },
    { label: 'Cancelled', value: stats.data.cancelled, icon: XCircle, color: 'text-red-600 bg-red-100' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.value || 0}</p>
              </div>
              <div className={`p-3 rounded-full ${item.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

