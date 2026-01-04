import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './../../App.css'

const Select = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    options = [],
    placeholder = 'Select an option',
    error,
    required = false,
    disabled = false,
    className = '',
    size = 'md',
    icon,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false)

    // Size variants
    const sizes = {
        sm: 'px-3 py-2 text-sm pr-10',
        md: 'px-4 py-3 text-sm pr-11',
        lg: 'px-5 py-4 text-base pr-12',
    }

    // Base select styles - Premium Stripe-inspired design
    const baseSelectStyles = `
        w-full rounded-xl border bg-white
        transition-all duration-200 ease-out appearance-none
        cursor-pointer
        disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
        ${sizes[size]}
        ${icon ? 'pl-11' : ''}
    `

    // State-based border and focus styles
    const stateStyles = error 
        ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
        : isFocused
        ? 'border-[#635bff] ring-4 ring-[#635bff]/10'
        : 'border-slate-200 hover:border-slate-300'

    // Custom chevron icon
    const ChevronIcon = () => (
        <svg 
            className={`w-5 h-5 transition-transform duration-200 ${isFocused ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    )

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
                {/* Left Icon */}
                {icon && (
                    <div className={`
                        absolute left-3.5 top-1/2 -translate-y-1/2 
                        pointer-events-none transition-colors duration-200
                        ${isFocused ? 'text-[#635bff]' : 'text-slate-400'}
                    `}>
                        {icon}
                    </div>
                )}

                {/* Select Field */}
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        setIsFocused(false)
                        onBlur?.(e)
                    }}
                    disabled={disabled}
                    required={required}
                    className={`
                        padding-15
                        ${baseSelectStyles}
                        ${stateStyles}
                        focus:outline-none
                        ${!value ? 'text-slate-400' : 'text-slate-900'}
                    `}
                    {...props}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Custom Dropdown Arrow */}
                <div className={`
                    absolute right-3.5 top-1/2 -translate-y-1/2 
                    pointer-events-none transition-colors duration-200
                    ${isFocused ? 'text-[#635bff]' : 'text-slate-400'}
                `}>
                    <ChevronIcon />
                </div>

                {/* Focus indicator line */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#635bff] rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isFocused && !error ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                />
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-2 text-sm text-red-500 flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Select
