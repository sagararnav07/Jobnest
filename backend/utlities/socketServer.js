const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const MessageController = require('./../Controllers/MessageController')

let io = null
const connectedUsers = new Map() // Map userId to socketId

const initializeSocket = (server) => {
    // Match CORS configuration with Express app.js
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean)

    io = new Server(server, {
        cors: {
            origin: function(origin, callback) {
                // Allow requests with no origin (mobile apps, curl, etc.)
                if (!origin) return callback(null, true)
                
                if (allowedOrigins.includes(origin)) {
                    callback(null, true)
                } else {
                    callback(new Error('Not allowed by CORS'))
                }
            },
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token
        if (!token) {
            return next(new Error('Authentication error: No token provided'))
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            socket.userId = decoded._id
            socket.userType = decoded.userType
            next()
        } catch (err) {
            return next(new Error('Authentication error: Invalid token'))
        }
    })

    io.on('connection', (socket) => {
        // Store user's socket connection
        connectedUsers.set(socket.userId, socket.id)

        // Join user to their own room for direct messages
        socket.join(socket.userId)

        // Handle sending messages
        socket.on('sendMessage', async (data) => {
            try {
                const { receiverId, message } = data
                
                // Save message to database
                const newMessage = await MessageController.sendMessage(
                    socket.userId,
                    receiverId,
                    message
                )

                // Emit to sender
                socket.emit('messageSent', {
                    success: true,
                    message: newMessage
                })

                // Emit to receiver if online
                const receiverSocketId = connectedUsers.get(receiverId)
                if (receiverSocketId) {
                    io.to(receiverId).emit('newMessage', {
                        message: newMessage,
                        senderId: socket.userId
                    })
                }
            } catch (error) {
                socket.emit('messageError', {
                    success: false,
                    error: error.message
                })
            }
        })

        // Handle typing indicator
        socket.on('typing', (data) => {
            const { receiverId } = data
            io.to(receiverId).emit('userTyping', {
                senderId: socket.userId
            })
        })

        // Handle stop typing
        socket.on('stopTyping', (data) => {
            const { receiverId } = data
            io.to(receiverId).emit('userStoppedTyping', {
                senderId: socket.userId
            })
        })

        // Handle marking messages as read
        socket.on('markAsRead', async (data) => {
            try {
                const { partnerId } = data
                await MessageController.markAsRead(socket.userId, partnerId)
                
                // Notify the sender that messages were read
                io.to(partnerId).emit('messagesRead', {
                    readBy: socket.userId
                })
            } catch (error) {
                console.error('Error marking messages as read:', error)
            }
        })

        // Handle user going online
        socket.on('goOnline', () => {
            // Broadcast to all connected users
            socket.broadcast.emit('userOnline', {
                userId: socket.userId
            })
        })

        // Handle disconnect
        socket.on('disconnect', () => {
            connectedUsers.delete(socket.userId)
            
            // Broadcast user offline status
            socket.broadcast.emit('userOffline', {
                userId: socket.userId
            })
        })
    })

    return io
}

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io
}

const getConnectedUsers = () => {
    return Array.from(connectedUsers.keys())
}

module.exports = {
    initializeSocket,
    getIO,
    getConnectedUsers
}
