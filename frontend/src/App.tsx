import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import AppLayout from './components/AppLayout'
import ActivitiesPage from './pages/ActivitiesPage'
import NewActivityPage from './pages/NewActivityPage'

import './App.css'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<AppLayout />}
      >
        <Route
          index
          element={<Navigate to="/activities" replace />}
        />

        <Route
          path="activities"
          element={<ActivitiesPage />}
        />

        <Route
          path="activities/new"
          element={<NewActivityPage />}
        />
      </Route>
    </Routes>
  )
}

export default App