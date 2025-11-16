import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { LogOut, User, LayoutDashboard, Shield, Menu, X, Brain, Calendar } from 'lucide-react'
import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  if (!isAuthenticated) return null

  const isActive = (path) => location.pathname === path

  // Use useMemo to ensure navLinks updates when user changes
  const navLinks = useMemo(() => {
    const links = [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        to: '/calendar',
        label: 'Calendar',
        icon: Calendar,
      },
      {
        to: '/mindmaps',
        label: 'Mind Maps',
        icon: Brain,
      },
    ]
    
    if (user?.user_type === 'super_admin') {
      links.push({
        to: '/admin',
        label: 'Admin',
        icon: Shield,
      })
    }
    
    links.push({
      to: '/profile',
      label: 'Profile',
      icon: User,
    })
    
    return links
  }, [user?.user_type])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex items-center text-xl font-bold text-primary-600">
            <LayoutDashboard className="h-6 w-6 mr-2" />
            TodoList
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/dashboard" className="flex items-center text-xl font-bold text-primary-600">
              <LayoutDashboard className="h-6 w-6 mr-2" />
              TodoList
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.to)
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* User Info and Logout */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex items-center px-4 py-2 text-sm text-gray-700">
              <User className="h-5 w-5 mr-3" />
              <span className="truncate">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}

