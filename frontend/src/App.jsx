import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CoursesPage } from './features/courses/CoursesPage';
import { CourseDetailPage } from './features/courses/CourseDetailPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { PageLoader } from './components/ui/LoadingSpinner';

function RequireAuth({ children }) {
  const { authStatus } = useAuthStore();
  if (authStatus === 'idle' || authStatus === 'bootstrapping') return <PageLoader />;
  return authStatus === 'authenticated' ? children : <Navigate to="/login" replace />;
}

function RequireGuest({ children }) {
  const { authStatus } = useAuthStore();
  if (authStatus === 'idle' || authStatus === 'bootstrapping') return <PageLoader />;
  return authStatus === 'authenticated' ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<RequireGuest><LoginPage /></RequireGuest>} />
      <Route path="/register" element={<RequireGuest><RegisterPage /></RequireGuest>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<RequireGuest><ResetPasswordPage /></RequireGuest>} />

      {/* Protected */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
