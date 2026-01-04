import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './../../App.css'
const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md',
    showCloseButton = true,
    closeOnOutsideClick = true,
    closeOnEscape = true,
    footer,
    icon,
}) => {
    // Size configurations
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[90vw]',
    }

    // Handle escape key
    const handleEscape = useCallback((e) => {
        if (e.key === 'Escape' && closeOnEscape) {
            onClose()
        }
    }, [onClose, closeOnEscape])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow
            document.body.style.overflow = 'hidden'
            document.addEventListener('keydown', handleEscape)
            return () => {
                document.body.style.overflow = originalStyle
                document.removeEventListener('keydown', handleEscape)
            }
        }
    }, [isOpen, handleEscape])

    // Animation variants
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    }

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: 'spring', stiffness: 400, damping: 30 }
        },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop with blur */}
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={closeOnOutsideClick ? onClose : undefined}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal container */}
                    <div className="padding-10 flex min-h-full items-center justify-center p-4">
                        <motion.div
                            variants={modalVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className={`
                                padding-10 
                                relative w-full ${sizes[size]} 
                                bg-white rounded-2xl shadow-2xl
                                overflow-hidden
                            `}
                        >
                            {/* Header */}
                            {(title || showCloseButton) && (
                                <div className="flex items-start justify-between p-6 border-b border-slate-100">
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        {icon && (
                                            <div className="shrink-0 w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                {icon}
                                            </div>
                                        )}
                                        <div>
                                            {title && (
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {title}
                                                </h3>
                                            )}
                                            {description && (
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Close button */}
                                    {showCloseButton && (
                                        <motion.button
                                            onClick={onClose}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </motion.button>
                                    )}
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6">
                                {children}
                            </div>

                            {/* Footer */}
                            {footer && (
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                                    {footer}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}

// Confirmation Modal Preset
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger', // danger, warning, info
}) => {
    const variants = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        },
        warning: {
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
        },
        info: {
            iconBg: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            buttonClass: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        },
    }

    const config = variants[variant]

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
            showCloseButton={false}
        >
            <div className="text-center">
                <div className={`mx-auto w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}>
                    <svg className={`w-7 h-7 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${config.buttonClass}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

export default Modal
