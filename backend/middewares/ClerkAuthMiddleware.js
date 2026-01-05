const { requireAuth } = require('@clerk/express');

/**
 * Clerk Authentication Middleware
 * Verifies JWT tokens issued by Clerk
 * Automatically rejects requests without valid tokens
 */
const clerkAuthMiddleware = requireAuth();

module.exports = clerkAuthMiddleware;
