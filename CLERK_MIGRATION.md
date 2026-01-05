# Clerk Authentication Migration Guide

This guide helps you migrate from the legacy password-based authentication to Clerk authentication while maintaining backward compatibility.

## Overview

The migration allows you to:
- Support both legacy and Clerk authentication simultaneously
- Gradually migrate existing users
- Maintain all existing user data
- Zero downtime during migration

## Phase 1: Installation & Setup (30 minutes)

### 1.1 Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 1.2 Create Clerk Account

1. Go to https://clerk.com
2. Create a new application
3. Configure authentication methods:
   - Enable Email verification
   - Add Google OAuth
   - Add GitHub OAuth
   - Add LinkedIn OAuth (optional)

### 1.3 Set Environment Variables

**Backend (`backend/.env`):**
```env
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Frontend (`frontend/.env`):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### 1.4 Test Authentication Flow

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Visit `http://localhost:5173/login` and test:
- Email/OTP login
- Google OAuth
- GitHub OAuth

## Phase 2: Existing User Migration (2-4 weeks)

### 2.1 Add Clerk ID to Existing Users

Create a migration script to add `clerkId` field to existing users:

```javascript
// backend/utils/migration.js
const { getJobSeekerCollection, getEmployeerCollection } = require('./connection');

async function migrateExistingUsers() {
    try {
        const jobSeekerCollection = await getJobSeekerCollection();
        const employeerCollection = await getEmployeerCollection();

        // Add clerkId field if not exists
        await jobSeekerCollection.updateMany(
            { clerkId: { $exists: false } },
            { 
                $set: { 
                    clerkId: null,
                    authMethod: 'password',
                    clerkConnected: false
                }
            }
        );

        await employeerCollection.updateMany(
            { clerkId: { $exists: false } },
            { 
                $set: { 
                    clerkId: null,
                    authMethod: 'password',
                    clerkConnected: false
                }
            }
        );

        console.log('Migration completed!');
    } catch (error) {
        console.error('Migration error:', error);
    }
}

module.exports = { migrateExistingUsers };
```

Run migration:

```bash
node -e "require('./utlities/migration').migrateExistingUsers()"
```

### 2.2 Send Email to Existing Users

Create email template inviting users to link Clerk account:

**Template:**
```
Subject: Secure Your JobNest Account with Clerk

Dear [User Name],

We've upgraded our authentication system to provide better security and additional login options.

You can now:
✓ Login with email verification (OTP)
✓ Login with Google
✓ Login with GitHub
✓ Login with LinkedIn

Your existing account remains active. You can link your Clerk account anytime.

[Link to Account Linking Page]

Best regards,
JobNest Team
```

### 2.3 Create Account Linking Flow (Optional)

Allow existing users to link their Clerk account:

```javascript
// backend/Routes/ClerkAuth.js - Add new endpoint

/**
 * POST /auth/clerk/link-account
 * Link existing password account to Clerk
 */
router.post('/auth/clerk/link-account', clerkAuthMiddleware, async (req, res, next) => {
    try {
        const clerkUser = req.auth;
        const { currentPassword } = req.body;

        // Verify password for security
        // ... (implement password verification)

        // Find and update user
        const collection = await getJobSeekerCollection();
        let user = await collection.findOne({ emailId: clerkUser.emailAddresses[0].emailAddress });

        if (!user) {
            const employerCollection = await getEmployeerCollection();
            user = await employerCollection.findOne({ emailId: clerkUser.emailAddresses[0].emailAddress });
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user with Clerk ID
        user = await collection.findByIdAndUpdate(
            user._id,
            {
                clerkId: clerkUser.userId,
                clerkConnected: true,
                authMethod: 'clerk'
            },
            { new: true }
        );

        res.json({
            message: 'Account linked successfully',
            user
        });
    } catch (error) {
        next(error);
    }
});
```

## Phase 3: Gradual Rollout (1-2 weeks)

### 3.1 Feature Flag Implementation

```javascript
// backend/config/features.js
const FEATURE_FLAGS = {
    CLERK_AUTH_ENABLED: process.env.CLERK_AUTH_ENABLED === 'true',
    LEGACY_AUTH_ENABLED: process.env.LEGACY_AUTH_ENABLED === 'true',
    FORCE_CLERK_AUTH: process.env.FORCE_CLERK_AUTH === 'true'
};

module.exports = FEATURE_FLAGS;
```

