const { requireAuth } = require('@clerk/express');

/**
 * Clerk Authentication Middleware
 * Verifies JWT tokens issued by Clerk
 * Automatically rejects requests without valid tokens
 */

// Check if Clerk is configured before creating the middleware
const clerkAuthMiddleware = (req, res, next) => {
    // If Clerk keys are not configured, return an error
    if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
        return res.status(503).json({
            error: 'Authentication service unavailable',
            message: 'Clerk authentication is not configured. Please set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY environment variables.'
        });
    }

    // Otherwise use the actual Clerk requireAuth middleware
    return requireAuth()(req, res, next);
};

module.exports = clerkAuthMiddleware;
