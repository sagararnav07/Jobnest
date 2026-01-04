import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '../../contexts/ChatContext'
import { useAuth } from '../../contexts/AuthContext'
import { Card, LoadingSpinner, Toast, Modal } from '../../components/ui'
import dayjs from '../../utils/dayjs'
import messageService from '../../api/messageService'

const Messages = () => {
    const { user } = useAuth()
    const {
        conversations,
        currentChat,
        messages,
        loading,
        isConnected,
        onlineUsers,
        openChat,
        closeChat,
        sendMessage,
        sendTyping,
        sendStopTyping,
        isUserOnline,
        clearChat,
        deleteAllConversations,
        loadConversations
    } = useChat()

    const [messageInput, setMessageInput] = useState('')
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showNewChat, setShowNewChat] = useState(false)
    const [connectableUsers, setConnectableUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
    const [deletingChat, setDeletingChat] = useState(null)
    const [deletingAll, setDeletingAll] = useState(false)
    const [isMobileViewChat, setIsMobileViewChat] = useState(false)

    const messagesEndRef = useRef(null)
    const messageInputRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // Focus input when chat opens
    useEffect(() => {
        if (currentChat && messageInputRef.current) {
            messageInputRef.current.focus()
        }
    }, [currentChat])

    // Handle mobile view
    useEffect(() => {
        if (currentChat) {
            setIsMobileViewChat(true)
        }
    }, [currentChat])

    // Load connectable users for new chat
    const loadConnectableUsers = async () => {
        try {
            setLoadingUsers(true)
            const response = await messageService.getConnectableUsers()
            setConnectableUsers(response.users || [])
        } catch (error) {
            setToast({ show: true, message: 'Failed to load users', type: 'error' })
        } finally {
            setLoadingUsers(false)
        }
    }

    // Handle typing indicator
    const handleTyping = useCallback(() => {
        sendTyping()
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping()
        }, 2000)
    }, [sendTyping, sendStopTyping])

    // Send message handler
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!messageInput.trim() || sending) return

        try {
            setSending(true)
            sendStopTyping()
            await sendMessage(messageInput.trim())
            setMessageInput('')
        } catch (error) {
            setToast({ show: true, message: 'Failed to send message', type: 'error' })
        } finally {
            setSending(false)
        }
    }

    // Start new chat
    const handleStartChat = (userInfo) => {
        openChat(userInfo._id, userInfo.name || userInfo.companyName, userInfo.type)
        setShowNewChat(false)
        setIsMobileViewChat(true)
    }

    // Clear chat handler
    const handleClearChat = async () => {
        if (!deletingChat) return
        try {
            await clearChat(deletingChat)
            setToast({ show: true, message: 'Chat cleared successfully', type: 'success' })
            setShowDeleteModal(false)
            setDeletingChat(null)
        } catch (error) {
            setToast({ show: true, message: 'Failed to clear chat', type: 'error' })
        }
    }

    // Delete all conversations
    const handleDeleteAll = async () => {
        try {
            setDeletingAll(true)
            await deleteAllConversations()
            setToast({ show: true, message: 'All conversations deleted', type: 'success' })
            setShowDeleteAllModal(false)
            handleBackToList()
        } catch (error) {
            setToast({ show: true, message: 'Failed to delete conversations', type: 'error' })
        } finally {
            setDeletingAll(false)
        }
    }

    // Back to conversations (mobile)
    const handleBackToList = () => {
        closeChat()
        setIsMobileViewChat(false)
    }

    // Filter conversations
    const filteredConversations = conversations.filter(conv => {
        const name = conv.partnerName || conv.companyName || ''
        return name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    // Format message time
    const formatMessageTime = (date) => {
        const msgDate = dayjs(date)
        const now = dayjs()
        
        if (msgDate.isSame(now, 'day')) {
            return msgDate.format('h:mm A')
        } else if (msgDate.isSame(now.subtract(1, 'day'), 'day')) {
            return 'Yesterday ' + msgDate.format('h:mm A')
        } else if (msgDate.isSame(now, 'week')) {
            return msgDate.format('ddd h:mm A')
        }
        return msgDate.format('MMM D, h:mm A')
    }

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    const messageVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0 }
    }

    return (
        <>
            <Toast 
                message={toast.message}
                type={toast.type}
                isVisible={toast.show}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setDeletingChat(null) }}
                title="Clear Chat"
            >
                <div className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <p className="text-gray-600 mb-6 text-center">
                        Are you sure you want to clear this chat? All messages will be permanently deleted.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => { setShowDeleteModal(false); setDeletingChat(null) }}
                            className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleClearChat}
                            className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear Chat
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete All Chats Modal */}
            <Modal
                isOpen={showDeleteAllModal}
                onClose={() => setShowDeleteAllModal(false)}
                title="Delete All Conversations"
            >
                <div className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete All Conversations?</h3>
                    <p className="text-gray-600 mb-6 text-center">
                        This will permanently delete all your conversations and messages. This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setShowDeleteAllModal(false)}
                            className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                            disabled={deletingAll}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteAll}
                            disabled={deletingAll}
                            className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {deletingAll ? (
                                <>
                                    <LoadingSpinner size="sm" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete All
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* New Chat Modal */}
            <Modal
                isOpen={showNewChat}
                onClose={() => setShowNewChat(false)}
                title="Start New Conversation"
            >
                <div className="p-6">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                        onChange={(e) => {
                            if (!connectableUsers.length) loadConnectableUsers()
                        }}
                        onFocus={() => {
                            if (!connectableUsers.length) loadConnectableUsers()
                        }}
                    />
                    
                    {loadingUsers ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="md" />
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {connectableUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="text-4xl block mb-2">👥</span>
                                    <p>No users available to chat</p>
                                </div>
                            ) : (
                                connectableUsers.map(userInfo => (
                                    <motion.button
                                        key={userInfo._id}
                                        onClick={() => handleStartChat(userInfo)}
                                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left"
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                                                {(userInfo.name || userInfo.companyName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            {isUserOnline(userInfo._id) && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">
                                                {userInfo.name || userInfo.companyName}
                                            </p>
                                            <p className="text-sm text-gray-500 capitalize">
                                                {userInfo.type}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </Modal>

            <motion.div 
                className="padding-10 h-[calc(100vh-180px)] flex flex-col"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="padding-10 mb-6">
                    <div className="padding-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="padding-10">
                            <h1 className="padding-10 text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <span className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                                    💬
                                </span>
                                Messages
                            </h1>
                            <p className="padding-10 text-gray-500 mt-1">
                                {isConnected ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        Connected in real-time
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full" />
                                        Connecting...
                                    </span>
                                )}
                            </p>
                        </div>
                        <motion.button
                            onClick={() => setShowNewChat(true)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-xl transition-all"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </motion.button>
                    </div>
                </motion.div>

                {/* Main Chat Area */}
                <motion.div 
                    variants={itemVariants}
                    className="flex-1 flex bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100"
                >
                    {/* Conversations Sidebar */}
                    <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${isMobileViewChat ? 'hidden md:flex' : 'flex'}`}>
                        {/* Search and Actions */}
                        <div className="p-4 border-b border-gray-100 space-y-3">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
                                />
                            </div>
                            {conversations.length > 0 && (
                                <button
                                    onClick={() => setShowDeleteAllModal(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete All Conversations
                                </button>
                            )}
                        </div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto">
                            {loading && conversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <LoadingSpinner size="md" />
                                    <p className="text-gray-500 text-sm">Loading conversations...</p>
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                                    <motion.div
                                        className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                    >
                                        <span className="text-4xl">💭</span>
                                    </motion.div>
                                    <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
                                    <p className="text-gray-500 text-sm mb-4">
                                        Start a new chat to connect with {user?.userType === 'Employer' ? 'candidates' : 'employers'}
                                    </p>
                                    <button
                                        onClick={() => setShowNewChat(true)}
                                        className="text-primary font-semibold hover:underline"
                                    >
                                        Start a conversation →
                                    </button>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {filteredConversations.map((conv, index) => (
                                        <motion.button
                                            key={conv.partnerId || conv.userId}
                                            onClick={() => {
                                                openChat(
                                                    conv.partnerId || conv.userId,
                                                    conv.partnerName || conv.companyName,
                                                    conv.partnerType || conv.type
                                                )
                                                setIsMobileViewChat(true)
                                            }}
                                            className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                                                currentChat?.partnerId === (conv.partnerId || conv.userId) 
                                                    ? 'bg-primary/5 border-l-4 border-l-primary' 
                                                    : ''
                                            }`}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            transition={{ delay: index * 0.05 }}
                                            whileHover={{ x: 3 }}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                    {(conv.partnerName || conv.companyName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                {isUserOnline(conv.partnerId || conv.userId) && (
                                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {conv.partnerName || conv.companyName}
                                                    </p>
                                                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                                        {conv.lastMessage?.createdAt && dayjs(conv.lastMessage.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-500 truncate max-w-[180px]">
                                                        {conv.lastMessage?.message || 'No messages yet'}
                                                    </p>
                                                    {conv.unreadCount > 0 && (
                                                        <span className="flex-shrink-0 ml-2 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium">
                                                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className={`flex-1 flex flex-col ${!isMobileViewChat ? 'hidden md:flex' : 'flex'}`}>
                        {!currentChat ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50/50">
                                <motion.div
                                    className="w-32 h-32 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-6"
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                >
                                    <span className="text-6xl">💬</span>
                                </motion.div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a conversation</h2>
                                <p className="text-gray-500 max-w-sm">
                                    Choose a conversation from the list or start a new chat to begin messaging
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Chat Header */}
                                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleBackToList}
                                            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                                                {(currentChat.partnerName || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            {isUserOnline(currentChat.partnerId) && (
                                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{currentChat.partnerName}</h3>
                                            <p className="text-sm text-gray-500">
                                                {currentChat.isTyping ? (
                                                    <span className="text-primary flex items-center gap-1">
                                                        <motion.span
                                                            animate={{ opacity: [1, 0.5, 1] }}
                                                            transition={{ repeat: Infinity, duration: 1 }}
                                                        >
                                                            typing...
                                                        </motion.span>
                                                    </span>
                                                ) : isUserOnline(currentChat.partnerId) ? (
                                                    <span className="text-green-500">Online</span>
                                                ) : (
                                                    <span>Offline</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setDeletingChat(currentChat.partnerId)
                                                setShowDeleteModal(true)
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Clear this chat"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <div className="dropdown dropdown-end">
                                            <button
                                                tabIndex={0}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="More options"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                                </svg>
                                            </button>
                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-white rounded-xl w-52 border border-gray-100">
                                                <li>
                                                    <button
                                                        onClick={() => {
                                                            setDeletingChat(currentChat.partnerId)
                                                            setShowDeleteModal(true)
                                                        }}
                                                        className="flex items-center gap-2 text-red-500 hover:bg-red-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Clear this chat
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => setShowDeleteAllModal(true)}
                                                        className="flex items-center gap-2 text-red-500 hover:bg-red-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                        Delete all chats
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                                    {loading ? (
                                        <div className="flex justify-center py-8">
                                            <LoadingSpinner size="md" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <motion.div
                                                className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                            >
                                                <span className="text-3xl">👋</span>
                                            </motion.div>
                                            <p className="text-gray-500">
                                                Start the conversation with {currentChat.partnerName}
                                            </p>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {messages.map((msg, index) => {
                                                const isOwn = msg.senderId === user?._id
                                                const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId
                                                
                                                return (
                                                    <motion.div
                                                        key={msg._id || index}
                                                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                                        variants={messageVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        transition={{ delay: 0.05 }}
                                                    >
                                                        <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                                                            {showAvatar && !isOwn && (
                                                                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                                    {(currentChat.partnerName || 'U').charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            {!showAvatar && !isOwn && <div className="w-8" />}
                                                            
                                                            <div
                                                                className={`group relative px-4 py-3 rounded-2xl ${
                                                                    isOwn
                                                                        ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-md'
                                                                        : 'bg-white border border-gray-100 text-gray-900 rounded-bl-md shadow-sm'
                                                                }`}
                                                            >
                                                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                                                <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                                                    <span>{formatMessageTime(msg.createdAt)}</span>
                                                                    {isOwn && (
                                                                        <span className="ml-1">
                                                                            {msg.read ? (
                                                                                <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M18 7l-8.5 8.5-4-4L4 13l5.5 5.5L20 8.5 18 7zm-2.5 0L7 15.5 5.5 14 4 15.5l3 3 10-10L15.5 7z" />
                                                                                </svg>
                                                                            ) : (
                                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                                                </svg>
                                                                            )}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </AnimatePresence>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 relative">
                                            <textarea
                                                ref={messageInputRef}
                                                value={messageInput}
                                                onChange={(e) => {
                                                    setMessageInput(e.target.value)
                                                    handleTyping()
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault()
                                                        handleSendMessage(e)
                                                    }
                                                }}
                                                placeholder="Type a message..."
                                                rows={1}
                                                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none max-h-32"
                                                style={{ minHeight: '48px' }}
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            disabled={!messageInput.trim() || sending}
                                            className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-primary to-secondary text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {sending ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            )}
                                        </motion.button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Press Enter to send, Shift + Enter for new line
                                    </p>
                                </form>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </>
    )
}

export default Messages
