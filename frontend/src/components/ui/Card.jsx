import { motion } from 'framer-motion'
import './../../App.css'

const Card = ({
    children,
    className = '',
    hover = false,
    elevated = false,
    gradient = false,
    padding = 'md',
    onClick,
    ...props
}) => {
    const Component = onClick ? motion.button : motion.div

    // Premium padding scale
    const paddings = {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    }

    // Base card styles with refined aesthetics
    const baseStyles = `
        bg-white rounded-2xl border
        transition-all duration-300 ease-out
        ${paddings[padding]}
    `

    // Variant styles
    const elevatedStyles = elevated 
        ? 'shadow-xl border-transparent' 
        : 'shadow-sm border-slate-200/60'

    const hoverStyles = hover 
        ? 'hover:shadow-xl hover:border-slate-300/60 hover:-translate-y-1 cursor-pointer' 
        : ''

    const gradientStyles = gradient 
        ? 'bg-gradient-to-br from-white to-slate-50/50' 
        : ''

    return (
        <Component
            whileHover={hover ? { 
                y: -4, 
                transition: { type: "spring", stiffness: 400, damping: 17 }
            } : {}}
            whileTap={onClick ? { scale: 0.99 } : {}}
            onClick={onClick}
            className={`
                ${baseStyles}
                ${elevatedStyles}
                ${hoverStyles}
                ${gradientStyles}
                ${onClick ? 'text-left w-full' : ''}
                ${className}
            `}
            {...props}
        >
            {children}
        </Component>
    )
}

// Card Header with refined typography
const CardHeader = ({ children, className = '', border = false }) => (
    <div className={`
        ${border ? 'pb-4 mb-4 border-b border-slate-100' : 'mb-4'}
        ${className}
    `}>
        {children}
    </div>
)

// Card Title with premium styling
const CardTitle = ({ children, className = '', size = 'md' }) => {
    const sizes = {
        sm: 'text-base font-semibold text-slate-900',
        md: 'text-lg font-semibold text-slate-900 tracking-tight',
        lg: 'text-xl font-bold text-slate-900 tracking-tight',
    }
    
    return (
        <h3 className={`${sizes[size]} ${className}`}>
            {children}
        </h3>
    )
}

// Card Description with subtle styling
const CardDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-slate-500 mt-1.5 leading-relaxed ${className}`}>
        {children}
    </p>
)

// Card Content wrapper
const CardContent = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
)

// Card Footer with refined border
const CardFooter = ({ children, className = '', border = true }) => (
    <div className={`
        ${border ? 'mt-6 pt-4 border-t border-slate-100' : 'mt-4'}
        ${className}
    `}>
        {children}
    </div>
)

// Card Image header for visual cards
const CardImage = ({ src, alt, className = '', overlay = false }) => (
    <div className={`-mx-6 -mt-6 mb-6 overflow-hidden rounded-t-2xl relative ${className}`}>
        <img 
            src={src} 
            alt={alt}
            className="w-full h-48 object-cover"
        />
        {overlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
        )}
    </div>
)

// Card Badge for status indicators
const CardBadge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: 'bg-slate-100 text-slate-600',
        primary: 'bg-indigo-50 text-indigo-600',
        success: 'bg-emerald-50 text-emerald-600',
        warning: 'bg-amber-50 text-amber-600',
        danger: 'bg-red-50 text-red-600',
    }

    return (
        <span className={`
            inline-flex items-center px-2.5 py-1 
            rounded-full text-xs font-semibold
            ${variants[variant]}
            ${className}
        `}>
            {children}
        </span>
    )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter
Card.Image = CardImage
Card.Badge = CardBadge

export default Card
