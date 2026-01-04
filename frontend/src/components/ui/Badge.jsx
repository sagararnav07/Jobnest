import { motion } from 'framer-motion'

const Badge = ({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    pulse = false,
    icon,
    className = ''
}) => {
    // Premium variant styles - refined color palette
    const variants = {
        default: 'bg-slate-100 text-slate-700',
        primary: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
        secondary: 'bg-purple-50 text-purple-700 border border-purple-100',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        danger: 'bg-red-50 text-red-700 border border-red-100',
        info: 'bg-sky-50 text-sky-700 border border-sky-100',
        // Gradient variants for premium feel
        'gradient-primary': 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
        'gradient-success': 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
        'outline': 'bg-transparent text-slate-600 border border-slate-300',
        'outline-primary': 'bg-transparent text-indigo-600 border border-indigo-300',
    }

    // Dot colors matching variants
    const dotColors = {
        default: 'bg-slate-400',
        primary: 'bg-indigo-500',
        secondary: 'bg-purple-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-sky-500',
    }

    // Size variants
    const sizes = {
        xs: 'px-1.5 py-0.5 text-[10px] gap-1',
        sm: 'px-2 py-0.5 text-xs gap-1',
        md: 'px-2.5 py-1 text-xs gap-1.5',
        lg: 'px-3 py-1.5 text-sm gap-2',
    }

    return (
        <motion.span 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                inline-flex items-center font-semibold rounded-full
                ${variants[variant]}
                ${sizes[size]}
                ${className}
            `}
        >
            {/* Status Dot */}
            {dot && (
                <span className="relative flex h-2 w-2">
                    {pulse && (
                        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${dotColors[variant] || dotColors.default}`} />
                    )}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant] || dotColors.default}`} />
                </span>
            )}
            
            {/* Icon */}
            {icon && <span className="shrink-0">{icon}</span>}
            
            {/* Content */}
            {children}
        </motion.span>
    )
}

// Notification Badge (for overlaying on icons)
export const NotificationBadge = ({ count, max = 99, className = '' }) => {
    if (!count || count <= 0) return null
    
    const displayCount = count > max ? `${max}+` : count

    return (
        <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
                absolute -top-1 -right-1 
                min-w-[18px] h-[18px] px-1
                flex items-center justify-center
                text-[10px] font-bold text-white
                bg-gradient-to-r from-red-500 to-pink-500
                rounded-full shadow-lg
                ${className}
            `}
        >
            {displayCount}
        </motion.span>
    )
}

// Status Badge with specific status indicators
export const StatusBadge = ({ status, className = '' }) => {
    const statusConfig = {
        active: { variant: 'success', label: 'Active', dot: true, pulse: true },
        pending: { variant: 'warning', label: 'Pending', dot: true },
        inactive: { variant: 'default', label: 'Inactive', dot: true },
        error: { variant: 'danger', label: 'Error', dot: true },
        applied: { variant: 'info', label: 'Applied', dot: true },
        reviewing: { variant: 'warning', label: 'Reviewing', dot: true },
        interview: { variant: 'primary', label: 'Interview', dot: true },
        hired: { variant: 'success', label: 'Hired', dot: true },
        rejected: { variant: 'danger', label: 'Rejected', dot: true },
    }

    const config = statusConfig[status?.toLowerCase()] || { variant: 'default', label: status }

    return (
        <Badge 
            variant={config.variant} 
            dot={config.dot} 
            pulse={config.pulse}
            className={className}
        >
            {config.label}
        </Badge>
    )
}

export default Badge
