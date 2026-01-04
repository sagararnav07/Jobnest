import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import messageService from '../api/messageService'

const ChatContext = createContext(null)

export const useChat = () => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider')
    }
    return context
}

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth()
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [conversations, setConversations] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [onlineUsers, setOnlineUsers] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const socketRef = useRef(null)
    const currentChatRef = useRef(null)
    const processedMessageIds = useRef(new Set()) // Track processed messages to prevent duplicates
    const socketInitialized = useRef(false) // Prevent double initialization in StrictMode
    const userRef = useRef(null) // Keep track of current user
    
    // Keep refs in sync with state
    useEffect(() => {
        currentChatRef.current = currentChat
    }, [currentChat])
    
    useEffect(() => {
        userRef.current = user
    }, [user])
    
    // Update conversation with new message without full reload
    const updateConversationWithMessage = useCallback((partnerId, message) => {
        setConversations(prev => {
            const existingIndex = prev.findIndex(c => 
                c.partnerId === partnerId || c.userId === partnerId
            )
            
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    lastMessage: message,
                    lastMessageAt: message.createdAt
                }
                // Move to top
                const [conversation] = updated.splice(existingIndex, 1)
                return [conversation, ...updated]
            }
            return prev
        })
    }, [])

    // Initialize socket connection
    useEffect(() => {
        if (isAuthenticated && user && !socketInitialized.current) {
            // Prevent double initialization in React StrictMode
            socketInitialized.current = true
            
            const token = localStorage.getItem('token')
            const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'
            
            // Close any existing socket before creating new one
            if (socketRef.current) {
                socketRef.current.close()
                socketRef.current = null
            }
            
            const newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            })

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id)
                setIsConnected(true)
                newSocket.emit('goOnline')
            })

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected')
                setIsConnected(false)
            })

            newSocket.on('newMessage', (data) => {
                const messageId = data.message?._id
                const senderId = data.senderId
                const currentUser = userRef.current
                
                // Ignore messages sent by self (we handle those in messageSent)
                if (!currentUser || senderId === currentUser._id) {
                    return
                }
                
                // Prevent duplicate processing
                if (!messageId || processedMessageIds.current.has(messageId)) {
                    return
                }
                processedMessageIds.current.add(messageId)
                
                const chat = currentChatRef.current
                if (chat && senderId === chat.partnerId) {
                    // Add new message to current chat
                    setMessages(prev => {
                        if (prev.some(msg => msg._id === messageId)) {
                            return prev
                        }
                        return [...prev, data.message]
                    })
                } else {
                    // Update unread count for other conversations
                    setUnreadCount(prev => prev + 1)
                }
                
                // Update conversation list without full reload
                updateConversationWithMessage(senderId, data.message)
            })

            newSocket.on('messageSent', (data) => {
                if (data.success && data.message) {
                    const messageId = data.message._id
                    
                    // Prevent duplicate processing
                    if (!messageId || processedMessageIds.current.has(messageId)) {
                        return
                    }
                    processedMessageIds.current.add(messageId)
                    
                    // Add message to state
                    setMessages(prev => {
                        if (prev.some(msg => msg._id === messageId)) {
                            return prev
                        }
                        return [...prev, data.message]
                    })
                    
                    // Update conversation list
                    const chat = currentChatRef.current
                    if (chat) {
                        updateConversationWithMessage(chat.partnerId, data.message)
                    }
                }
            })

            newSocket.on('messagesRead', (data) => {
                const currentUser = userRef.current
                if (!currentUser) return
                
                setMessages(prev => 
                    prev.map(msg => 
                        msg.senderId === currentUser._id ? { ...msg, read: true } : msg
                    )
                )
            })

            newSocket.on('userOnline', (data) => {
                setOnlineUsers(prev => {
                    if (!prev.includes(data.userId)) {
                        return [...prev, data.userId]
                    }
                    return prev
                })
            })

            newSocket.on('userOffline', (data) => {
                setOnlineUsers(prev => prev.filter(id => id !== data.userId))
            })

            newSocket.on('userTyping', (data) => {
                const chat = currentChatRef.current
                if (chat && data.senderId === chat.partnerId) {
                    setCurrentChat(prev => prev ? { ...prev, isTyping: true } : prev)
                }
            })

            newSocket.on('userStoppedTyping', (data) => {
                const chat = currentChatRef.current
                if (chat && data.senderId === chat.partnerId) {
                    setCurrentChat(prev => prev ? { ...prev, isTyping: false } : prev)
                }
            })

            socketRef.current = newSocket
            setSocket(newSocket)

            return () => {
                console.log('Cleaning up socket connection')
                newSocket.close()
                socketRef.current = null
                socketInitialized.current = false
                processedMessageIds.current.clear()
            }
        }
        
        // Cleanup when user logs out
        if (!isAuthenticated && socketRef.current) {
            socketRef.current.close()
            socketRef.current = null
            socketInitialized.current = false
            processedMessageIds.current.clear()
        }
    }, [isAuthenticated, user, updateConversationWithMessage])

    // Load conversations on mount
    useEffect(() => {
        if (isAuthenticated) {
            loadConversations()
        }
    }, [isAuthenticated])

    // Calculate unread count when conversations change
    useEffect(() => {
        calculateUnreadCount()
    }, [conversations])

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true)
            const response = await messageService.getConversations()
            setConversations(response.conversations || [])
        } catch (err) {
            console.error('Failed to load conversations:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    const calculateUnreadCount = useCallback(() => {
        const count = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)
        setUnreadCount(count)
    }, [conversations])

    const openChat = useCallback(async (partnerId, partnerName, partnerType) => {
        try {
            setLoading(true)
            setCurrentChat({ partnerId, partnerName, partnerType, isTyping: false })
            
            // Clear processed message IDs when opening a new chat
            processedMessageIds.current.clear()
            
            const response = await messageService.getConversation(partnerId)
            const fetchedMessages = response.messages || []
            
            // Populate processedMessageIds with existing message IDs to prevent duplicates
            fetchedMessages.forEach(msg => {
                if (msg._id) {
                    processedMessageIds.current.add(msg._id)
                }
            })
            
            setMessages(fetchedMessages)
            
            // Mark messages as read
            await messageService.markAsRead(partnerId)
            if (socketRef.current) {
                socketRef.current.emit('markAsRead', { partnerId })
            }
            
            // Update conversations to clear unread
            loadConversations()
        } catch (err) {
            console.error('Failed to open chat:', err)
        } finally {
            setLoading(false)
        }
    }, [loadConversations])

    const closeChat = useCallback(() => {
        setCurrentChat(null)
        setMessages([])
        // Clear processed message IDs when closing chat
        processedMessageIds.current.clear()
    }, [])

    const sendMessage = useCallback(async (message) => {
        if (!currentChat || !message.trim()) return

        try {
            if (socketRef.current && isConnected) {
                socketRef.current.emit('sendMessage', {
                    receiverId: currentChat.partnerId,
                    message: message.trim()
                })
            } else {
                // Fallback to REST API
                await messageService.sendMessage(currentChat.partnerId, message.trim())
                // Reload messages
                const response = await messageService.getConversation(currentChat.partnerId)
                setMessages(response.messages || [])
            }
        } catch (err) {
            console.error('Failed to send message:', err)
            throw err
        }
    }, [currentChat, isConnected])

    const sendTyping = useCallback(() => {
        if (socketRef.current && currentChat) {
            socketRef.current.emit('typing', { receiverId: currentChat.partnerId })
        }
    }, [currentChat])

    const sendStopTyping = useCallback(() => {
        if (socketRef.current && currentChat) {
            socketRef.current.emit('stopTyping', { receiverId: currentChat.partnerId })
        }
    }, [currentChat])

    const isUserOnline = useCallback((userId) => {
        return onlineUsers.includes(userId)
    }, [onlineUsers])

    const clearChat = useCallback(async (partnerId) => {
        try {
            await messageService.clearChat(partnerId)
            // If clearing the current chat, clear messages
            if (currentChatRef.current?.partnerId === partnerId) {
                setMessages([])
            }
            // Reload conversations
            loadConversations()
            return { success: true }
        } catch (err) {
            console.error('Failed to clear chat:', err)
            throw err
        }
    }, [loadConversations])

    const deleteAllConversations = useCallback(async () => {
        try {
            await messageService.deleteAllConversations()
            // Clear all local state
            setMessages([])
            setConversations([])
            setCurrentChat(null)
            currentChatRef.current = null
            return { success: true }
        } catch (err) {
            console.error('Failed to delete all conversations:', err)
            throw err
        }
    }, [])

    const value = {
        socket,
        isConnected,
        conversations,
        currentChat,
        messages,
        onlineUsers,
        unreadCount,
        loading,
        loadConversations,
        openChat,
        closeChat,
        sendMessage,
        sendTyping,
        sendStopTyping,
        isUserOnline,
        clearChat,
        deleteAllConversations
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}

export default ChatContext
