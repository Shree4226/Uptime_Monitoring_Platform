import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./components/ProtectedRoute"
import AuthenticatedLayout from "./components/layout/AuthenticatedLayout"
import Monitors from "./pages/Monitors"
import MonitorDetails from "./pages/MonitorDetails.tsx"
import CheckHistory from "./pages/CheckHistory"
import { AuthProvider } from "./context/AuthProvider"
import ErrorBoundary from "./components/ErrorBoundary"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Dashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/monitors"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Monitors />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/monitors/:monitorId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <MonitorDetails />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/monitors/:monitorId/checks"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CheckHistory />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App