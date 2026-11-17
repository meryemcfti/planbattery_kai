import { Navigate, Route, Routes } from 'react-router-dom'

import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import ActivitiesPage from './pages/ActivitiesPage'
import NewActivityPage from './pages/NewActivityPage'
import ActivityDetailPage from './pages/ActivityDetailPage'
import LoginPage from './pages/LoginPage'
import RoleLoginPage from './pages/RoleLoginPage'
import DemoPreviewPage from './pages/DemoPreviewPage'
import ReportsPage from './pages/ReportsPage'
import ReportOptionsPage from './pages/ReportOptionsPage'
import ReportComparisonPage from './pages/ReportComparisonPage'
import DashboardPage from './pages/DashboardPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import AssessmentsPage from './pages/AssessmentsPage'
import AssessmentDetailPage from './pages/AssessmentDetailPage'

import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/demo" element={<DemoPreviewPage />} />
      <Route path="/role-login" element={<RoleLoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/notifications" element={<NotificationsPage />} />

          <Route path="/assessments" element={<AssessmentsPage />} />

          <Route
            path="/assessments/:assessmentId"
            element={<AssessmentDetailPage />}
          />

          <Route path="/activities" element={<ActivitiesPage />} />

          <Route path="/activities/new" element={<NewActivityPage />} />

          <Route
            path="/activities/:activityId"
            element={<ActivityDetailPage />}
          />

          <Route path="/reports" element={<ReportOptionsPage />} />

          <Route
            path="/reports/comparison"
            element={<ReportComparisonPage />}
          />

          <Route path="/reports/preview" element={<ReportsPage />} />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
