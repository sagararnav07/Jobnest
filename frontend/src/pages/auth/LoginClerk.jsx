import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn, useAuth as useClerkAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

const LoginClerk = () => {
    const navigate = useNavigate()
    const { isSignedIn: clerkSignedIn } = useClerkAuth()
    const { setUserTypeForSignup, syncUserWithBackend, clerkUser, user } = useAuth()
    const [userType, setUserType] = useState('Jobseeker')
    const [showSignIn, setShowSignIn] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const hasSelectedType = useRef(false)

    // Handle post-authentication flow - only after user selects type and completes Clerk auth
    useEffect(() => {
        const handlePostAuth = async () => {
            // Only process if user just completed Clerk auth AND selected a type in this session
            if (clerkSignedIn && clerkUser && hasSelectedType.current && showSignIn && !isProcessing && !user) {
                setIsProcessing(true)
                try {
                    await syncUserWithBackend(clerkUser, userType)
                    const dashboardPath = userType === 'Jobseeker'
                        ? '/jobseeker/dashboard'
                        : '/employer/dashboard'
                    navigate(dashboardPath, { replace: true })
                } catch (err) {
                    console.error('Failed to sync after sign-in:', err)
                    setIsProcessing(false)
                }
            }
        }
        handlePostAuth()
    }, [clerkSignedIn, clerkUser, userType, showSignIn, syncUserWithBackend, navigate, isProcessing, user])

    const handleUserTypeSelect = (type) => {
        setUserType(type)
        setUserTypeForSignup(type)
        hasSelectedType.current = true
        setShowSignIn(true)
    }

    // Show loading while processing post-auth
    if (isProcessing) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">Setting up your account...</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            {!showSignIn ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30"
                        >
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500 text-sm">Choose how you want to access JobNest</p>
                    </div>

                    {/* User Type Selection Cards */}
                    <div className="space-y-4">
                        {/* Job Seeker Card */}
                        <motion.button
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleUserTypeSelect('Jobseeker')}
                            className="w-full p-5 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-base">I'm Looking for a Job</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Find amazing opportunities and grow your career</p>
                                </div>
                                <svg className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </motion.button>

                        {/* Employer Card */}
                        <motion.button
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleUserTypeSelect('Employeer')}
                            className="w-full p-5 bg-gradient-to-r from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 text-left group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 text-base">I'm Hiring</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">Find top talent and build your dream team</p>
                                </div>
                                <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </motion.button>
                    </div>

                    {/* Footer Link */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Back Button & Title */}
                    <div className="mb-6">
                        <button
                            onClick={() => setShowSignIn(false)}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Back</span>
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">
                            {userType === 'Jobseeker' ? 'Job Seeker Sign In' : 'Employer Sign In'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Sign in with your preferred method
                        </p>
                    </div>

                    {/* Clerk SignIn Component */}
                    <SignIn
                        signUpUrl="/register"
                        forceRedirectUrl={userType === 'Jobseeker' ? '/jobseeker/dashboard' : '/employer/dashboard'}
                        appearance={{
                            elements: {
                                rootBox: 'w-full',
                                card: 'shadow-none border-0 p-0 w-full',
                                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-sm font-medium py-2.5',
                                formFieldInput: 'rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500',
                                footerActionLink: 'text-indigo-600 hover:text-indigo-700',
                                identityPreviewEditButton: 'text-indigo-600',
                                formFieldLabel: 'text-gray-700 font-medium',
                                dividerLine: 'bg-gray-200',
                                dividerText: 'text-gray-400',
                                socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                                socialButtonsBlockButtonText: 'text-gray-600 font-medium',
                            }
                        }}
                    />
                </motion.div>
            )}
        </div>
    )
}

export default LoginClerk
