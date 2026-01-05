# Clerk Authentication Setup Guide for JobNest

This guide walks you through setting up Clerk authentication with OTP verification and social login (Google, LinkedIn, GitHub) for JobNest.

## Overview

The implementation includes:
- ✅ Clerk authentication for both Job Seekers and Employers
- ✅ Email verification with OTP
- ✅ Google, LinkedIn, and GitHub OAuth integration
- ✅ User profile synchronization between Clerk and MongoDB
- ✅ Separate authentication flows for job seekers and employers

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Clerk account (https://clerk.com)
- Google, LinkedIn, and GitHub OAuth applications

## Step 1: Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Sign up / Sign in
3. Create a new application:
   - Click "Create application"
   - Choose a name (e.g., "JobNest")
   - Select your preferred authentication methods (we recommend starting with Email/OTP + Google)

## Step 2: Configure Clerk Authentication Methods

### Email/OTP Verification
1. In Clerk dashboard, go to **Authentication → Email Verification**
2. Enable "Email verification code"
3. Set OTP expiration time (recommended: 10 minutes)

### Social OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable "Google+ API"
4. Create OAuth 2.0 credentials (Web application):
   - Redirect URIs:
     - `http://localhost:3000/auth/google/callback` (development)
     - `https://your-frontend-domain.com/auth/google/callback` (production)
5. Copy Client ID and Client Secret
6. In Clerk dashboard, go to **Authentication → Social OAuth → Google**
7. Paste the credentials and enable

#### GitHub OAuth
1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App:
   - Authorization callback URL:
     - `http://localhost:3000/auth/github/callback` (development)
     - `https://your-frontend-domain.com/auth/github/callback` (production)
3. Copy Client ID and Client Secret
4. In Clerk dashboard, go to **Authentication → Social OAuth → GitHub**
5. Paste the credentials and enable

#### LinkedIn OAuth
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers)
2. Create a new app
3. In Auth section, add Authorized redirect URIs:
   - `http://localhost:3000/auth/linkedin/callback` (development)
   - `https://your-frontend-domain.com/auth/linkedin/callback` (production)
4. Get Client ID and Client Secret
5. In Clerk dashboard, go to **Authentication → Social OAuth → LinkedIn**
6. Paste the credentials and enable

## Step 3: Get Clerk API Keys

1. In Clerk dashboard, go to **API Keys**
2. Copy the following:
   - **Frontend - Publishable Key**: Used in frontend (public, safe to expose)
   - **Backend - Secret Key**: Used in backend (keep secure!)

## Step 4: Environment Variables Setup

### Backend (.env)

```env
# Existing variables
NODE_ENV=production
PORT=5001
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/Jobnest
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:3000

# NEW: Clerk Configuration
CLERK_SECRET_KEY=sk_test_xxxxx  # Get from Clerk dashboard
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # Get from Clerk dashboard
```

### Frontend (.env)

```env
# Existing variables
VITE_API_URL=http://localhost:5001/api/v1

# NEW: Clerk Configuration
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx  # Get from Clerk dashboard
```

### Frontend (.env.production)

```env
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx  # Production key from Clerk
```

## Step 5: Database Schema Updates

Add these fields to your User models (JobSeeker and Employer):

```javascript
{
  clerkId: String,                    // Clerk's unique user ID
  name: String,
  emailId: String,
  profileImage: String,               // From Clerk's profile
  userType: String,                   // 'Jobseeker' or 'Employeer'
  clerkConnected: Boolean,            // Indicates Clerk connection
  authMethod: String,                 // 'clerk' or 'password'
  profileCompleted: Boolean,          // For tracking setup progress
  createdAt: Date,
  lastUpdated: Date,
  // Existing fields continue...
  skills: [],
  jobPreference: String,
  // OR for employers
  companyName: String,
  description: String,
  industry: String,
  // ... other fields
}
```

## Step 6: Installation & Dependencies

### Backend

Already added to `package.json`:
```bash
npm install @clerk/express@^1.3.0
```

### Frontend

Already added to `package.json`:
```bash
npm install @clerk/clerk-react@^5.0.0
```

Then run:
```bash
npm install
```

## Step 7: Router Configuration

Update your router to use the new Clerk authentication routes:

### Routes Added

- `POST /api/v1/auth/clerk/sync` - Sync user from Clerk to MongoDB
- `POST /api/v1/auth/clerk/complete-profile` - Complete user profile after signup
- `GET /api/v1/auth/clerk/profile` - Get user profile (Clerk-authenticated)
- `PUT /api/v1/auth/clerk/profile` - Update user profile
- `POST /api/v1/auth/clerk/webhook` - Handle Clerk webhook events

