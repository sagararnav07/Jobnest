import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, Toast, Captcha, OtpInput } from '../../components/ui'
import authService from '../../api/authService'

const RegisterJobseeker = () => {
    const navigate = useNavigate()
    const { register } = useAuth()
    const captchaRef = useRef(null)
    
    // Registration steps: 1 = Form, 2 = OTP Verification
    const [step, setStep] = useState(1)
    
    const [formData, setFormData] = useState({
        name: '',
        emailId: '',
        password: '',
        confirmPassword: '',
        userType: 'Jobseeker'
    })
    const [captchaToken, setCaptchaToken] = useState(null)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' })
    
    // OTP related state
    const [otp, setOtp] = useState('')
    const [otpError, setOtpError] = useState('')
    const [otpVerified, setOtpVerified] = useState(false)
    const [resendCooldown, setResendCooldown] = useState(0)
    const [otpExpiresIn, setOtpExpiresIn] = useState(0)

    // Countdown timer for resend
    useEffect(() => {
        let timer
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1)
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [resendCooldown])

    // OTP expiry countdown
    useEffect(() => {
        let timer
        if (otpExpiresIn > 0 && step === 2) {
            timer = setInterval(() => {
                setOtpExpiresIn(prev => {
                    if (prev <= 1) {
                        setOtpError('OTP has expired. Please request a new one.')
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [otpExpiresIn, step])

    // Validation patterns
    const nameRegex = /^[A-Z][a-zA-Z]{2,}( [A-Z][a-zA-Z]{2,})*$/
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value) return 'Name is required'
                if (!nameRegex.test(value)) return 'Name must start with capital letter, each word at least 3 letters'
                return ''
            case 'emailId':
                if (!value) return 'Email is required'
                if (!emailRegex.test(value)) return 'Invalid email format'
                return ''
            case 'password':
                if (!value) return 'Password is required'
                if (value.length < 8) return 'Password must be at least 8 characters'
                if (!passwordRegex.test(value)) return 'Password must include uppercase, lowercase, number, and special character'
                return ''
            case 'confirmPassword':
                if (!value) return 'Please confirm your password'
                if (value !== formData.password) return 'Passwords do not match'
                return ''
            default:
                return ''
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        const error = validateField(name, value)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
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
            const response = await authService.sendOTP(
                formData.emailId, 
                formData.userType, 
                formData.name
            )
            
            setToast({
                show: true,
                message: 'OTP sent to your email!',
                type: 'success'
            })
            
            setOtpExpiresIn(response.expiresIn || 600) // 10 minutes default
            setResendCooldown(60) // 60 seconds cooldown
            setStep(2)
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Failed to send OTP. Please try again.',
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

    // Verify OTP
    const handleVerifyOTP = async () => {
        if (otp.length !== 6) {
            setOtpError('Please enter a valid 6-digit OTP')
            return
        }

        setLoading(true)
        setOtpError('')
        
        try {
            await authService.verifyOTP(formData.emailId, otp)
            setOtpVerified(true)
            setToast({
                show: true,
                message: 'Email verified successfully!',
                type: 'success'
            })
            
            // Proceed with registration
            await handleCompleteRegistration()
        } catch (error) {
            setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Complete registration after OTP verification
    const handleCompleteRegistration = async () => {
        setLoading(true)
        try {
            const { confirmPassword, ...registerData } = formData
            await register({ ...registerData, captchaToken })
            navigate('/jobseeker/profile')
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Registration failed. Please try again.',
                type: 'error'
            })
            // Go back to step 1 if registration fails
            setStep(1)
            setOtpVerified(false)
            if (captchaRef.current) {
                captchaRef.current.reset()
            }
            setCaptchaToken(null)
        } finally {
            setLoading(false)
        }
    }

    // Resend OTP
    const handleResendOTP = async () => {
        if (resendCooldown > 0) return

        setLoading(true)
        try {
            const response = await authService.resendOTP(
                formData.emailId,
                formData.userType,
                formData.name
            )
            
            setToast({
                show: true,
                message: 'New OTP sent to your email!',
                type: 'success'
            })
            
            setOtpExpiresIn(response.expiresIn || 600)
            setResendCooldown(60)
            setOtp('')
            setOtpError('')
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Failed to resend OTP.',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Go back to step 1
    const handleBackToForm = () => {
        setStep(1)
        setOtp('')
        setOtpError('')
        setOtpVerified(false)
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full"
            >
                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Header with icon */}
                            <div className="text-center mb-10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1 }}
                                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-5 shadow-lg shadow-indigo-500/30"
                                >
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                                    Create your account
                                </h2>
                                <p className="text-gray-500 text-base font-medium">
                                    Join as a job seeker and find your dream career
                                </p>
                            </div>

                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div className="space-y-5">
                                    <Input
                                        label="Full Name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.name}
                                        required
                                    />

                                    <Input
                                        label="Email Address"
                                        type="email"
                                        name="emailId"
                                        value={formData.emailId}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.emailId}
                                        required
                                    />

                                    <div>
                                        <Input
                                            label="Password"
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={errors.password}
                                            required
                                        />
                                        <p className="text-sm text-gray-400 mt-2 ml-1">
                                            Min 8 characters with uppercase, lowercase, number & special character
                                        </p>
                                    </div>

                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={errors.confirmPassword}
                                        required
                                    />
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
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <Button
                                        type="submit"
                                        loading={loading}
                                        className="padding-10 w-full py-4 text-base font-bold tracking-wide shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300"
                                        size="lg"
                                    >
                                        Continue with Email Verification
                                    </Button>
                                </motion.div>
                            </form>

                            <div className="mt-10 pt-8 border-t border-gray-100">
                                <div className="padding-10 text-center space-y-4">
                                    <p className="text-gray-600 text-base">
                                        Already have an account?{' '}
                                        <Link 
                                            to="/login" 
                                            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                    <p className="padding-10 text-gray-600 text-base">
                                        Looking to hire?{' '}
                                        <Link 
                                            to="/register/employer" 
                                            className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                                        >
                                            Register as Employer
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* OTP Verification Step */}
                            <div className="text-center mb-8">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", delay: 0.1 }}
                                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg shadow-green-500/30"
                                >
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </motion.div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Verify your email
                                </h2>
                                <p className="text-gray-500">
                                    We've sent a 6-digit code to
                                </p>
                                <p className="text-indigo-600 font-semibold mt-1">
                                    {formData.emailId}
                                </p>
                            </div>

                            {/* OTP Timer */}
                            {otpExpiresIn > 0 && (
                                <div className="text-center mb-6">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Code expires in {formatTime(otpExpiresIn)}
                                    </span>
                                </div>
                            )}

                            {/* OTP Input */}
                            <div className="mb-6">
                                <OtpInput
                                    length={6}
                                    onComplete={handleVerifyOTP}
                                    onChangeOtp={setOtp}
                                    disabled={loading || otpVerified}
                                    error={otpError}
                                />
                            </div>

                            {/* Verify Button */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="mb-6"
                            >
                                <Button
                                    onClick={handleVerifyOTP}
                                    loading={loading}
                                    disabled={otp.length !== 6 || otpVerified}
                                    className="w-full py-4 text-base font-bold"
                                    size="lg"
                                >
                                    {otpVerified ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Verified! Creating account...
                                        </span>
                                    ) : (
                                        'Verify & Create Account'
                                    )}
                                </Button>
                            </motion.div>

                            {/* Resend OTP */}
                            <div className="text-center space-y-4">
                                <p className="text-gray-500">
                                    Didn't receive the code?{' '}
                                    {resendCooldown > 0 ? (
                                        <span className="text-gray-400">
                                            Resend in {resendCooldown}s
                                        </span>
                                    ) : (
                                        <button
                                            onClick={handleResendOTP}
                                            disabled={loading}
                                            className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                                        >
                                            Resend OTP
                                        </button>
                                    )}
                                </p>
                                
                                <button
                                    onClick={handleBackToForm}
                                    disabled={loading}
                                    className="text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Change email address
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    )
}

export default RegisterJobseeker
