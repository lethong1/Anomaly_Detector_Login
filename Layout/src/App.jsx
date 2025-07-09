import './App.css'
import LoginPage from './pages/LoginPage'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/dashboard'
import { AuthProvider, useAuth } from './components/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import UsersPage from './pages/UsersPage'
import LogsPage from './pages/logs'
import SettingsPage from './pages/SettingsPage'
import { App as AntApp } from 'antd';
import { message } from 'antd';
import { notification } from 'antd';

function HomeRedirect() {
  const { state } = useAuth();
  
  if (state.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <UsersPage />
                </ProtectedRoute>
              } />
              <Route path="/logs" element={
                  <ProtectedRoute>
                      <LogsPage />
                  </ProtectedRoute>
              } />
              <Route path="/settings" element={
                  <ProtectedRoute>
                      <SettingsPage />
                  </ProtectedRoute>
              } />
              <Route path="/" element={<HomeRedirect />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
    </AntApp>
  )
}

export default App
