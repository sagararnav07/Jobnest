const express = require('express')
const router = express.Router()
const authMiddleware = require('./../middewares/AuthMiddleware')
const MessageController = require('./../Controllers/MessageController')

router.use(authMiddleware)

// Get all conversations
router.get('/conversations', async (req, res, next) => {
    try {
        const conversations = await MessageController.getConversations(req.userId)
        res.json({ conversations })
    } catch (error) {
        next(error)
    }
})

// Get conversation with specific user
router.get('/conversation/:partnerId', async (req, res, next) => {
    try {
        const messages = await MessageController.getConversation(
            req.userId,
            req.params.partnerId
        )
        res.json({ messages })
    } catch (error) {
        next(error)
    }
})

// Send a message
router.post('/send', async (req, res, next) => {
    try {
        const { receiverId, message } = req.body
        
        if (!receiverId) {
            let error = new Error('Receiver ID is required')
            error.status = 400
            throw error
        }
        
        const newMessage = await MessageController.sendMessage(
            req.userId,
            receiverId,
            message
        )
        res.status(201).json({ message: newMessage })
    } catch (error) {
        next(error)
    }
})

// Mark messages as read
router.put('/read/:partnerId', async (req, res, next) => {
    try {
        await MessageController.markAsRead(req.userId, req.params.partnerId)
        res.json({ message: 'Messages marked as read' })
    } catch (error) {
        next(error)
    }
})

// Get connectable users for networking
router.get('/users', async (req, res, next) => {
    try {
        const users = await MessageController.getConnectableUsers(
            req.userId,
            req.userType
        )
        res.json({ users })
    } catch (error) {
        next(error)
    }
})

// Clear chat with a specific user
router.delete('/conversation/:partnerId', async (req, res, next) => {
    try {
        const result = await MessageController.clearChat(
            req.userId,
            req.params.partnerId
        )
        res.json({ message: 'Chat cleared successfully', ...result })
    } catch (error) {
        next(error)
    }
})

// Delete all conversations
router.delete('/conversations/all', async (req, res, next) => {
    try {
        const result = await MessageController.deleteAllConversations(req.userId)
        res.json({ message: 'All conversations deleted successfully', ...result })
    } catch (error) {
        next(error)
    }
})

module.exports = router
