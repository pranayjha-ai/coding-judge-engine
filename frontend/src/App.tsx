
import { Navigate, Route, Routes } from "react-router-dom"
import { AppShell } from "@/components/layout/app-shell"
import { AuthLayout } from "@/components/layout/auth-layout"
import { LoginPage } from "@/pages/login-page"
import { ProblemsPage } from "@/pages/problems-page"
import { SignupPage } from "@/pages/signup-page"
import { WorkspacePage } from "@/pages/workspace-page"

function ProtectedLayout() {
  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <AppShell />
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route index element={<Navigate to="/problems" replace />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:problemId" element={<WorkspacePage />} />
      </Route>
    </Routes>
  )
}

export default App
