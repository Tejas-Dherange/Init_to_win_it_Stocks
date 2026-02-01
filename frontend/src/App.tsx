
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Decisions from './pages/Decisions';
import Chat from './pages/Chat';
import SignInPage from './pages/auth/SignIn';
import SignUpPage from './pages/auth/SignUp';
import UserProfilePage from './pages/auth/UserProfile';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthLoading from './components/auth/AuthLoading';
import { useInitializeApi } from './hooks/useInitializeApi';
import './styles/globals.css';

// Placeholder for Health page
const Health = () => <div className="text-2xl font-bold">Health Page (Coming Soon)</div>;

function App() {
  const { isLoaded } = useAuth();

  // Initialize API service with Clerk authentication
  useInitializeApi();

  // Show loading screen while Clerk initializes
  if (!isLoaded) {
    return <AuthLoading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Portfolio />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decisions"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Decisions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Chat />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/health"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Health />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/*"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
