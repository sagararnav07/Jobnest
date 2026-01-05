# Clerk Authentication - Quick Start Guide

Get Clerk authentication up and running in 5 minutes!

## What You'll Get

✅ Email/OTP verification  
✅ Google OAuth  
✅ GitHub OAuth  
✅ LinkedIn OAuth (optional)  
✅ Automatic user sync to MongoDB  
✅ Support for Job Seekers & Employers  

## 5-Minute Setup

### Step 1: Create Clerk Account (1 min)

1. Go to https://clerk.com/sign-up
2. Sign up with your email
3. Create a new application

### Step 2: Get API Keys (1 min)

1. In Clerk dashboard, click **API Keys**
2. Copy the **Publishable Key** (starts with `pk_`)
3. Copy the **Secret Key** (starts with `sk_`)

### Step 3: Update Environment Variables (1 min)

**Backend** (`backend/.env`):
```env
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Frontend** (`frontend/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Step 4: Install Dependencies (1 min)

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Step 5: Start the App (1 min)

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

Visit `http://localhost:5173/login` and test!

## Test the Integration

### Test Email/OTP
1. Click "Job Seeker" or "Employer"
2. Enter any email (use a test email)
3. Clerk sends a code to that email
4. Enter the code
5. You're logged in! ✅

### Test Google OAuth
1. Click "Job Seeker"
2. Click "Google" button
3. Sign in with Google account
4. Automatically creates user in MongoDB ✅

### Test GitHub OAuth
1. Click "Employer"
2. Click "GitHub" button
3. Authorize the app
4. User created with GitHub info ✅

## Where's the Code?

**New Files Created:**

| File | Purpose |
|------|---------|
| `backend/Controllers/ClerkAuthController.js` | Clerk user sync logic |
| `backend/middewares/ClerkAuthMiddleware.js` | Verify Clerk tokens |
| `backend/Routes/ClerkAuth.js` | Clerk API endpoints |
| `frontend/src/pages/auth/LoginClerk.jsx` | New login page |
| `frontend/src/pages/auth/RegisterClerk.jsx` | New signup page |
| `frontend/src/contexts/AuthContext.jsx` | Updated auth context |

**Updated Files:**

| File | Change |
|------|--------|
| `backend/package.json` | Added `@clerk/express` |
| `backend/app.js` | Added Clerk middleware & routes |
| `frontend/package.json` | Added `@clerk/clerk-react` |
| `frontend/src/main.jsx` | Wrapped with `ClerkProvider` |

## How It Works (Overview)

```
User → Clerk SignIn/SignUp
         ↓
    Clerk generates JWT token
         ↓
Frontend calls `/api/v1/auth/clerk/sync`
         ↓
Backend verifies token, creates/updates user in MongoDB
         ↓
User logged in! ✅
```

## Add Social OAuth (Optional)

Want Google/GitHub login? Follow CLERK_SETUP.md for:
- Google OAuth setup
- GitHub OAuth setup  
- LinkedIn OAuth setup

Takes ~5 minutes per provider!

## Database

Users are stored in:
- `db.jobseekers` (for job seekers)
- `db.employers` (for employers)

New fields added:
```javascript
{
  clerkId: "user_xxxxx",          // From Clerk
  name: "John Doe",
  emailId: "john@example.com",
  profileImage: "https://...",    // From Clerk
  userType: "Jobseeker",
  authMethod: "clerk",
  clerkConnected: true,
  profileCompleted: false
}
```

## API Endpoints

All endpoints require Clerk authentication:

```bash
Header: Authorization: Bearer <clerk_token>
```

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/auth/clerk/sync` | Sync user after login |
| POST | `/api/v1/auth/clerk/complete-profile` | Complete profile |
| GET | `/api/v1/auth/clerk/profile` | Get user profile |
| PUT | `/api/v1/auth/clerk/profile` | Update profile |

## Troubleshooting

**Q: Login not working?**
- Check `VITE_CLERK_PUBLISHABLE_KEY` in frontend `.env`
- Check `CLERK_SECRET_KEY` in backend `.env`
- Verify Clerk account is active

**Q: No user created in MongoDB?**
- Check backend logs: `backend/Errorlogger.txt`
- Verify MongoDB connection
- Ensure `/auth/clerk/sync` endpoint was called

**Q: Social login showing blank?**
- Go to Clerk dashboard
- Click **Authentication** → **Social OAuth**
- Enable the providers you need

**Q: CORS errors?**
- Check `FRONTEND_URL` in backend `.env`
- Ensure frontend domain is in Clerk dashboard → **Domains**

## Next Steps

1. **Test thoroughly** with different auth methods
2. **Configure social OAuth** (Google, GitHub, LinkedIn)
3. **Complete user profiles** after signup
4. **Deploy to production** (see DEPLOYMENT.md)
5. **Migrate existing users** (see CLERK_MIGRATION.md)

## Complete Guides

- **Full Setup**: See [CLERK_SETUP.md](./CLERK_SETUP.md)
- **Migration**: See [CLERK_MIGRATION.md](./CLERK_MIGRATION.md)
- **Troubleshooting**: See [CLERK_SETUP.md#troubleshooting](./CLERK_SETUP.md#troubleshooting)

## Support

- **Clerk Docs**: https://clerk.com/docs
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Email Clerk Support**: support@clerk.com

---

**That's it!** You now have enterprise-grade authentication with OTP, Google, GitHub, and LinkedIn login. 🚀
