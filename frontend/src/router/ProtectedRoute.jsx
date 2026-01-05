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
    const { clerkSignedIn, loading, syncing } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    if (!clerkSignedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Jobseeker Only Route
export const JobseekerRoute = ({ children }) => {
    const { clerkSignedIn, userType, loading, syncing } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    if (!clerkSignedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (userType && userType !== 'Jobseeker') {
        return <Navigate to="/employer/dashboard" replace />
    }

    return children
}

// Employer Only Route
export const EmployerRoute = ({ children }) => {
    const { clerkSignedIn, userType, loading, syncing } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    if (!clerkSignedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (userType && userType !== 'Employeer') {
        return <Navigate to="/jobseeker/dashboard" replace />
    }

    return children
}

// Assessment Required Route - jobseeker must complete assessment
export const AssessmentRequiredRoute = ({ children }) => {
    const { clerkSignedIn, userType, isAssessmentComplete, loading, syncing } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    if (!clerkSignedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (userType && userType !== 'Jobseeker') {
        return <Navigate to="/employer/dashboard" replace />
    }

    if (!isAssessmentComplete) {
        return <Navigate to="/jobseeker/assessment" state={{ from: location }} replace />
    }

    return children
}

// Profile Required Route - user must complete profile
export const ProfileRequiredRoute = ({ children }) => {
    const { clerkSignedIn, isProfileComplete, userType, loading, syncing } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    if (!clerkSignedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isProfileComplete) {
        const profilePath = userType === 'Jobseeker'
            ? '/jobseeker/profile'
            : '/employer/profile'
        return <Navigate to={profilePath} state={{ from: location, incomplete: true }} replace />
    }

    return children
}

// Guest Route - only accessible when not logged in
export const GuestRoute = ({ children }) => {
    const { clerkSignedIn, user, userType, loading, syncing } = useAuth()

    // Show loading while auth is initializing or syncing
    if (loading || syncing) {
        return <LoadingSpinner />
    }

    // If Clerk is signed in AND we have a user AND userType, redirect to dashboard
    if (clerkSignedIn && user && userType) {
        const dashboardPath = userType === 'Jobseeker'
            ? '/jobseeker/dashboard'
            : '/employer/dashboard'
        return <Navigate to={dashboardPath} replace />
    }

    // Otherwise show the auth page
    return children
}

export default ProtectedRoute
