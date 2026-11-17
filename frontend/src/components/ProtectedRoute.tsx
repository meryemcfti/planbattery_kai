import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'
import { getCorporateSession } from '../services/authStore'

function ProtectedRoute() {
  const location = useLocation()
  const accessToken = localStorage.getItem('kai_access_token')

  if (!accessToken) {
    const corpSession = getCorporateSession()
    return (
      <Navigate
        to={corpSession ? '/role-login' : '/login'}
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute