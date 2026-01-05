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
    const { isAuthenticated, isClerkAuthenticated, isInTransition, loading, syncing } = useAuth()
    const location = useLocation()

    // Show loading while auth is initializing, syncing, or in transition
    if (loading || syncing || isInTransition) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated && !isClerkAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Jobseeker Only Route
export const JobseekerRoute = ({ children }) => {
    const { isAuthenticated, isClerkAuthenticated, isJobseeker, isInTransition, loading, syncing } = useAuth()
    const location = useLocation()

    // Show loading while auth is initializing, syncing, or in transition
    if (loading || syncing || isInTransition) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated && !isClerkAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isJobseeker) {
        return <Navigate to="/employer/dashboard" replace />
    }

    return children
}

// Employer Only Route
export const EmployerRoute = ({ children }) => {
    const { isAuthenticated, isClerkAuthenticated, isEmployer, isInTransition, loading, syncing } = useAuth()
    const location = useLocation()

    // Show loading while auth is initializing, syncing, or in transition
    if (loading || syncing || isInTransition) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated && !isClerkAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isEmployer) {
        return <Navigate to="/jobseeker/dashboard" replace />
    }

    return children
}

// Assessment Required Route - jobseeker must complete assessment
export const AssessmentRequiredRoute = ({ children }) => {
    const { isAuthenticated, isClerkAuthenticated, isJobseeker, isAssessmentComplete, isInTransition, loading, syncing } = useAuth()
    const location = useLocation()

    // Show loading while auth is initializing, syncing, or in transition
    if (loading || syncing || isInTransition) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated && !isClerkAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isJobseeker) {
        return <Navigate to="/employer/dashboard" replace />
    }

    if (!isAssessmentComplete) {
        return <Navigate to="/jobseeker/assessment" state={{ from: location }} replace />
    }

    return children
}

// Profile Required Route - user must complete profile
export const ProfileRequiredRoute = ({ children }) => {
    const { isAuthenticated, isClerkAuthenticated, isProfileComplete, user, isInTransition, loading, syncing } = useAuth()
    const location = useLocation()

    // Show loading while auth is initializing, syncing, or in transition
    if (loading || syncing || isInTransition) {
        return <LoadingSpinner />
    }

    if (!isAuthenticated && !isClerkAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isProfileComplete) {
        const profilePath = user?.userType === 'Jobseeker'
            ? '/jobseeker/profile'
            : '/employer/profile'
        return <Navigate to={profilePath} state={{ from: location, incomplete: true }} replace />
    }

    return children
}

// Guest Route - only accessible when not logged in
export const GuestRoute = ({ children }) => {
    const { isAuthenticated, user, loading, syncing, isInTransition } = useAuth()

    // Show loading while auth is initializing, syncing, or in transition
    if (loading || syncing || isInTransition) {

        // Otherwise show the auth page - let the component handle the flow
        return children
    }

    export default ProtectedRoute
