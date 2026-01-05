import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignUp, useAuth as useClerkAuth } from '@clerk/clerk-react'
import { motion } from 'framer-motion'

/**
 * RegisterClerk - Simple registration page
 * 1. User selects their type (Jobseeker/Employer)
 * 2. Clerk handles registration
 * 3. After auth, Clerk redirects to /auth/callback which handles sync
 */
const RegisterClerk = () => {
    const navigate = useNavigate()
    const { isSignedIn, isLoaded } = useClerkAuth()
    const [userType, setUserType] = useState(null)

    // If already signed in with Clerk, redirect to callback to handle sync
    if (isLoaded && isSignedIn) {
        navigate('/auth/callback', { replace: true })
        return null
    }

    const handleUserTypeSelect = (type) => {
        localStorage.setItem('pendingUserType', type)
        setUserType(type)
    }

    const handleBack = () => {
        localStorage.removeItem('pendingUserType')
        setUserType(null)
    }

    if (!isLoaded) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {!userType ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30"
                        >
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </motion.div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join JobNest</h1>
                        <p className="text-gray-500 text-sm">Choose how you want to use JobNest</p>
                    </div>

                    <div className="space-y-4">
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

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
                            >
                                Sign in
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
                    <div className="mb-6">
                        <button
                            onClick={handleBack}
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Back</span>
                        </button>
                        <h2 className="text-xl font-bold text-gray-900">
                            {userType === 'Jobseeker' ? 'Job Seeker Sign Up' : 'Employer Sign Up'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Create your account with your preferred method
                        </p>
                    </div>

                    <SignUp
                        signInUrl="/login"
                        forceRedirectUrl="/auth/callback"
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

export default RegisterClerk
