import { useGetTaskStatsQuery } from '../../store/api/taskApi'
import { CheckCircle2, Clock, Circle, XCircle, Calendar, TrendingUp, FileText } from 'lucide-react'

export default function TaskStats() {
  const { data: stats, isLoading } = useGetTaskStatsQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats?.data) return null

  const mainStats = [
    { 
      label: 'Total Tasks', 
      value: stats.data.total, 
      icon: FileText, 
      gradient: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-600'
    },
    { 
      label: 'Pending', 
      value: stats.data.pending, 
      icon: Circle, 
      gradient: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-600'
    },
    { 
      label: 'In Progress', 
      value: stats.data.in_progress, 
      icon: Clock, 
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Completed', 
      value: stats.data.completed, 
      icon: CheckCircle2, 
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-600'
    },
  ]

  const secondaryStats = [
    { 
      label: 'Cancelled', 
      value: stats.data.cancelled, 
      icon: XCircle, 
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      label: 'Overdue', 
      value: stats.data.overdue || 0, 
      icon: Calendar, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ]

  const completionRate = stats.data.total > 0 
    ? Math.round((stats.data.completed / stats.data.total) * 100) 
    : 0

  return (
    <div className="mb-8">
      {/* Main Stats - 4 Cards in One Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-1"
            >
              {/* Gradient Background */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`}></div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  {index === 0 && stats.data.total > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      <TrendingUp className="h-3 w-3" />
                      <span>{completionRate}% done</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value || 0}
                  </p>
                </div>

                {/* Progress Bar for Completed */}
                {stat.label === 'Completed' && stats.data.total > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          )
        })}
      </div>

      {/* Secondary Stats - 2 Cards in One Row */}
      {(stats.data.cancelled > 0 || (stats.data.overdue || 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secondaryStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value || 0}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

