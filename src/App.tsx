import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RequestProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<AdminLogin />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<AdminDashboard />} />
              </Route>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </RequestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}