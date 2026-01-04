import { motion } from 'framer-motion'
import './../../App.css'
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    type = 'button',
    className = 'padding-10',
    icon,
    iconPosition = 'left',
    fullWidth = false,
    onClick,
    ...props
}) => {
    // Premium button base styles with refined transitions
    const baseStyles = `
        inline-flex items-center justify-center font-semibold 
        rounded-xl transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        select-none
    `
    
    // Premium variants inspired by Stripe/Linear
    const variants = {
        primary: `
            bg-gradient-to-b from-[#635bff] to-[#5046e5] text-white
            shadow-lg shadow-indigo-500/25
            hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
            focus-visible:ring-indigo-500
        `,
        secondary: `
            bg-white text-slate-700 border border-slate-200
            shadow-sm
            hover:bg-slate-50 hover:border-slate-300 hover:shadow-md
            active:bg-slate-100
            focus-visible:ring-slate-500
        `,
        danger: `
            bg-gradient-to-b from-red-500 to-red-600 text-white
            shadow-lg shadow-red-500/25
            hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
            focus-visible:ring-red-500
        `,
        success: `
            bg-gradient-to-b from-emerald-500 to-emerald-600 text-white
            shadow-lg shadow-emerald-500/25
            hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
            focus-visible:ring-emerald-500
        `,
        ghost: `
            text-slate-600 bg-transparent
            hover:bg-slate-100 hover:text-slate-900
            focus-visible:ring-slate-500
        `,
        outline: `
            bg-transparent text-slate-700 border border-slate-300
            hover:bg-slate-50 hover:border-slate-400
            focus-visible:ring-slate-500
        `,
        'outline-primary': `
            bg-transparent text-[#635bff] border border-[#635bff]/30
            hover:bg-[#635bff]/5 hover:border-[#635bff]/50
            focus-visible:ring-[#635bff]
        `,
        'gradient': `
            bg-gradient-to-r from-[#635bff] via-purple-500 to-pink-500 text-white
            shadow-lg shadow-purple-500/25
            hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
            focus-visible:ring-purple-500
        `,
    }

    // Refined size scale
    const sizes = {
        xs: 'px-3 py-1.5 text-xs gap-1.5',
        sm: 'px-4 py-2 text-sm gap-2',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-6 py-3 text-base gap-2.5',
        xl: 'px-8 py-4 text-lg gap-3',
    }

    // Premium loading spinner
    const LoadingSpinner = () => (
        <svg 
            className="animate-spin h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24"
        >
            <circle 
                className="opacity-25" 
                cx="12" cy="12" r="10" 
                stroke="currentColor" 
                strokeWidth="3" 
            />
            <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
        </svg>
    )

    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.01 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
                padding-10
                ${baseStyles} 
                ${variants[variant]} 
                ${sizes[size]} 
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
            {...props}
        >
            {loading && (
                <span className="mr-2">
                    <LoadingSpinner />
                </span>
            )}
            {!loading && icon && iconPosition === 'left' && (
                <span className="shrink-0">{icon}</span>
            )}
            <span>{children}</span>
            {!loading && icon && iconPosition === 'right' && (
                <span className="shrink-0">{icon}</span>
            )}
        </motion.button>
    )
}

export default Button
