const { getJobSeekerCollection, getEmployeerCollection } = require('../utlities/connection');

/**
 * Clerk Authentication Controller
 * Handles user synchronization from Clerk to MongoDB
 * Creates or updates user profiles based on Clerk user data
 */
const ClerkAuthController = {};

/**
 * Sync or create user from Clerk
 * Called when a user authenticates via Clerk
 */
ClerkAuthController.syncOrCreateUser = async (clerkUserData, userType) => {
    try {
        const { id, email_addresses, first_name, last_name, image_url } = clerkUserData;

        const email = email_addresses?.[0]?.email_address;

        if (!email) {
            let error = new Error('Email not found in Clerk user data');
            error.status = 400;
            throw error;
        }

        const name = `${first_name || ''} ${last_name || ''}`.trim() || 'User';
        const collection = userType === 'Jobseeker'
            ? await getJobSeekerCollection()
            : await getEmployeerCollection();

        // First check if user exists by clerkId
        let user = await collection.findOne({ clerkId: id });

        if (!user) {
            // Check if user exists by email (could be a previous local account)
            user = await collection.findOne({ emailId: email });

            if (user) {
                // Link existing account to Clerk
                user = await collection.findByIdAndUpdate(
                    user._id,
                    {
                        clerkId: id,
                        name: name,
                        profileImage: image_url,
                        authMethod: 'clerk',
                        lastUpdated: new Date()
                    },
                    { new: true }
                );
            } else {
                // Create new user with Clerk data
                user = await collection.create({
                    clerkId: id,
                    name: name,
                    emailId: email,
                    profileImage: image_url,
                    userType: userType,
                    authMethod: 'clerk',
                    createdAt: new Date()
                });
            }
        } else {
            // Update existing user with latest Clerk data
            user = await collection.findByIdAndUpdate(
                user._id,
                {
                    name: name,
                    profileImage: image_url,
                    lastUpdated: new Date()
                },
                { new: true }
            );
        }

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Handle Clerk webhook for user creation/update
 * Called when user signs up or updates their profile in Clerk
 */
ClerkAuthController.handleClerkWebhook = async (event) => {
    try {
        if (event.type === 'user.created' || event.type === 'user.updated') {
            const clerkUser = event.data;
            // We'll sync based on userType from the frontend
            // This would be called via webhook from Clerk
            return { success: true, message: 'User synced' };
        }

        if (event.type === 'user.deleted') {
            const clerkId = event.data.id;
            const jobSeekerCollection = await getJobSeekerCollection();
            const employeerCollection = await getEmployeerCollection();

            await jobSeekerCollection.deleteOne({ clerkId });
            await employeerCollection.deleteOne({ clerkId });

            return { success: true, message: 'User deleted' };
        }

        return { success: true };
    } catch (error) {
        throw error;
    }
};

/**
 * Get user profile by Clerk ID
 */
ClerkAuthController.getUserByClerkId = async (clerkId, userType) => {
    try {
        const collection = userType === 'Jobseeker'
            ? await getJobSeekerCollection()
            : await getEmployeerCollection();

        const user = await collection.findOne({ clerkId });

        if (!user) {
            let error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        return user;
    } catch (error) {
        throw error;
    }
};

/**
 * Detect user type and sync user
 * Checks both collections to find existing user
 */
ClerkAuthController.syncUserAcrossCollections = async (clerkId, email) => {
    try {
        const jobSeekerCollection = await getJobSeekerCollection();
        const employeerCollection = await getEmployeerCollection();

        // Check if user exists as job seeker
        let user = await jobSeekerCollection.findOne({ clerkId });
        if (user) {
            return { user, userType: 'Jobseeker' };
        }

        // Check if user exists as employer
        user = await employeerCollection.findOne({ clerkId });
        if (user) {
            return { user, userType: 'Employeer' };
        }

        // User not found
        return null;
    } catch (error) {
        throw error;
    }
};

/**
 * Get or sync user for a new session
 * Tries to find existing user or creates one based on userType
 */
ClerkAuthController.getOrSyncUser = async (clerkUserData, userType) => {
    try {
        const { id } = clerkUserData;

        // Try to find existing user
        const existing = await ClerkAuthController.syncUserAcrossCollections(id, clerkUserData.email_addresses?.[0]?.email_address);

        if (existing) {
            return { user: existing.user, userType: existing.userType, isNew: false };
        }

        // Create new user
        const newUser = await ClerkAuthController.syncOrCreateUser(clerkUserData, userType);
        return { user: newUser, userType, isNew: true };
    } catch (error) {
        throw error;
    }
};

module.exports = ClerkAuthController;