### 3.2 Support Both Auth Methods

```javascript
// Middleware that supports both JWT and Clerk tokens
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Try JWT first (legacy)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded._id;
            req.userType = decoded.userType;
            req.authMethod = 'jwt';
            return next();
        } catch (err) {
            // JWT failed, try Clerk
        }
    }
    
    // Will be handled by clerkMiddleware
    next();
});
```

### 3.3 Enable Feature Flags

**Environment Variables:**
```env
# Enable both auth methods
CLERK_AUTH_ENABLED=true
LEGACY_AUTH_ENABLED=true
FORCE_CLERK_AUTH=false
```

## Phase 4: Monitoring & Analytics

### 4.1 Track Auth Method Usage

```javascript
// backend/utlities/authAnalytics.js
async function logAuthMethod(method, userType, success) {
    const timestamp = new Date();
    const collection = await db.collection('auth_logs');
    
    await collection.insertOne({
        method,      // 'jwt', 'clerk_email', 'clerk_google', 'clerk_github'
        userType,    // 'Jobseeker', 'Employeer'
        success,
        timestamp
    });
}
```

### 4.2 Monitor Adoption

Track metrics:
- % of new users using Clerk
- % of existing users linking Clerk
- Failed login attempts by method
- Social login conversion rates

## Phase 5: Complete Migration (4-6 weeks)

### 5.1 Deprecate Legacy Auth

Once adoption reaches 90%+:

```env
LEGACY_AUTH_ENABLED=false
FORCE_CLERK_AUTH=true
```

### 5.2 Clean Up Legacy Code

After 2 weeks of forcing Clerk auth:

```bash
# Remove old auth routes (keep for 6 months as fallback)
# Remove old auth pages
# Remove JWT generation code

# Keep in archive:
# - Legacy AuthController.js
# - Legacy auth routes
# - Legacy pages
```

### 5.3 Database Cleanup (Optional)

```javascript
// Remove password fields after full migration
db.jobseekers.updateMany({}, { $unset: { password: 1 } });
db.employers.updateMany({}, { $unset: { password: 1 } });
```

## Rollback Plan

If issues occur, rollback is simple:

### 1. Disable Clerk
```env
CLERK_AUTH_ENABLED=false
LEGACY_AUTH_ENABLED=true
FORCE_CLERK_AUTH=false
```

### 2. Restart services
```bash
npm restart
```

### 3. Users can continue with legacy auth
No data is lost, all passwords remain hashed in database.

## Troubleshooting During Migration

### Issue: Users stuck on login

**Solution:**
1. Ensure both auth methods are enabled
2. Check Clerk API keys are correct
3. Clear browser cookies
4. Try incognito mode

### Issue: User exists in both systems

**Solution:**
1. Check `clerkId` field
2. Merge accounts using email as key
3. Keep more complete profile data

### Issue: Performance degradation

**Solution:**
1. Add indexes on `clerkId` and `emailId`
2. Cache Clerk responses
3. Rate limit auth endpoints

## Success Criteria

Migration is successful when:
- ✅ 95%+ of new users use Clerk
- ✅ 80%+ of active users linked Clerk
- ✅ Zero failed Clerk logins in production
- ✅ All social login working
- ✅ OTP delivery rate > 99%

## Post-Migration Optimization

1. **Remove legacy JWT generation**
2. **Simplify auth middleware**
3. **Update documentation**
4. **Train support team**
5. **Archive legacy code**

## Support & Help

**For Clerk issues:**
- Check [Clerk Documentation](https://clerk.com/docs)
- Review [Clerk Dashboard Logs](https://dashboard.clerk.com/apps/[app_id]/logs)

**For JobNest issues:**
- Check error logs in `backend/Errorlogger.txt`
- Review database for inconsistencies
- Check CORS configuration

## Timeline Summary

- **Day 1-2**: Setup Clerk account and install packages
- **Day 3-5**: Test and verify auth flows
- **Week 1-2**: Run migration script for existing users
- **Week 3**: Enable both auth methods
- **Week 4-5**: Monitor adoption and fix issues
- **Week 6+**: Gradually deprecate legacy auth

## Questions?

Refer to:
1. [CLERK_SETUP.md](./CLERK_SETUP.md) - Initial setup guide
2. [Clerk Documentation](https://clerk.com/docs)
3. Project issue tracker for specific problems
