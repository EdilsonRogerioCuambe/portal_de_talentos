import React, { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface PrivateRouteProps {
  roles?: Array<'candidate' | 'manager'>
  children: ReactElement
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  roles,
  children,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}