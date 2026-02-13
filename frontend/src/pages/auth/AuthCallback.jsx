import { useEffect, useState, useRef } from 'react'
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react'

/**
 * AuthCallback - Handles post-Clerk authentication (email, Google, GitHub)
 * Waits for Clerk to fully load → syncs with backend → redirects to dashboard
 * Handles OAuth providers that take longer to restore session state
 */
const AuthCallback = () => {
    const { isSignedIn, isLoaded: authLoaded, getToken } = useClerkAuth()
    const { user: clerkUser, isLoaded: userLoaded } = useUser()
    const [status, setStatus] = useState('loading')
    const [error, setError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)
    const syncStarted = useRef(false)
    const maxWaitTime = useRef(null)

    console.log('AuthCallback render:', { authLoaded, userLoaded, isSignedIn, clerkUser: !!clerkUser, status, retryCount })

    useEffect(() => {
        const doSync = async () => {
            console.log('doSync called:', { authLoaded, userLoaded, isSignedIn, clerkUser: !!clerkUser, syncStarted: syncStarted.current })

            // Prevent double sync
            if (syncStarted.current) {
                console.log('Sync already started, skipping')
                return
            }

            // Wait for Clerk to be fully ready
            if (!authLoaded || !userLoaded) {
                console.log('Clerk not ready yet, waiting...')
                return
            }

            // If not signed in after Clerk loads, this could be an OAuth flow
            // where Clerk needs more time to process the callback
            if (!isSignedIn || !clerkUser) {
                console.log('Not signed in yet, OAuth may still be processing...')
                
                // Set a maximum wait time of 15 seconds for OAuth flows
                if (!maxWaitTime.current) {
                    maxWaitTime.current = Date.now() + 15000
                }
                
                if (Date.now() < maxWaitTime.current) {
                    // Retry with exponential backoff
                    const delay = Math.min(500 * Math.pow(1.5, retryCount), 3000)
                    console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1})`)
                    setTimeout(() => {
                        setRetryCount(prev => prev + 1)
                    }, delay)
                    return
                }
                
                console.log('Max wait time exceeded, session may be expired')
                setStatus('not-signed-in')
                return
            }

            // Mark sync as started
            console.log('Starting sync...')
            syncStarted.current = true
            setStatus('syncing')

            // Get userType from localStorage (set before OAuth redirect)
            const userType = localStorage.getItem('pendingUserType') || localStorage.getItem('userType') || 'Jobseeker'

            try {
                // Get Clerk token - retry up to 3 times for OAuth flows
                console.log('Getting Clerk token...')
                let token = null
                for (let i = 0; i < 3; i++) {
                    try {
                        token = await getToken()
                        if (token) break
                    } catch (tokenErr) {
                        console.warn(`Token attempt ${i + 1} failed:`, tokenErr.message)
                        if (i < 2) await new Promise(r => setTimeout(r, 1000))
                    }
                }
                console.log('Token received:', token ? 'YES' : 'NO')

                if (!token) {
                    throw new Error('Could not get authentication token. Please try signing in again.')
                }

                // Extract user info
                const email = clerkUser.primaryEmailAddress?.emailAddress ||
                    clerkUser.emailAddresses?.[0]?.emailAddress || ''
                const name = clerkUser.fullName ||
                    `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
                    'User'
                const profileImage = clerkUser.imageUrl || ''

                console.log('User info:', { email, name, userType })

                if (!email) {
                    throw new Error('Email address not found. Please ensure your OAuth account has a verified email.')
                }

                // Sync with backend - retry on failure for cold start scenarios
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'
                console.log('Calling sync API:', `${apiUrl}/auth/clerk/sync`)

                let response = null
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        response = await fetch(
                            `${apiUrl}/auth/clerk/sync`,
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    userType,
                                    email,
                                    name,
                                    profileImage
                                })
                            }
                        )
                        if (response.ok) break
                        
                        // If server is waking up (cold start), retry
                        if (response.status >= 500 && attempt < 2) {
                            console.log(`Server returned ${response.status}, retrying in ${(attempt + 1) * 2}s...`)
                            setStatus('waking-server')
                            await new Promise(r => setTimeout(r, (attempt + 1) * 2000))
                            continue
                        }
                    } catch (fetchErr) {
                        if (attempt < 2) {
                            console.log(`Fetch failed, retrying in ${(attempt + 1) * 2}s...`, fetchErr.message)
                            setStatus('waking-server')
                            await new Promise(r => setTimeout(r, (attempt + 1) * 2000))
                            continue
                        }
                        throw fetchErr
                    }
                }

                console.log('Response status:', response?.status)

                if (!response || !response.ok) {
                    const errorData = await response?.json().catch(() => ({}))
                    console.log('Error data:', errorData)
                    throw new Error(errorData.message || 'Failed to sync with server')
                }

                const data = await response.json()
                console.log('Sync successful:', data)

                // Store in localStorage for persistence
                if (data.token) {
                    localStorage.setItem('token', data.token)
                }
                localStorage.setItem('userType', userType)
                localStorage.setItem('user', JSON.stringify(data.user))
                localStorage.setItem('authSyncTime', Date.now().toString())
                localStorage.removeItem('pendingUserType')

                // Use window.location.href for FULL page reload
                const dashboardPath = userType === 'Jobseeker'
                    ? '/jobseeker/dashboard'
                    : '/employer/dashboard'

                console.log('Redirecting to:', dashboardPath)
                window.location.href = dashboardPath

            } catch (err) {
                console.error('Sync error:', err)
                setError(err.message)
                setStatus('error')
                syncStarted.current = false
            }
        }

        doSync()
    }, [authLoaded, userLoaded, isSignedIn, clerkUser, getToken, retryCount])

    if (status === 'not-signed-in') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Expired</h2>
                    <p className="text-gray-600 mb-6">Please sign in again.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => {
                            syncStarted.current = false
                            setError(null)
                            setStatus('loading')
                        }}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                    {status === 'syncing' ? 'Setting up your account...' : 
                     status === 'waking-server' ? 'Waking up the server, please wait...' :
                     'Loading...'}
                </p>
                {status === 'waking-server' && (
                    <p className="text-gray-400 text-sm mt-2">Free tier servers may take a moment to start</p>
                )}
            </div>
        </div>
    )
}

export default AuthCallback
