import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

const OtpInput = ({ length = 6, onComplete, onChangeOtp, disabled = false, error = '' }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''))
    const inputRefs = useRef([])

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [])

    const handleChange = (element, index) => {
        const value = element.value
        
        // Only allow numbers
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.substring(value.length - 1)
        setOtp(newOtp)

        // Notify parent of change
        const otpString = newOtp.join('')
        if (onChangeOtp) {
            onChangeOtp(otpString)
        }

        // Move to next input if current has value
        if (value && index < length - 1) {
            inputRefs.current[index + 1].focus()
        }

        // Check if OTP is complete
        if (newOtp.every(digit => digit !== '') && onComplete) {
            onComplete(newOtp.join(''))
        }
    }

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus()
            }
        }
        // Handle left arrow
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus()
        }
        // Handle right arrow
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1].focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pasteData = e.clipboardData.getData('text').slice(0, length)
        
        if (!/^\d+$/.test(pasteData)) return

        const newOtp = [...otp]
        pasteData.split('').forEach((char, index) => {
            if (index < length) {
                newOtp[index] = char
            }
        })
        setOtp(newOtp)

        // Notify parent
        const otpString = newOtp.join('')
        if (onChangeOtp) {
            onChangeOtp(otpString)
        }

        // Focus last filled input or complete
        const lastFilledIndex = Math.min(pasteData.length - 1, length - 1)
        inputRefs.current[lastFilledIndex].focus()

        if (newOtp.every(digit => digit !== '') && onComplete) {
            onComplete(newOtp.join(''))
        }
    }

    const handleFocus = (e) => {
        e.target.select()
    }

    const reset = () => {
        setOtp(new Array(length).fill(''))
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }

    return (
        <div className="w-full">
            <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                    <motion.input
                        key={index}
                        ref={(ref) => (inputRefs.current[index] = ref)}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        onFocus={handleFocus}
                        disabled={disabled}
                        className={`
                            w-10 h-12 sm:w-12 sm:h-14 
                            text-center text-xl sm:text-2xl font-bold
                            border-2 rounded-xl
                            outline-none transition-all duration-200
                            ${error 
                                ? 'border-red-400 bg-red-50 text-red-600' 
                                : digit 
                                    ? 'border-primary bg-primary/5 text-primary' 
                                    : 'border-gray-200 bg-gray-50 text-gray-900'
                            }
                            ${disabled 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:border-primary/50 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10'
                            }
                        `}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                    />
                ))}
            </div>
            {error && (
                <motion.p 
                    className="text-red-500 text-sm text-center mt-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.p>
            )}
        </div>
    )
}

export default OtpInput
