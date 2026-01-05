import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-react'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, getToken } = useClerkAuth()
    const { user: clerkUser } = useClerkUser()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [error, setError] = useState(null)
    const [userType, setUserType] = useState(() => localStorage.getItem('userType'))
    const syncAttempted = useRef(false)

    // Sync user from Clerk to our database
    const syncUserWithBackend = useCallback(async (clerkUserData, type) => {
        if (syncing) {
            console.log('Already syncing, skipping...')
            return null
        }

        setSyncing(true)

        try {
            const token = await getToken()
            if (!token) {
                throw new Error('No auth token available')
            }

            // Extract user info from Clerk user object
            const email = clerkUserData?.primaryEmailAddress?.emailAddress ||
                clerkUserData?.emailAddresses?.[0]?.emailAddress || ''
            const name = clerkUserData?.fullName ||
                `${clerkUserData?.firstName || ''} ${clerkUserData?.lastName || ''}`.trim() ||
                'User'
            const profileImage = clerkUserData?.imageUrl || clerkUserData?.profileImageUrl || ''

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/auth/clerk/sync`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        userType: type,
                        email: email,
                        name: name,
                        profileImage: profileImage
                    })
                }
            )

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                throw new Error(errorData.message || 'Failed to sync user with backend')
            }

            const data = await response.json()
            setUser(data.user)
            setUserType(type)
            localStorage.setItem('userType', type)
            syncAttempted.current = true
            return data.user
        } catch (err) {
            console.error('Failed to sync user:', err)
            throw err
        } finally {
            setSyncing(false)
        }
    }, [getToken])

    // Initialize auth on mount and when Clerk state changes
    useEffect(() => {
        if (!clerkLoaded) return

        const initAuth = async () => {
            // Don't auto-sync if we already have a user or if sync was already attempted
            if (user || syncAttempted.current) {
                setLoading(false)
                return
            }

            try {
                if (clerkSignedIn && clerkUser) {
                    // Try to detect user type from localStorage
                    const storedType = localStorage.getItem('userType')

                    if (!storedType) {
                        // User is signed in but hasn't selected a type yet
                        // Let the login/register page handle the sync
                        setLoading(false)
                        return
                    }

                    // Only auto-sync if we have a stored type and haven't synced yet
                    if (!syncing) {
                        try {
                            await syncUserWithBackend(clerkUser, storedType)
                        } catch (err) {
                            console.error('Backend sync failed:', err)
                            // Don't block the auth flow if sync fails
                        }
                    }
                } else {
                    setUser(null)
                    setUserType(null)
                    syncAttempted.current = false
                }
            } catch (err) {
                console.error('Auth initialization error:', err)
                setError('Failed to initialize authentication')
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [clerkLoaded, clerkSignedIn, clerkUser?.id])

    // Complete user profile after signup
    const completeProfile = useCallback(async (profileData) => {
        try {
            const token = await getToken()
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/auth/clerk/complete-profile`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ userType, ...profileData })
                }
            )

            if (!response.ok) {
                throw new Error('Failed to complete profile')
            }

            const data = await response.json()
            setUser(data.user)
            return data.user
        } catch (err) {
            console.error('Failed to complete profile:', err)
            throw err
        }
    }, [getToken, userType])

    // Update user profile
    const updateUserProfile = useCallback(async (updates) => {
        try {
            const token = await getToken()
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/auth/clerk/profile`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updates)
                }
            )

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            const data = await response.json()
            setUser(data.user)
            return data.user
        } catch (err) {
            console.error('Failed to update profile:', err)
            throw err
        }
    }, [getToken])

    // Get user profile
    const getUserProfile = useCallback(async () => {
        try {
            const token = await getToken()
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/auth/clerk/profile`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            )

            if (!response.ok) {
                throw new Error('Failed to get profile')
            }

            const data = await response.json()
            setUser(data.user)
            setUserType(data.userType)
            return data
        } catch (err) {
            console.error('Failed to get profile:', err)
            throw err
        }
    }, [getToken])

    // Logout is handled by Clerk
    const logout = useCallback(() => {
        setUser(null)
        setUserType(null)
        localStorage.removeItem('userType')
    }, [])

    // Set user type during signup
    const setUserTypeForSignup = useCallback((type) => {
        setUserType(type)
        localStorage.setItem('userType', type)
    }, [])

    const value = {
        user,
        userType,
        loading: loading || !clerkLoaded,
        syncing,
        error,
        clerkSignedIn,
        clerkUser,
        syncUserWithBackend,
        completeProfile,
        updateUserProfile,
        getUserProfile,
        logout,
        setUserTypeForSignup,
        isAuthenticated: clerkSignedIn && !!user,
        isJobseeker: userType === 'Jobseeker',
        isEmployer: userType === 'Employeer',
        isProfileComplete: user?.profileCompleted || false,
        isAssessmentComplete: user?.test === true
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext