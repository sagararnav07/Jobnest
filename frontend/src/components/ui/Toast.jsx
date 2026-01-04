import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

const Toast = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    duration = 4000,
    position = 'top-center',
    action,
    actionLabel = 'Undo',
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, duration, onClose])

    // Premium toast configurations
    const types = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200',
            text: 'text-emerald-800',
            iconBg: 'bg-emerald-100',
            icon: (
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            )
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-800',
            iconBg: 'bg-red-100',
            icon: (
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            )
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200',
            text: 'text-amber-800',
            iconBg: 'bg-amber-100',
            icon: (
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            )
        },
        info: {
            bg: 'bg-sky-50 border-sky-200',
            text: 'text-sky-800',
            iconBg: 'bg-sky-100',
            icon: (
                <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    }

    // Position configurations
    const positions = {
        'top-center': 'top-6 left-1/2 -translate-x-1/2',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
        'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
    }

    // Animation variants based on position
    const getAnimationVariants = () => {
        const isTop = position.includes('top')
        return {
            initial: { opacity: 0, y: isTop ? -20 : 20, scale: 0.95 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: isTop ? -20 : 20, scale: 0.95 }
        }
    }

    const { bg, text, iconBg, icon } = types[type]
    const variants = getAnimationVariants()

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={variants.initial}
                    animate={variants.animate}
                    exit={variants.exit}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`
                        fixed z-[100] ${positions[position]}
                        flex items-center gap-3 
                        px-4 py-3 rounded-xl 
                        border shadow-xl backdrop-blur-sm
                        max-w-md
                        ${bg}
                    `}
                >
                    {/* Icon */}
                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                        {icon}
                    </div>

                    {/* Message */}
                    <p className={`flex-1 text-sm font-medium ${text}`}>
                        {message}
                    </p>

                    {/* Action Button */}
                    {action && (
                        <button
                            onClick={() => {
                                action()
                                onClose()
                            }}
                            className={`shrink-0 text-sm font-semibold ${text} hover:opacity-80 transition-opacity`}
                        >
                            {actionLabel}
                        </button>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${text}`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Progress bar */}
                    {duration > 0 && (
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-20 rounded-full origin-left"
                            initial={{ scaleX: 1 }}
                            animate={{ scaleX: 0 }}
                            transition={{ duration: duration / 1000, ease: 'linear' }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default Toast
