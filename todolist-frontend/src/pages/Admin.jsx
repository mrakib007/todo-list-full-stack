import { useSelector } from 'react-redux'
import { useGetAdminUsersQuery, useUpdateUserStatusMutation, useGetAdminStatsQuery, useDeleteUserMutation } from '../store/api/adminApi'
import { Shield, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Admin() {
  const { user: currentUser } = useSelector((state) => state.auth)
  const { data: usersData, isLoading: usersLoading } = useGetAdminUsersQuery()
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery()
  const [updateUserStatus] = useUpdateUserStatusMutation()
  const [deleteUser] = useDeleteUserMutation()

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus({ id: userId, status: newStatus }).unwrap()
      toast.success('User status updated')
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update user status')
    }
  }

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone and will also delete all their tasks.`)) {
      return
    }

    try {
      await deleteUser(userId).unwrap()
      toast.success('User deleted successfully')
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to delete user')
    }
  }

  const users = usersData?.data?.users || []
  const stats = statsData?.data || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary-600" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Manage users and view statistics</p>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers || 0}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeUsers || 0}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Pending Users</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingUsers || 0}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-600">Banned Users</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.bannedUsers || 0}</p>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Users</h2>
          {usersLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.user_type === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="banned">Banned</option>
                          </select>
                          {currentUser?.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

