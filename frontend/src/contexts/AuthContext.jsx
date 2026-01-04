import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../api/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Load user on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token')
            if (token) {
                try {
                    const response = await authService.getProfile()
                    setUser(response.user)
                } catch (err) {
                    console.error('Failed to load user:', err)
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                }
            }
            setLoading(false)
        }
        initAuth()
    }, [])

    // Register
    const register = useCallback(async (userData) => {
        setError(null)
        try {
            const response = await authService.register(userData)
            // After registration, fetch full profile
            const profileResponse = await authService.getProfile()
            setUser(profileResponse.user)
            return response
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed'
            setError(errorMessage)
            throw err
        }
    }, [])

    // Login
    const login = useCallback(async (credentials) => {
        setError(null)
        try {
            const response = await authService.login(credentials)
            // Fetch user profile after login
            const profileResponse = await authService.getProfile()
            setUser(profileResponse.user)
            // Return both the login response and user data for redirect logic
            return { ...response, user: profileResponse.user }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed'
            setError(errorMessage)
            throw err
        }
    }, [])

    // Logout
    const logout = useCallback(() => {
        authService.logout()
        setUser(null)
    }, [])

    // Update user data locally
    const updateUser = useCallback((userData) => {
        setUser(prev => ({ ...prev, ...userData }))
    }, [])

    // Refresh user profile
    const refreshProfile = useCallback(async () => {
        try {
            const response = await authService.getProfile()
            setUser(response.user)
            return response.user
        } catch (err) {
            console.error('Failed to refresh profile:', err)
            throw err
        }
    }, [])

    // Check if profile is complete
    const isProfileComplete = useCallback(() => {
        if (!user) return false
        if (user.userType === 'Jobseeker') {
            return !!(user.skills?.length > 0 && user.jobPreference)
        } else {
            return !!(user.description && user.industry)
        }
    }, [user])

    // Check if assessment is complete (for jobseekers)
    const isAssessmentComplete = useCallback(() => {
        if (!user) return false
        return user.test === true
    }, [user])

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateUser,
        refreshProfile,
        isAuthenticated: !!user,
        isJobseeker: user?.userType === 'Jobseeker',
        isEmployer: user?.userType === 'Employeer',
        isProfileComplete,
        isAssessmentComplete
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
