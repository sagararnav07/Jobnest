import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn } from '@clerk/clerk-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

const LoginClerk = () => {
    const navigate = useNavigate()
    const { setUserTypeForSignup, syncUserWithBackend } = useAuth()
    const [userType, setUserType] = useState('Jobseeker')
    const [showSignIn, setShowSignIn] = useState(false)

    const handleUserTypeSelect = (type) => {
        setUserType(type)
        setUserTypeForSignup(type)
        setShowSignIn(true)
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            {!showSignIn ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full md:w-1/2 max-w-md"
                >
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30"
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </motion.div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Choose how you want to access JobNest</p>
                    </div>

                    <div className="space-y-4">
                        {/* Job Seeker Card */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUserTypeSelect('Jobseeker')}
                            className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-300 text-left group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">I'm Looking for a Job</h3>
                                    <p className="text-sm text-gray-600">Find amazing opportunities and grow your career</p>
                                </div>
                            </div>
                        </motion.button>

                        {/* Employer Card */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUserTypeSelect('Employeer')}
                            className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 text-left group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">I'm Hiring</h3>
                                    <p className="text-sm text-gray-600">Find top talent and build your dream team</p>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="text-indigo-600 font-semibold hover:text-indigo-700"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full md:w-1/2 max-w-md"
                >
                    <div className="text-center mb-8">
                        <button
                            onClick={() => setShowSignIn(false)}
                            className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center justify-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>Back</span>
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {userType === 'Jobseeker' ? 'Job Seeker Login' : 'Employer Login'}
                        </h2>
                    </div>

                    <SignIn
                        signUpUrl="/register"
                        appearance={{
                            elements: {
                                formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-700',
                                card: 'shadow-none border-0'
                            }
                        }}
                    />
                </motion.div>
            )}
        </div>
    )
}

export default LoginClerk
