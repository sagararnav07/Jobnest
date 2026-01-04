import { motion } from 'framer-motion'

const LoadingSpinner = ({ size = 'md', className = '', color = 'primary' }) => {
    const sizes = {
        xs: 'h-4 w-4',
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    }

    const colors = {
        primary: 'border-indigo-600',
        white: 'border-white',
        slate: 'border-slate-600',
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div 
                className={`
                    rounded-full border-2 border-slate-200
                    ${sizes[size]}
                `}
                style={{
                    borderTopColor: color === 'primary' ? '#635bff' : color === 'white' ? '#fff' : '#475569'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    )
}

// Premium Loading Page with logo
const LoadingPage = ({ message = 'Loading...' }) => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Logo animation */}
            <motion.div 
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/30"
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <span className="text-2xl font-black text-white">JN</span>
            </motion.div>
            
            {/* Animated dots */}
            <div className="flex items-center justify-center gap-1 mb-4">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-indigo-600"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                ))}
            </div>
            
            <p className="text-slate-500 font-medium">{message}</p>
        </motion.div>
    </div>
)

// Premium Loading Overlay with blur
const LoadingOverlay = ({ message = 'Loading...' }) => (
    <motion.div 
        className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.div 
            className="text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-slate-600 font-medium">{message}</p>
        </motion.div>
    </motion.div>
)

// Skeleton Loading Components
const Skeleton = ({ className = '', animate = true }) => (
    <div 
        className={`
            bg-slate-200 rounded-lg
            ${animate ? 'animate-pulse' : ''}
            ${className}
        `}
    />
)

const SkeletonText = ({ lines = 3, className = '' }) => (
    <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
                key={i} 
                className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
            />
        ))}
    </div>
)

const SkeletonCard = ({ className = '' }) => (
    <div className={`bg-white rounded-2xl border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
            <div className="flex-1">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
        <SkeletonText lines={2} />
    </div>
)

export { LoadingSpinner, LoadingPage, LoadingOverlay, Skeleton, SkeletonText, SkeletonCard }
export default LoadingSpinner
