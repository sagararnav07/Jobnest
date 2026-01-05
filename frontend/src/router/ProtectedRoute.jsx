import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts'

// Loading spinner component
const LoadingSpinner = () => (
    <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
)

// Protected Route - requires authentication
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Jobseeker Only Route
export const JobseekerRoute = ({ children }) => {
    const { isAuthenticated, isJobseeker, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isJobseeker) {
        return <Navigate to="/employer/dashboard" replace />
    }

    return children
}

// Employer Only Route
export const EmployerRoute = ({ children }) => {
    const { isAuthenticated, isEmployer, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isEmployer) {
        return <Navigate to="/jobseeker/dashboard" replace />
    }

    return children
}

// Assessment Required Route - jobseeker must complete assessment
export const AssessmentRequiredRoute = ({ children }) => {
    const { isAuthenticated, isJobseeker, isAssessmentComplete, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isJobseeker) {
        return <Navigate to="/employer/dashboard" replace />
    }

    if (!isAssessmentComplete()) {
        return <Navigate to="/jobseeker/assessment" state={{ from: location }} replace />
    }

    return children
}

// Profile Required Route - user must complete profile
export const ProfileRequiredRoute = ({ children }) => {
    const { isAuthenticated, isProfileComplete, user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isProfileComplete()) {
        const profilePath = user?.userType === 'Jobseeker'
            ? '/jobseeker/profile'
            : '/employer/profile'
        return <Navigate to={profilePath} state={{ from: location, incomplete: true }} replace />
    }

    return children
}

// Guest Route - only accessible when not logged in
export const GuestRoute = ({ children }) => {
    const { isAuthenticated, user, userType, loading, clerkSignedIn } = useAuth()

    if (loading) {
        return <LoadingSpinner />
    }

    // If user is fully authenticated (Clerk + backend synced), redirect to dashboard
    if (isAuthenticated && user) {
        const dashboardPath = user?.userType === 'Jobseeker'
            ? '/jobseeker/dashboard'
            : '/employer/dashboard'
        return <Navigate to={dashboardPath} replace />
    }

    // If signed in with Clerk but no user type selected yet, show the auth page
    // This allows users to select their user type after OAuth sign-in
    if (clerkSignedIn && !userType) {
        return children
    }

    // If signed in with Clerk and has userType but not synced yet, show loading
    if (clerkSignedIn && userType && !user) {
        return <LoadingSpinner />
    }

    return children
}

export default ProtectedRoute
