import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children, allowGuest = false }) {
  const { currentUser, isGuest } = useAuth()
  
  if (currentUser || (allowGuest && isGuest)) {
    return children
  }
  
  return <Navigate to="/login" replace />
}
