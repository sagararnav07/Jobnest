const dbModel = require('./../utlities/connection')

const MessageController = {}

// Send a message
MessageController.sendMessage = async (senderId, receiverId, message) => {
    try {
        const messageCollection = await dbModel.getMessageCollection()
        
        if (!message || message.trim() === '') {
            let error = new Error('Message cannot be empty')
            error.status = 400
            throw error
        }

        const newMessage = await messageCollection.create({
            senderId: senderId,
            receiverId: receiverId,
            message: message.trim(),
            createdAt: new Date(),
            read: false
        })

        return newMessage
    } catch (error) {
        throw error
    }
}

// Get conversation between two users
MessageController.getConversation = async (userId1, userId2) => {
    try {
        const messageCollection = await dbModel.getMessageCollection()

        const messages = await messageCollection.find({
            $or: [
                { senderId: userId1, receiverId: userId2 },
                { senderId: userId2, receiverId: userId1 }
            ]
        }).sort({ createdAt: 1 })

        return messages
    } catch (error) {
        throw error
    }
}

// Get all conversations for a user
MessageController.getConversations = async (userId) => {
    try {
        const messageCollection = await dbModel.getMessageCollection()
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()
        const employeerCollection = await dbModel.getEmployeerCollection()

        // Get all messages involving this user
        const messages = await messageCollection.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ createdAt: -1 })

        // Extract unique conversation partners
        const partnerIds = new Set()
        messages.forEach(msg => {
            if (msg.senderId !== userId) partnerIds.add(msg.senderId)
            if (msg.receiverId !== userId) partnerIds.add(msg.receiverId)
        })

        // Get partner details and last message
        const conversations = await Promise.all(
            Array.from(partnerIds).map(async (partnerId) => {
                // Try to find in jobseekers first, then employers
                let partner = await jobSeekerCollection.findOne({ _id: partnerId })
                let partnerType = 'Jobseeker'
                
                if (!partner) {
                    partner = await employeerCollection.findOne({ _id: partnerId })
                    partnerType = 'Employeer'
                }

                // Get last message
                const lastMessage = messages.find(
                    msg => msg.senderId === partnerId || msg.receiverId === partnerId
                )

                // Count unread messages
                const unreadCount = await messageCollection.countDocuments({
                    senderId: partnerId,
                    receiverId: userId,
                    read: false
                })

                return {
                    partnerId: partnerId,
                    partnerName: partner ? partner.name : 'Unknown User',
                    partnerType: partnerType,
                    lastMessage: lastMessage ? lastMessage.message : '',
                    lastMessageAt: lastMessage ? lastMessage.createdAt : null,
                    unreadCount: unreadCount
                }
            })
        )

        // Sort by last message time
        conversations.sort((a, b) => 
            new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
        )

        return conversations
    } catch (error) {
        throw error
    }
}

// Mark messages as read
MessageController.markAsRead = async (userId, partnerId) => {
    try {
        const messageCollection = await dbModel.getMessageCollection()

        await messageCollection.updateMany(
            { senderId: partnerId, receiverId: userId, read: false },
            { $set: { read: true } }
        )

        return { success: true }
    } catch (error) {
        throw error
    }
}

// Get connectable users (for networking)
MessageController.getConnectableUsers = async (userId, userType) => {
    try {
        const jobSeekerCollection = await dbModel.getJobSeekerCollection()
        const employeerCollection = await dbModel.getEmployeerCollection()

        let users = []

        if (userType === 'Jobseeker') {
            // Jobseekers can connect with employers
            users = await employeerCollection.find(
                { _id: { $ne: userId } },
                { name: 1, emailId: 1, industry: 1, description: 1 }
            )
        } else {
            // Employers can connect with jobseekers who completed assessment
            users = await jobSeekerCollection.find(
                { _id: { $ne: userId }, test: true },
                { name: 1, emailId: 1, skills: 1, jobPreference: 1, experience: 1 }
            )
        }

        return users
    } catch (error) {
        throw error
    }
}

// Clear chat with a specific user (delete conversation)
MessageController.clearChat = async (userId, partnerId) => {
    try {
        const messageCollection = await dbModel.getMessageCollection()

        const result = await messageCollection.deleteMany({
            $or: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId }
            ]
        })

        return { deletedCount: result.deletedCount }
    } catch (error) {
        throw error
    }
}

// Delete all conversations for a user
MessageController.deleteAllConversations = async (userId) => {
    try {
        const messageCollection = await dbModel.getMessageCollection()

        const result = await messageCollection.deleteMany({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        })

        return { deletedCount: result.deletedCount }
    } catch (error) {
        throw error
    }
}

module.exports = MessageController
