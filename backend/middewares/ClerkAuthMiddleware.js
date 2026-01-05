const { requireAuth } = require('@clerk/express');

/**
 * Clerk Authentication Middleware
 * Verifies JWT tokens issued by Clerk
 * Automatically rejects requests without valid tokens
 */

// Export the middleware function directly
// The clerkMiddleware in app.js must be initialized first
module.exports = requireAuth();
