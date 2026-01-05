const express = require('express');
const http = require('http');
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path');
const dotenv = require('dotenv');
const { clerkMiddleware } = require('@clerk/express');
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Log Clerk keys status (don't log actual keys in production)
console.log('Clerk Configuration Status:');
console.log('- CLERK_PUBLISHABLE_KEY:', process.env.CLERK_PUBLISHABLE_KEY ? 'SET (' + process.env.CLERK_PUBLISHABLE_KEY.substring(0, 10) + '...)' : 'NOT SET');
console.log('- CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'SET' : 'NOT SET');

const create = require('./utlities/dbsetup')
const app = express();
const server = http.createServer(app);
const { initializeSocket } = require('./utlities/socketServer');
const requestLogger = require('./utlities/requestLogger');
const errorLogger = require('./utlities/errorLogger')
const router = require('./Routes/Users')
const quizRouter = require('./Routes/Quiz')
const employeerRouter = require('./Routes/Employers')
const jobSeekerRouter = require('./Routes/JobSeekers')
const jobRouter = require('./Routes/Jobs')
const applicationRouter = require('./Routes/Applications')
const messageRouter = require('./Routes/Messages')
const clerkAuthRouter = require('./Routes/ClerkAuth')

// Initialize Socket.io
initializeSocket(server);

// CORS configuration - allow multiple localhost ports for development and production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'https://frontend-iota-sable-56.vercel.app',
    'https://jobnest-main.vercel.app',
    'https://jobnest-main-arnav-sagars-projects.vercel.app'
]

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true)

        // Check if origin is in allowed list or matches FRONTEND_URL env var
        // Also allow any vercel.app subdomain for preview deployments
        if (allowedOrigins.includes(origin) ||
            process.env.FRONTEND_URL === origin ||
            origin?.endsWith('.vercel.app')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

// Only apply Clerk middleware if keys are available
if (process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
    app.use(clerkMiddleware({
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY
    }))
    console.log('Clerk middleware initialized successfully')
} else {
    console.warn('WARNING: Clerk keys not found, Clerk middleware not initialized')
    // Add a dummy middleware that adds a warning to the auth object
    app.use((req, res, next) => {
        req.auth = { userId: null, clerkError: 'Clerk not configured' }
        next()
    })
}

app.use(bodyParser.json())
app.use(requestLogger)

// Serve uploaded files (resumes, cover letters) statically
app.use('/uploads', express.static('data/Uploads'))

// Serve PDF reports for download
app.use('/reports', express.static('data/Reports'))

// WARNING: This endpoint should be removed or protected in production
// It deletes all data and resets the database
if (process.env.NODE_ENV !== 'production') {
    app.get('/setupDb', async (req, res, next) => {
        try {
            let data = await create.setupDb();
            res.send(data)
        } catch (err) {
            res.status(500).send("Error occurred during insertion of data")
        }
    })
}

app.use('/api/v1/user', router);
app.use('/api/v1/auth/clerk', clerkAuthRouter);
app.use('/api/v1/employeer', employeerRouter)
app.use('/api/v1/quiz', quizRouter)
app.use('/api/v1/jobSeeker', jobSeekerRouter)
app.use('/api/v1/jobs', jobRouter)
app.use('/api/v1/applications', applicationRouter)
app.use('/api/v1/messages', messageRouter)

// Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorLogger)

const PORT = process.env.PORT || 5001;
if (!module.parent) {
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}


module.exports = { app, server };