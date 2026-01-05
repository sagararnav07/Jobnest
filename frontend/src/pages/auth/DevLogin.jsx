import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * DevLogin - Development/Testing login page
 * This bypasses Clerk and sets up localStorage directly for testing
 * REMOVE THIS IN PRODUCTION
 */
const DevLogin = () => {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [userType, setUserType] = useState('Jobseeker')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Create a mock user object
            const mockUser = {
                _id: 'dev_' + Date.now(),
                name: name || 'Test User',
                emailId: email || 'test@example.com',
                userType: userType,
                profileCompleted: false,
                test: false // assessment not complete
            }

            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(mockUser))
            localStorage.setItem('userType', userType)
            localStorage.setItem('authSyncTime', Date.now().toString())
            localStorage.removeItem('pendingUserType')

            console.log('=== DEV LOGIN ===')
            console.log('User set in localStorage:', mockUser)
            console.log('userType set:', userType)
            console.log('Verifying localStorage:')
            console.log('- user:', localStorage.getItem('user'))
            console.log('- userType:', localStorage.getItem('userType'))

            // Navigate to dashboard - use direct path
            const dashboardPath = userType === 'Jobseeker'
                ? '/jobseeker/dashboard'
                : '/employer/dashboard'
            
            console.log('Redirecting to:', dashboardPath)
            
            // Force a small delay to ensure localStorage is written
            await new Promise(resolve => setTimeout(resolve, 100))
            
            // Use window.location for full page reload
            window.location.href = dashboardPath
        } catch (err) {
            console.error('Dev login error:', err)
            setError(err.message)
            setLoading(false)
        }
    }

    const clearAuth = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('userType')
        localStorage.removeItem('authSyncTime')
        localStorage.removeItem('pendingUserType')
        alert('Auth cleared! Refresh the page.')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">🔧 Dev Login</h1>
                    <p className="text-sm text-orange-600 mt-2">
                        ⚠️ Development Only - Bypasses Clerk Auth
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Test User"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="test@example.com"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User Type
                        </label>
                        <select
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="Jobseeker">Job Seeker</option>
                            <option value="Employeer">Employer</option>
                        </select>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Logging in...' : 'Dev Login → Dashboard'}
                    </button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <button
                        onClick={clearAuth}
                        className="w-full py-2 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        🗑️ Clear Auth Data
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm font-medium mt-2"
                    >
                        ← Back to Normal Login
                    </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    <p><strong>Debug Info:</strong></p>
                    <pre className="mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify({
                            user: localStorage.getItem('user') ? 'SET' : 'NOT SET',
                            userType: localStorage.getItem('userType'),
                            authSyncTime: localStorage.getItem('authSyncTime')
                        }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default DevLogin
