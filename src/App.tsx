import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequestProvider } from './context/RequestContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import AdminEventDetail from './pages/AdminEventDetail';
import AdminLogin from './pages/AdminLogin';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventManagement from './pages/EventManagement';

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
                <Route path="/events" element={<EventManagement />} />
                <Route path="/events/create" element={<CreateEvent />} />
                <Route path="/events/:eventId" element={<AdminEventDetail />} />
                <Route path="/events/:eventId/edit" element={<EditEvent />} />
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