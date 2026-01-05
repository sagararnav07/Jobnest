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
    const { user, loading, syncing, isClerkAuthenticated } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    // If Clerk is authenticated but user not synced yet, show loading
    if (isClerkAuthenticated && !user) {
        return <LoadingSpinner />
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Jobseeker Only Route
export const JobseekerRoute = ({ children }) => {
    const { user, userType, loading, syncing, isClerkAuthenticated, isInTransition } = useAuth()
    const location = useLocation()

    console.log('[JobseekerRoute] Check:', { user: !!user, userType, loading, syncing, isClerkAuthenticated, isInTransition, path: location.pathname })

    // Show loading while auth is initializing or syncing
    if (loading || syncing) {
        console.log('[JobseekerRoute] Still loading/syncing')
        return <LoadingSpinner />
    }

    // If Clerk is authenticated but user not synced yet, show loading
    // This handles the race condition after OTP verification
    if (isClerkAuthenticated && !user) {
        console.log('[JobseekerRoute] Clerk authenticated but user not synced, showing loading')
        return <LoadingSpinner />
    }

    // Check if user exists (synced with backend)
    if (!user) {
        console.log('[JobseekerRoute] No user, redirecting to /login')
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (userType && userType !== 'Jobseeker') {
        console.log('[JobseekerRoute] Not a jobseeker, redirecting to employer dashboard')
        return <Navigate to="/employer/dashboard" replace />
    }

    console.log('[JobseekerRoute] Access granted')
    return children
}

// Employer Only Route
export const EmployerRoute = ({ children }) => {
    const { user, userType, loading, syncing, isClerkAuthenticated } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    // If Clerk is authenticated but user not synced yet, show loading
    if (isClerkAuthenticated && !user) {
        return <LoadingSpinner />
    }

    // Check if user exists (synced with backend)
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (userType && userType !== 'Employeer') {
        return <Navigate to="/jobseeker/dashboard" replace />
    }

    return children
}

// Assessment Required Route - jobseeker must complete assessment
export const AssessmentRequiredRoute = ({ children }) => {
    const { user, userType, isAssessmentComplete, loading, syncing } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    if (!user) {
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
    const { user, isProfileComplete, userType, loading, syncing } = useAuth()
    const location = useLocation()

    if (loading || syncing) {
        return <LoadingSpinner />
    }

    if (!user) {
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
    const { user, userType, loading } = useAuth()

    console.log('[GuestRoute] Check:', { user: !!user, userType, loading })

    // Show loading while auth is initializing
    if (loading) {
        console.log('[GuestRoute] Still loading')
        return <LoadingSpinner />
    }

    // If we have a synced user, redirect to their dashboard
    // This handles page refresh scenarios
    if (user) {
        // Use userType from context (which comes from localStorage), fallback to user.userType
        const type = userType || user?.userType
        const dashboardPath = type === 'Jobseeker'
            ? '/jobseeker/dashboard'
            : '/employer/dashboard'
        console.log('[GuestRoute] User exists, redirecting to:', dashboardPath)
        return <Navigate to={dashboardPath} replace />
    }

    // Otherwise show the auth page - let the component handle the Clerk flow
    console.log('[GuestRoute] No user, showing auth page')
    return children
}

export default ProtectedRoute
