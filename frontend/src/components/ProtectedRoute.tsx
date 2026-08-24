import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

function ProtectedRoute() {
  const location = useLocation()
  const accessToken = localStorage.getItem('kai_access_token')

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  return <Outlet />
}

export default ProtectedRoute