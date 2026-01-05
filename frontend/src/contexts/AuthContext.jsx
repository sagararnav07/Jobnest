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

// Helper to get user from localStorage
const getStoredUser = () => {
    try {
        const stored = localStorage.getItem('user')
        console.log('[AuthContext] getStoredUser:', stored ? 'FOUND' : 'NOT FOUND')
        return stored ? JSON.parse(stored) : null
    } catch (e) {
        console.error('[AuthContext] Error parsing stored user:', e)
        return null
    }
}

// Helper to check if we have stored auth
const hasStoredAuth = () => {
    try {
        const user = localStorage.getItem('user')
        const type = localStorage.getItem('userType')
        return !!(user && type)
    } catch {
        return false
    }
}

export const AuthProvider = ({ children }) => {
    const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn, getToken, signOut } = useClerkAuth()
    const { user: clerkUser, isLoaded: clerkUserLoaded } = useClerkUser()
    // Initialize user from localStorage
    const [user, setUser] = useState(() => getStoredUser())
    const [userType, setUserType] = useState(() => localStorage.getItem('userType'))
    // CRITICAL: If we have stored auth, start with loading=false to prevent redirect
    const [loading, setLoading] = useState(() => {
        const storedUser = getStoredUser()
        const storedType = localStorage.getItem('userType')
        const hasAuth = !!storedUser && !!storedType
        console.log('[AuthContext] Initial loading state:', !hasAuth, { hasAuth })
        return !hasAuth  // If we have auth, loading is false; otherwise true
    })
    const [syncing, setSyncing] = useState(false)
    const [error, setError] = useState(null)
    const hasCleared = useRef(false)

    console.log('[AuthContext] State:', { clerkLoaded, clerkSignedIn, user: !!user, userType, loading, syncing })

    // Sync user from Clerk to our database
    const syncUserWithBackend = useCallback(async (clerkUserData, type) => {
        if (syncing) {
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
            
            // Store JWT token for subsequent API calls
            if (data.token) {
                localStorage.setItem('token', data.token)
            }
            
            setUser(data.user)
            setUserType(type)
            localStorage.setItem('userType', type)
            localStorage.setItem('user', JSON.stringify(data.user))
            hasCleared.current = false  // Reset for next sign-out
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
        console.log('[AuthContext] useEffect triggered:', { clerkLoaded, clerkSignedIn, user: !!user, hasCleared: hasCleared.current })

        // If we have a stored user and userType, trust it immediately
        // This allows the dashboard to load while Clerk initializes
        if (user && userType) {
            console.log('[AuthContext] Have stored user, setting loading=false immediately')
            setLoading(false)
            return
        }

        if (!clerkLoaded) {
            console.log('[AuthContext] Clerk not loaded yet, no stored user')
            return
        }

        // Clerk is loaded
        setLoading(false)

        // If signed in with Clerk AND we have a stored user, we're good
        if (clerkSignedIn && user) {
            console.log('[AuthContext] Signed in with stored user - OK')
            return
        }

        // If signed in but NO stored user, they need to go through callback
        if (clerkSignedIn && !user) {
            console.log('[AuthContext] Signed in but no stored user - need sync')
            // Don't clear, just wait for sync
            return
        }

        // NOTE: We no longer auto-clear user data when Clerk is not signed in
        // User data is only cleared on explicit logout
        // This prevents the race condition where Clerk hasn't restored session yet
        console.log('[AuthContext] Clerk not signed in, no stored user - showing login')
        
    }, [clerkLoaded, clerkSignedIn, user, userType])

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

    // Logout - clear all state
    const logout = useCallback(async () => {
        console.log('[AuthContext] Logging out...')
        setUser(null)
        setUserType(null)
        localStorage.removeItem('userType')
        localStorage.removeItem('user')
        localStorage.removeItem('pendingUserType')
        localStorage.removeItem('authSyncTime')
        hasCleared.current = true  // Prevent any re-clearing during Clerk signOut

        // Sign out from Clerk
        try {
            await signOut()
        } catch (err) {
            console.error('Clerk signOut error:', err)
        }
    }, [signOut])

    // Set user type during signup
    const setUserTypeForSignup = useCallback((type) => {
        setUserType(type)
        localStorage.setItem('userType', type)
    }, [])

    // Determine if we're in a transitional auth state (Clerk signed in, but backend not synced yet)
    const isInTransition = clerkSignedIn && !user && !!localStorage.getItem('userType')

    // Compute effective loading state:
    // - If we have a stored user and userType, we're ready (loading was initialized to false)
    // - Otherwise, wait for Clerk to fully load
    const hasStoredAuth = !!user && !!userType
    // If we have stored auth, trust it immediately (loading should already be false)
    // If no stored auth, wait for Clerk
    const effectiveLoading = hasStoredAuth ? false : (loading || !clerkLoaded || !clerkUserLoaded)

    const value = {
        user,
        userType,
        loading: effectiveLoading,
        syncing,
        isInTransition,
        error,
        clerkSignedIn,
        clerkUser,
        clerkUserLoaded,
        syncUserWithBackend,
        completeProfile,
        updateUserProfile,
        getUserProfile,
        logout,
        setUserTypeForSignup,
        // User is authenticated if Clerk is signed in AND we have synced user data
        isAuthenticated: clerkSignedIn && !!user,
        // User is "partially authenticated" if Clerk is signed in (even if backend sync pending)
        isClerkAuthenticated: clerkSignedIn,
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