import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import ActivitiesPage from './pages/ActivitiesPage'
import NewActivityPage from './pages/NewActivityPage'
import ActivityDetailPage from './pages/ActivityDetailPage'
import LoginPage from './pages/LoginPage'
import ReportsPage from './pages/ReportsPage'
import ReportOptionsPage from './pages/ReportOptionsPage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route path="/" element={<AppLayout />}>
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="activities" element={<ActivitiesPage />} />
      <Route path="activities/new" element={<NewActivityPage />} />
      <Route path="activities/:activityId" element={<ActivityDetailPage />} />
      <Route path="reports" element={<ReportOptionsPage />} />
      <Route path="reports/preview" element={<ReportsPage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
export default App