## Step 8: Update Authentication Pages

The implementation includes two new auth pages:

### Login Flow
```
/login → Choose user type (Job Seeker/Employer) → Clerk SignIn
```

**New files:**
- `frontend/src/pages/auth/LoginClerk.jsx`

### Register Flow
```
/register → Choose user type → Clerk SignUp
```

**New files:**
- `frontend/src/pages/auth/RegisterClerk.jsx`

## Step 9: Router Configuration

Update your router file to use the new Clerk auth pages:

```javascript
import { LoginClerk, RegisterClerk } from './pages/auth'

// Replace old routes with:
<Route path="/login" element={<LoginClerk />} />
<Route path="/register" element={<RegisterClerk />} />
```

## Step 10: Environment Variables for Production

### On Render.com (Backend)

1. Go to your service environment variables
2. Add:
   ```
   CLERK_SECRET_KEY=sk_live_xxxxx
   CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   ```

### On Vercel (Frontend)

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   ```

3. Add Vercel's Domain to Clerk:
   - In Clerk dashboard, go to **Domains**
   - Add your Vercel domain (e.g., `your-app.vercel.app`)

## Step 11: Testing

### Local Development

1. Start backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Test flows:
   - Navigate to `http://localhost:5173/login`
   - Try signing in with email/OTP
   - Try social login (Google/GitHub)
   - Verify user is created in MongoDB

### Verify User Creation

1. Check MongoDB collections:
   ```bash
   db.jobseekers.find()
   db.employers.find()
   ```

2. Should see `clerkId` field populated with Clerk user ID

## Step 12: Deployment

### Backend (Render)

1. Update environment variables in Render dashboard
2. Ensure Clerk Secret Key is set
3. Redeploy

### Frontend (Vercel)

1. Update environment variables in Vercel dashboard
2. Update VITE_CLERK_PUBLISHABLE_KEY with production key
3. Redeploy

## API Endpoints

### Authenticate Clerk Token (Backend)

All routes under `/api/v1/auth/clerk/*` require Clerk authentication.

**Header:**
```
Authorization: Bearer <clerk_jwt_token>
```

### Sync User After Login

```bash
POST /api/v1/auth/clerk/sync
Content-Type: application/json
Authorization: Bearer <clerk_token>

{
  "userType": "Jobseeker"  // or "Employeer"
}
```

**Response:**
```json
{
  "message": "User synced successfully",
  "user": {
    "_id": "mongodb_id",
    "clerkId": "clerk_user_id",
    "name": "John Doe",
    "emailId": "john@example.com",
    "userType": "Jobseeker",
    "profileImage": "https://...",
    "isNew": false
  }
}
```

### Complete Profile

```bash
POST /api/v1/auth/clerk/complete-profile
Content-Type: application/json
Authorization: Bearer <clerk_token>

{
  "userType": "Jobseeker",
  "skills": ["JavaScript", "React", "Node.js"],
  "jobPreference": "Full-time"
}
```

## Troubleshooting

### 1. "Clerk token is invalid"
- Ensure `CLERK_SECRET_KEY` is correctly set in backend `.env`
- Verify the frontend is sending valid tokens from Clerk

### 2. "User not found in database"
- Check if `/auth/clerk/sync` endpoint was called
- Verify MongoDB connection
- Check `clerkId` field exists in user document

### 3. Social login not working
- Verify OAuth credentials are correct in Clerk dashboard
- Check redirect URIs match your domain
- Ensure social login is enabled in Clerk

### 4. CORS errors
- Update `allowedOrigins` in `backend/app.js` with your frontend URL
- Ensure `FRONTEND_URL` environment variable is set

## Security Notes

1. **Never expose `CLERK_SECRET_KEY`** - Keep it server-side only
2. **Verify webhook signatures** in production (code provided in ClerkAuth routes)
3. **Use HTTPS** in production
4. **Store JWT securely** - Clerk handles this automatically
5. **Validate user type** on backend before processing requests

## Next Steps

1. Implement profile completion flow after signup
2. Add role-based access control
3. Set up Clerk webhooks for real-time sync
4. Implement custom claims for additional security
5. Add multi-language support

## References

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Express SDK](https://clerk.com/docs/references/nodejs/clerk-express)
- [Clerk React SDK](https://clerk.com/docs/references/react/clerk-react)
- [OAuth 2.0 Flow](https://tools.ietf.org/html/rfc6749)

## Support

For issues:
1. Check Clerk dashboard logs
2. Review backend error logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
5. Contact Clerk support at support@clerk.com
