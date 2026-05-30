import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { TaskProvider } from './context/TaskContext';

// Layouts & Routers
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import TaskListPage from './pages/TaskListPage';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <TaskProvider>
            <Router>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Layout Route Wrapper */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/kanban" element={<KanbanBoard />} />
                    <Route path="/tasks" element={<TaskListPage />} />
                    <Route path="/settings" element={<ProfileSettings />} />
                  </Route>
                </Route>

                {/* Wildcard Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </TaskProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
