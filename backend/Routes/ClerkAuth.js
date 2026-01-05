const express = require('express');
const router = express.Router();
const ClerkAuthController = require('../Controllers/ClerkAuthController');
const clerkAuthMiddleware = require('../middewares/ClerkAuthMiddleware');
const { getJobSeekerCollection, getEmployeerCollection } = require('../utlities/connection');

/**
 * Clerk Authentication Routes
 * Handles user sync and profile management with Clerk
 */

/**
 * POST /auth/clerk/sync
 * Sync user from Clerk after authentication
 * Body: { userType: 'Jobseeker' | 'Employeer', email, name, profileImage }
 * Header: Authorization: Bearer <clerk_token>
 */
router.post('/sync', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const { userType, email, name, profileImage } = req.body;
        const clerkUserId = req.auth.userId;

        if (!userType || !['Jobseeker', 'Employeer'].includes(userType)) {
            let error = new Error('Invalid user type. Must be "Jobseeker" or "Employeer"');
            error.status = 400;
            throw error;
        }

        if (!email) {
            let error = new Error('Email is required');
            error.status = 400;
            throw error;
        }

        // Create clerk user data object from request body
        const clerkUserData = {
            id: clerkUserId,
            email_addresses: [{ email_address: email }],
            first_name: name?.split(' ')[0] || '',
            last_name: name?.split(' ').slice(1).join(' ') || '',
            image_url: profileImage
        };

        // Get or create user
        const result = await ClerkAuthController.getOrSyncUser(clerkUserData, userType);

        res.status(200).json({
            message: 'User synced successfully',
            user: {
                _id: result.user._id,
                clerkId: result.user.clerkId,
                name: result.user.name,
                emailId: result.user.emailId,
                userType: result.userType,
                profileImage: result.user.profileImage,
                isNew: result.isNew
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/clerk/complete-profile
 * Complete user profile after Clerk signup
 * For job seekers: { skills, jobPreferences }
 * For employers: { companyName, description, industry }
 */
router.post('/complete-profile', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const clerkUserId = req.auth.userId;
        const { userType, ...profileData } = req.body;

        // Get user type from request or detect it
        let detectedUserType = userType;
        if (!detectedUserType) {
            const existing = await ClerkAuthController.syncUserAcrossCollections(clerkUserId, null);
            detectedUserType = existing?.userType;
        }

        if (!detectedUserType) {
            let error = new Error('User type not found');
            error.status = 404;
            throw error;
        }

        const collection = detectedUserType === 'Jobseeker'
            ? await getJobSeekerCollection()
            : await getEmployeerCollection();

        const user = await collection.findOneAndUpdate(
            { clerkId: clerkUserId },
            {
                ...profileData,
                profileCompleted: true
            },
            { new: true }
        );

        if (!user) {
            let error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        res.json({
            message: 'Profile completed successfully',
            user: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /auth/clerk/profile
 * Get current user profile (Clerk-authenticated)
 */
router.get('/profile', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const clerkUserId = req.auth.userId;

        const result = await ClerkAuthController.syncUserAcrossCollections(clerkUserId, null);

        if (!result) {
            let error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        const { password, ...userWithoutPassword } = result.user.toObject
            ? result.user.toObject()
            : { ...result.user };

        delete userWithoutPassword.password;

        res.json({
            user: userWithoutPassword,
            userType: result.userType
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /auth/clerk/profile
 * Update user profile
 */
router.put('/profile', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const clerkUserId = req.auth.userId;
        const updates = req.body;

        const result = await ClerkAuthController.syncUserAcrossCollections(clerkUserId, null);

        if (!result) {
            let error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        const collection = result.userType === 'Jobseeker'
            ? await getJobSeekerCollection()
            : await getEmployeerCollection();

        const updatedUser = await collection.findByIdAndUpdate(
            result.user._id,
            { ...updates },
            { new: true }
        );

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /auth/clerk/webhook
 * Handle Clerk webhook events (user.created, user.updated, user.deleted)
 * Should be called with Clerk webhook signature verification
 */
router.post('/webhook', async (req, res, next) => {
    try {
        // In production, verify Clerk webhook signature here
        const result = await ClerkAuthController.handleClerkWebhook(req.body);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /auth/clerk/logout
 * Logout user (frontend should handle Clerk token removal)
 */
router.get('/logout', (req, res) => {
    res.json({
        message: 'Logout successful. Please clear Clerk tokens on the frontend.',
        instructions: 'Call clerk.signOut() on the frontend'
    });
});

module.exports = router;
