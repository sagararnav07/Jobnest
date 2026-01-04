import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Button, Input, Toast, Captcha } from '../../components/ui'

const RegisterEmployer = () => {
    const navigate = useNavigate()
    const { register } = useAuth()
    const captchaRef = useRef(null)
    
    const [formData, setFormData] = useState({
        name: '',
        emailId: '',
        password: '',
        confirmPassword: '',
        userType: 'Employeer'
    })
    const [captchaToken, setCaptchaToken] = useState(null)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' })

    // Validation patterns
    const nameRegex = /^[A-Z][a-zA-Z]{2,}( [A-Z][a-zA-Z]{2,})*$/
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

    const validateField = (name, value) => {
        switch (name) {
            case 'name':
                if (!value) return 'Company name is required'
                if (!nameRegex.test(value)) return 'Company name must start with capital letter'
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
            const { confirmPassword, ...registerData } = formData
            await register({ ...registerData, captchaToken })
            setToast({
                show: true,
                message: 'Registration successful!',
                type: 'success'
            })
            navigate('/employer/profile')
        } catch (error) {
            setToast({
                show: true,
                message: error.response?.data?.message || 'Registration failed. Please try again.',
                type: 'error'
            })
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full"
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </motion.div>
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
                        Register your company
                    </h2>
                    <p className="text-gray-500 text-base font-medium">
                        Join as an employer and find the best talent
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        <Input
                            label="Company Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.name}
                            required
                        />

                        <Input
                            label="Business Email"
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
                            Create Employer Account
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
                            Looking for a job?{' '}
                            <Link 
                                to="/register/jobseeker" 
                                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                            >
                                Register as Job Seeker
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    )
}

export default RegisterEmployer
