import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'

const FileUpload = ({ 
    onFileSelect, 
    accept = {},
    maxSize = 5242880, // 5MB default
    label = 'Upload File',
    description = 'Drag and drop a file here, or click to select',
    currentFile = null,
    error = null,
    disabled = false,
    variant = 'default', // default, compact, avatar
}) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false)

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0])
        }
    }, [onFileSelect])

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple: false,
        disabled,
        onDragEnter: () => setIsDraggingOver(true),
        onDragLeave: () => setIsDraggingOver(false),
    })

    const rejectionError = fileRejections.length > 0 
        ? fileRejections[0].errors[0]?.message 
        : null

    // Get file type icon
    const getFileIcon = (file) => {
        const type = file?.type || ''
        if (type.includes('pdf')) return '📄'
        if (type.includes('image')) return '🖼️'
        if (type.includes('word') || type.includes('document')) return '📝'
        if (type.includes('spreadsheet') || type.includes('excel')) return '📊'
        return '📎'
    }

    // Format file size
    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    // Compact variant for inline uploads
    if (variant === 'compact') {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {label}
                    </label>
                )}
                <div
                    {...getRootProps()}
                    className={`
                        flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer
                        transition-all duration-200
                        ${isDragActive 
                            ? 'border-indigo-400 bg-indigo-50' 
                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                        }
                        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${error ? 'border-red-300 bg-red-50' : ''}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isDragActive ? 'bg-indigo-100' : 'bg-slate-100'
                    }`}>
                        {currentFile ? (
                            <span className="text-xl">{getFileIcon(currentFile)}</span>
                        ) : (
                            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        {currentFile ? (
                            <>
                                <p className="text-sm font-medium text-slate-900 truncate">
                                    {currentFile.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatSize(currentFile.size)}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500">
                                Click or drag to upload
                            </p>
                        )}
                    </div>
                    {currentFile && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                onFileSelect(null)
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        )
    }

    // Default variant
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    {label}
                </label>
            )}
            
            <motion.div
                whileHover={!disabled ? { scale: 1.01 } : {}}
                whileTap={!disabled ? { scale: 0.99 } : {}}
                {...getRootProps()}
                className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
                    transition-all duration-300 overflow-hidden
                    ${isDragActive 
                        ? 'border-indigo-400 bg-indigo-50 scale-[1.02]' 
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${(error || rejectionError) ? 'border-red-300 bg-red-50' : ''}
                `}
            >
                <input {...getInputProps()} />
                
                {/* Animated background gradient on drag */}
                <AnimatePresence>
                    {isDragActive && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-indigo-100/50 to-purple-100/50"
                        />
                    )}
                </AnimatePresence>

                <div className="relative z-10">
                    {currentFile ? (
                        <motion.div 
                            className="flex flex-col items-center gap-4"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-slate-900 mb-1">
                                    {currentFile.name || 'File selected'}
                                </p>
                                {currentFile.size && (
                                    <p className="text-xs text-slate-500">
                                        {formatSize(currentFile.size)}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onFileSelect(null)
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove file
                            </button>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <motion.div 
                                className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
                                    isDragActive ? 'bg-indigo-100' : 'bg-slate-100'
                                }`}
                                animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 1 }}
                            >
                                <svg className={`w-8 h-8 transition-colors ${isDragActive ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </motion.div>
                            <div className="text-center">
                                <p className={`text-sm font-semibold mb-1 ${isDragActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                                    {isDragActive ? 'Drop your file here' : description}
                                </p>
                                <p className="text-xs text-slate-400">
                                    Max size: {formatSize(maxSize)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
                {(error || rejectionError) && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-2 text-sm text-red-500 flex items-center gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error || rejectionError}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

export default FileUpload
