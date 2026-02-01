import { useAuth } from '@clerk/clerk-react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthLoading from './AuthLoading';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLoaded, isSignedIn } = useAuth();
    const location = useLocation();

    // Show loading state while Clerk is initializing
    if (!isLoaded) {
        return <AuthLoading />;
    }

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
        return <Navigate to="/sign-in" state={{ from: location }} replace />;
    }

    // User is authenticated, render the protected content
    return <>{children}</>;
}
