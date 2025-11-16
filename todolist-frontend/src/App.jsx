import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useVerifyTokenQuery } from './store/api/authApi'
import { setCredentials, logout } from './store/slices/authSlice'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Navbar'
import Login from './components/auth/Login'
import Signup from './components/auth/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import MindMaps from './pages/MindMaps'
import MindMapEditor from './pages/MindMapEditor'

function App() {
  const dispatch = useDispatch()
  const { token, isAuthenticated, user } = useSelector((state) => state.auth)
  const { data, error, isLoading } = useVerifyTokenQuery(undefined, {
    skip: !token || !!user, // Skip if we already have user data (from fresh login)
  })

  useEffect(() => {
    if (token && data?.data && !user) {
      dispatch(setCredentials({ user: data.data.user, token }))
    } else if (token && error) {
      dispatch(logout())
    }
  }, [data, error, token, dispatch, user])

  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {isAuthenticated && <Sidebar />}
      <div className={isAuthenticated ? 'lg:ml-64 pt-16 lg:pt-0' : ''}>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mindmaps"
            element={
              <ProtectedRoute>
                <MindMaps />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mindmaps/:id"
            element={
              <ProtectedRoute>
                <MindMapEditor />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

