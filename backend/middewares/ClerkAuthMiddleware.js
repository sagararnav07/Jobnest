const { ClerkExpressRequireAuth } = require('@clerk/express');

/**
 * Clerk Authentication Middleware
 * Verifies JWT tokens issued by Clerk
 * Automatically rejects requests without valid tokens
 */
const clerkAuthMiddleware = ClerkExpressRequireAuth();

module.exports = clerkAuthMiddleware;
