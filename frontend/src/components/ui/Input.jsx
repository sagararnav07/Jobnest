import { useState } from 'react'
import './../../App.css'
const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    onBlur,
    placeholder,
    error,
    required,
    disabled,
    className = '',
    icon,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const isPassword = type === 'password'

    const getIcon = () => {
        if (icon) return icon
        if (type === 'email') return (<></>
            // <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            // </svg>
        )
        if (isPassword) return ( <></>
            // <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            // </svg>
        )
        if (name === 'name' || label?.toLowerCase().includes('name')) return ( <></>
            // <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            // </svg>
        )
        return null
    }

    const inputIcon = getIcon()

    return (
        <div className="w-full">
            {label && (
                <label 
                    htmlFor={name} 
                    className={`
                        block text-sm font-semibold mb-3 tracking-wide transition-colors duration-200
                        ${isFocused ? 'text-indigo-600' : 'text-gray-700'}
                        ${error ? 'text-red-500' : ''}
                    `}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className={`
                relative group
                ${isFocused ? 'transform scale-[1.01]' : ''}
                transition-transform duration-200
            `}>
                {/* Gradient border effect on focus */}
                <div className={`
                    absolute -inset-0.5 rounded-2xl opacity-0 blur-sm transition-opacity duration-300
                    bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500
                    ${isFocused && !error ? 'opacity-30' : ''}
                    ${error ? 'opacity-30 !bg-gradient-to-r !from-red-500 !to-red-400' : ''}
                `} />
                
                <div className="relative">
                    {/* {inputIcon && (
                        <div className={`
                            absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200
                            ${isFocused ? 'text-indigo-500' : 'text-gray-400'}
                            ${error ? 'text-red-400' : ''}
                        `}>
                            {inputIcon}
                        </div>
                    )} */}
                    
                    <input
                        id={name}
                        type={isPassword ? (showPassword ? 'text' : 'password') : type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={(e) => {
                            setIsFocused(false)
                            onBlur?.(e)
                        }}
                        onFocus={() => setIsFocused(true)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`
                            padding-10
                            w-full
                            ${inputIcon ? 'pl-12' : 'pl-5'} 
                            ${isPassword ? 'pr-14' : 'pr-5'}
                            py-4 h-auto min-h-[3.5rem]
                            text-base text-gray-800 font-medium
                            bg-white
                            border-2 border-gray-200
                            rounded-xl
                            placeholder:text-gray-400 placeholder:font-normal
                            transition-all duration-300 ease-out
                            focus:outline-none focus:border-indigo-500 focus:bg-white 
                            focus:shadow-xl focus:shadow-indigo-500/10
                            hover:border-gray-300 hover:shadow-md
                            disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 disabled:opacity-60
                            ${error ? 'border-red-400 bg-red-50 focus:border-red-500 focus:shadow-red-500/10' : ''}
                            ${className}
                        `}
                        {...props}
                    />
                    
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className={`
                                absolute right-4 top-1/2 -translate-y-1/2 
                                p-1.5 rounded-lg
                                transition-all duration-200
                                hover:bg-gray-100 active:scale-95
                                ${isFocused ? 'text-indigo-500' : 'text-gray-400'}
                            `}
                        >
                            {showPassword ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
            
            {error && (
                <div className="mt-2.5 flex items-center gap-2 text-red-500 animate-pulse">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}
        </div>
    )
}

export default Input
