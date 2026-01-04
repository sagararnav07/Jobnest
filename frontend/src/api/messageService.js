import api from './axios'

const messageService = {
    // Get all conversations
    getConversations: async () => {
        const response = await api.get('/messages/conversations')
        return response.data
    },

    // Get messages with a specific user
    getConversation: async (partnerId) => {
        const response = await api.get(`/messages/conversation/${partnerId}`)
        return response.data
    },

    // Send a message
    sendMessage: async (receiverId, message) => {
        const response = await api.post('/messages/send', { receiverId, message })
        return response.data
    },

    // Mark messages as read
    markAsRead: async (partnerId) => {
        const response = await api.put(`/messages/read/${partnerId}`)
        return response.data
    },

    // Get connectable users for networking
    getConnectableUsers: async () => {
        const response = await api.get('/messages/users')
        return response.data
    },

    // Get user connections (alias for getConnectableUsers)
    getConnections: async () => {
        const response = await api.get('/messages/users')
        return { connections: response.data.users || [] }
    },

    // Send connection request (starts a conversation)
    sendConnectionRequest: async (userId, message = 'Hello, I\'d like to connect!') => {
        const response = await api.post('/messages/send', { receiverId: userId, message })
        return response.data
    },

    // Clear chat with a specific user
    clearChat: async (partnerId) => {
        const response = await api.delete(`/messages/conversation/${partnerId}`)
        return response.data
    },

    // Delete all conversations
    deleteAllConversations: async () => {
        const response = await api.delete('/messages/conversations/all')
        return response.data
    }
}

export default messageService
