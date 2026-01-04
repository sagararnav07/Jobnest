import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, Toast, Captcha } from '../../components/ui'
import './../../App.css'
const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const captchaRef = useRef(null)
    
    const [formData, setFormData] = useState({
        emailId: '',
        password: '',
        userType: 'Jobseeker'
    })
    const [captchaToken, setCaptchaToken] = useState(null)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' })

    // Validation patterns
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    const validateField = (name, value) => {
        switch (name) {
            case 'emailId':
                if (!value) return 'Email is required'
                if (!emailRegex.test(value)) return 'Invalid email format'
                return ''
            case 'password':
                if (!value) return 'Password is required'
                if (value.length < 8) return 'Password must be at least 8 characters'
                return ''
            default:
                return ''
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        const error = validateField(name, value)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validate all fields
        const newErrors = {}
        Object.keys(formData).forEach(key => {
            if (key !== 'userType') {
                const error = validateField(key, formData[key])
                if (error) newErrors[key] = error
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        // Verify CAPTCHA
        if (!captchaToken) {
            setToast({
                show: true,
                message: 'Please complete the CAPTCHA verification',
                type: 'error'
            })
            return
        }

        setLoading(true)
        try {
            const response = await login({ ...formData, captchaToken })
            
            // Redirect based on actual user type from response, not form selection
            // This handles cases where user selects wrong type
            const actualUserType = response?.user?.userType || formData.userType
            const redirectPath = actualUserType === 'Jobseeker' 
                ? '/jobseeker/dashboard' 
                : '/employer/dashboard'
            navigate(redirectPath)
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Login failed. Please try again.',
                type: 'error'
            })
            // Reset captcha on error
            if (captchaRef.current) {
                captchaRef.current.reset()
            }
            setCaptchaToken(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <motion.div
                className='padding-10'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="text-center mb-8">
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h2>
                    <p className="text-gray-500">Sign in to continue to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="padding-10 space-y-5">
                    {/* User Type Toggle */}
                    <div className="p-1 bg-gray-100 rounded-2xlpadding-10 ">
                        <div className="grid grid-cols-2 gap-1 padding-10">
                            <motion.button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, userType: 'Jobseeker' }))}
                                className={`padding-10 relative py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    formData.userType === 'Jobseeker'
                                        ? 'text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                whileTap={{ scale: 0.98 }}
                            >
                                {formData.userType === 'Jobseeker' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="padding-10 absolute inset-0 bg-white rounded-xl shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Job Seeker
                                </span>
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, userType: 'Employeer' }))}
                                className={`padding-10 relative py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                    formData.userType === 'Employeer'
                                        ? 'text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                whileTap={{ scale: 0.98 }}
                            >
                                {formData.userType === 'Employeer' && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-white rounded-xl shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Employer
                                </span>
                            </motion.button>
                        </div>
                    </div>

                    <Input
                        label="Email Address"
                        type="email"
                        name="emailId"
                        value={formData.emailId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.emailId}
                        required
                        className='padding-10'
                        placeholder="Enter your email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.password}
                        required
                        className='padding-10'
                    />

                    {/* Forgot Password Link */}
                    <div className="padding-10 flex justify-end">
                        <Link 
                            to="/forgot-password" 
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>

                     <br />
                    {/* CAPTCHA */}
                    <Captcha
                        ref={captchaRef}
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken(null)}
                        onError={() => setCaptchaToken(null)}
                    />
                    
                    <br />
                    <Button
                        type="submit"
                        loading={loading}
                        variant="gradient"
                        className="padding-10 w-full"
                        size="lg"
                    >
                        <span className="flex items-center justify-center gap-2">
                            Sign In
                            <motion.svg 
                                className="w-5 h-5" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                                animate={{ x: loading ? 0 : [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </motion.svg>
                        </span>
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400 padding-10">or continue with</span>
                    </div>
                </div>

                {/* Social Login Buttons */}
                <div className="grid grid-cols-2 gap-3">
                    <motion.button
                        type="button"
                        className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                    </motion.button>
                    <motion.button
                        type="button"
                        className="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <svg className="w-5 h-5" fill="#0A66C2" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                    </motion.button>
                </div>

                {/* Sign Up Link */}
                <motion.div 
                    className="mt-8 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link 
                            to="/register/jobseeker" 
                            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
                        >
                            Create one free
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </>
    )
}

export default Login
