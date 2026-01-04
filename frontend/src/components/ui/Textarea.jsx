import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './../../App.css'
const Textarea = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    rows = 4,
    error,
    required = false,
    disabled = false,
    className = '',
    maxLength,
    showCount = false,
    resize = 'none',
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const charCount = value?.length || 0

    // Resize options
    const resizeClasses = {
        none: 'resize-none',
        vertical: 'resize-y',
        horizontal: 'resize-x',
        both: 'resize',
    }

    // Base textarea styles - Premium Stripe-inspired design
    const baseTextareaStyles = `
        w-full px-4 py-3 rounded-xl border bg-white
        transition-all duration-200 ease-out
        placeholder:text-slate-400
        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
        ${resizeClasses[resize]}
        text-sm leading-relaxed
    `

    // State-based border and focus styles
    const stateStyles = error 
        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : isFocused
        ? 'border-[#635bff] ring-4 ring-[#635bff]/10'
        : 'border-slate-200 hover:border-slate-300'

    // Focus handler
    const handleFocus = (e) => {
        setIsFocused(true)
        onFocus?.(e)
    }

    // Blur handler
    const handleBlur = (e) => {
        setIsFocused(false)
        onBlur?.(e)
    }

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label 
                    htmlFor={name} 
                    className="block text-sm font-medium text-slate-700 mb-2"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <textarea
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    rows={rows}
                    disabled={disabled}
                    required={required}
                    maxLength={maxLength}
                    className={`
                        padding-10
                        ${baseTextareaStyles}
                        ${stateStyles}
                        focus:outline-none
                    `}
                    {...props}
                />

                {/* Focus indicator line */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#635bff] rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused && !error ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            {/* Footer with error and character count */}
            <div className="flex items-start justify-between mt-2">
                {/* Error Message */}
                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="text-sm text-red-500 flex items-center gap-1.5"
                        >
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </motion.p>
                    ) : (
                        <span></span>
                    )}
                </AnimatePresence>

                {/* Character Count */}
                {(showCount || maxLength) && (
                    <span className={`text-xs ${charCount >= (maxLength || Infinity) ? 'text-red-500' : 'text-slate-400'}`}>
                        {charCount}{maxLength ? `/${maxLength}` : ''}
                    </span>
                )}
            </div>
        </div>
    )
}

export default Textarea
