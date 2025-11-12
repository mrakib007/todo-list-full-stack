import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { LogOut, User, Settings, LayoutDashboard, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (!isAuthenticated) return null

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex items-center px-2 py-2 text-xl font-bold text-primary-600">
              <LayoutDashboard className="h-6 w-6 mr-2" />
              TodoList
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
              >
                Dashboard
              </Link>
              {user?.user_type === 'super_admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary-600"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600"
            >
              <User className="h-5 w-5 mr-1" />
              {user?.name}
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

