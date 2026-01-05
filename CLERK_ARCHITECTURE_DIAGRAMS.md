# Clerk Authentication - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (React + Vite)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         ClerkProvider (main.jsx)                           │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  AuthContext (contexts/AuthContext.jsx)             │  │ │
│  │  │  - useAuth() hook                                    │  │ │
│  │  │  - User sync with backend                           │  │ │
│  │  │  - Profile management                               │  │ │
│  │  │  ┌────────────────────────────────────────────────┐ │  │ │
│  │  │  │  LoginClerk/RegisterClerk Pages                │ │  │ │
│  │  │  │  - User type selection                         │ │  │ │
│  │  │  │  - Clerk SignIn/SignUp components             │ │  │ │
│  │  │  │  - Social login buttons                        │ │  │ │
│  │  │  └────────────────────────────────────────────────┘ │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP Requests with Clerk JWT
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     CLERK SERVICE (clerk.com)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Email/OTP     │  │  OAuth Apps  │  │  Token Generation │  │
│  │   Verification  │  │  - Google    │  │  - JWT Creation   │  │
│  │                 │  │  - GitHub    │  │  - Token Refresh  │  │
│  │                 │  │  - LinkedIn  │  │  - Token Verify   │  │
│  └─────────────────┘  └──────────────┘  └───────────────────┘  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    HTTP Requests with JWT Token
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER SIDE (Node.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Express App (app.js)                    │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │   ClerkMiddleware                                    │  │ │
│  │  │   - Verify JWT token                                │  │ │
│  │  │   - Attach user info to request                     │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │              ↓                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │   ClerkAuth Routes (Routes/ClerkAuth.js)            │  │ │
│  │  │   - POST /auth/clerk/sync                           │  │ │
│  │  │   - POST /auth/clerk/complete-profile              │  │ │
│  │  │   - GET /auth/clerk/profile                        │  │ │
│  │  │   - PUT /auth/clerk/profile                        │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │              ↓                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │  ClerkAuthController                                │  │ │
│  │  │  - syncOrCreateUser()                               │  │ │
│  │  │  - getUserByClerkId()                               │  │ │
│  │  │  - getOrSyncUser()                                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │              ↓                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │   MongoDB Driver                                     │  │ │
│  │  │   - Create user document                            │  │ │
│  │  │   - Update user data                                │  │ │
│  │  │   - Query user by clerkId                           │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB Database                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────┐  ┌───────────────────────────────┐ │
│  │   jobseekers collection │  │  employers collection         │ │
│  │                         │  │                               │ │
│  │ Fields:                 │  │ Fields:                       │ │
│  │ - _id                   │  │ - _id                         │ │
│  │ - clerkId              │  │ - clerkId                    │ │
│  │ - name                  │  │ - name                        │ │
│  │ - emailId              │  │ - emailId                    │ │
│  │ - profileImage         │  │ - profileImage               │ │
│  │ - authMethod            │  │ - authMethod                  │ │
│  │ - skills               │  │ - companyName                │ │
│  │ - jobPreference        │  │ - description                │ │
│  │ - ...more fields       │  │ - ...more fields             │ │
│  └─────────────────────────┘  └───────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Login Flow Sequence Diagram

```
User                Frontend              Clerk              Backend            MongoDB
 │                     │                   │                  │                  │
 ├─ Click Login ─────→ │                   │                  │                  │
 │                     │                   │                  │                  │
 │                 ┌───┴─ Render Selection ┐                  │                  │
 │                 │   (Job Seeker /      │                  │                  │
 │                 │    Employer)          │                  │                  │
 │                 └───┬──────────────────┘                  │                  │
 │                     │                   │                  │                  │
 │                 ┌───┴─ Select User Type ┐                  │                  │
 │                 │                       │                  │                  │
 │                 └─ Choose Auth Method ──→ Email/OTP │      │                  │
 │                                         │ or Social│      │                  │
 │                                         │ Login    │      │                  │
 │                 ┌─ Authenticate ────────→ │         │      │                  │
 │                 │                       ├─ Verify │      │                  │
 │                 │                       │ Email   │      │                  │
 │                 ├─ OTP Code ────────────→ │         │      │                  │
 │                 │                       │ or      │      │                  │
 │                 │                   ┌─→ │ OAuth   │      │                  │
 │                 │                   │   │ Consent │      │                  │
 │                 │                   └─ Generate JWT       │                  │
 │                 │                       └──────┬──────────→ │                  │
 │                 │                              │ JWT Token  │                  │
 │                 │ ┌────────────────────────────┴──────→ POST /auth/clerk/sync │
 │                 │ │ { userType: "Jobseeker",  │           │                  │
 │                 │ │   JWT Token }             │           │                  │
 │                 │ │                           │   ┌──────┴─ Verify JWT       │
 │                 │ │                           │   │                          │
 │                 │ │                           │   └──────→ Extract clerkId  │
 │                 │ │                           │            & email          │
 │                 │ │                           │            ↓                 │
 │                 │ │                           │      ┌────────────────────┐  │
 │                 │ │                           │      │ Check if user      │  │
 │                 │ │                           │      │ exists in DB       │  │
 │                 │ │                           │      └────────────────────┘  │
 │                 │ │                           │            ↓                 │
 │                 │ │                           │      ┌────────────────────┐  │
 │                 │ │                           │      │ Create or update   │  │
 │                 │ │                           │      │ user in jobseekers │──→ Insert/Update
 │                 │ │                           │      │ collection         │    User Document
 │                 │ │                           │      └────────────────────┘  │
 │                 │ │  ┌─────────── Return User Response ──────────────────────┤
 │                 │ └─ │ { user, isNew, userType }                             │
 │                 │    │ { clerkId, name, email,                              │
 │                 │    │   profileImage, userType }                           │
 │                 │    └─→ Store in Context                                   │
 │                 │        & localStorage                                      │
 │                 │                                                            │
 │         ┌───────┴─ Redirect to Dashboard ──────────────────────────────────┐
 │         │       (jobseeker or employer)                                     │
 │         │                                                                   │
 └─────────┘                                                                   │
           Logged In! ✓                                          (Login complete)
```

---

## Register/Signup Flow Sequence Diagram

```
New User            Frontend              Clerk              Backend            MongoDB
  │                    │                   │                  │                  │
  ├─ Click Register ──→ │                   │                  │                  │
  │                    │                   │                  │                  │
  │                ┌───┴─ Select User Type ┐                  │                  │
  │                │ (Job Seeker/Employer)│                  │                  │
  │                └───┬──────────────────┘                  │                  │
  │                    │                   │                  │                  │
  │                ┌───┴─ Render Signup ────→ Email/OTP      │                  │
  │                │                       │ or Social        │                  │
  │                │                       │ Options          │                  │
  │                │                       │                  │                  │
  │ ┌─ Create Account ──→ Email or Social ──→ Verify         │                  │
  │ │ (Email/OTP/OAuth)    signup             identity       │                  │
  │ │                      │                  ↓              │                  │
  │ │                      │             Send OTP or         │                  │
  │ │                      │             OAuth consent        │                  │
  │ │                      │                  ↓              │                  │
  │ │  ┌─ Submit Code/Auth ─→ │              Create user in  │                  │
  │ │  │                      │              Clerk           │                  │
  │ │  │                      │                  ↓          │                  │
  │ │  │                      │             Generate JWT     │                  │
  │ │  │                      └──────────────────┬──────────→ │                  │
  │ │  │                                    JWT Token         │                  │
  │ │  │ ┌────────────────────────────────────────→ POST /auth/clerk/sync       │
  │ │  │ │ { userType: "Jobseeker", JWT }        │           │                  │
  │ │  │ │                                       │   ┌──────┴─ No user found    │
  │ │  │ │                                       │   │ Create new user          │
  │ │  │ │                                       │   └──────→ Insert into────────→ Create
  │ │  │ │                                       │            jobseekers         New User
  │ │  │ │  ┌──────── Return User with isNew=true │                             │
  │ │  │ └─ │ { clerkId, name, email, ... }      │                             │
  │ │  │    └→ Store userType in localStorage    │                             │
  │ │  │       Set profileCompleted=false         │                             │
  │ │  │                                          │                             │
  │ │  └─ Prompt to Complete Profile             │                             │
  │ │                                            │                             │
  │ └─ Enter Profile Details                    │                             │
  │    - Skills (for Jobseekers)                │                             │
  │    - Job Preference                         │                             │
  │    - Company Name (for Employers)           │                             │
  │    - Description                            │                             │
  │    - Industry                               │                             │
  │                                             │                             │
  │  ┌─ Submit Profile ─────────────────────────→ POST /auth/clerk/complete-profile
  │  │ { userType, skills, jobPreference, ... } │           │                  │
  │  │                                          │   ┌──────┴─ Update user      │
  │  │                                          │   │ profileCompleted=true    │
  │  │                                          │   └──────→ Update────────────→ Update
  │  │                                          │            jobseeker         Document
  │  │  ┌─────── Return Updated User ──────────┤            document           │
  │  └─ │ { user with profile complete }       │                             │
  │     └→ Redirect to Dashboard               │                             │
  │                                             │                             │
  └─────────────────────────────────────────────────────────────────────────────┘
        Account Created & Profile Complete ✓
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        React Application                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ClerkProvider (@clerk/clerk-react)                          │ │
│  │ - Manages Clerk authentication                             │ │
│  │ - Provides useAuth() and useUser() hooks                   │ │
│  │ - Handles token refresh automatically                      │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ AuthContext (Custom Context)                         │  │ │
│  │  │ - Wraps Clerk hooks                                  │  │ │
│  │  │ - Syncs user with backend                            │  │ │
│  │  │ - Provides useAuth() hook                            │  │ │
│  │  │                                                        │  │ │
│  │  │ Dependencies:                                          │  │ │
│  │  │ - useAuth() [from Clerk]                              │  │ │
│  │  │ - useUser() [from Clerk]                              │  │ │
│  │  │ - fetch() [Native API]                                │  │ │
│  │  │                                                        │  │ │
│  │  │ Functions:                                             │  │ │
│  │  │ - syncUserWithBackend()                               │  │ │
│  │  │ - completeProfile()                                   │  │ │
│  │  │ - updateUserProfile()                                 │  │ │
│  │  │ - getUserProfile()                                    │  │ │
│  │  │ - setUserTypeForSignup()                              │  │ │
│  │  │ - logout()                                             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │            ↑                ↑                               │ │
│  │            │                │                               │ │
│  │  ┌─────────┴────────┐   ┌───┴──────────────┐              │ │
│  │  │ LoginClerk Page  │   │ RegisterClerk    │              │ │
│  │  │                  │   │ Page             │              │ │
│  │  │ - User type      │   │                  │              │ │
│  │  │   selection      │   │ - User type      │              │ │
│  │  │ - SignIn         │   │   selection      │              │ │
│  │  │   component      │   │ - SignUp         │              │ │
│  │  │ - Navigation     │   │   component      │              │ │
│  │  └──────────────────┘   └──────────────────┘              │ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Protected Pages (Dashboard, etc.)                    │  │ │
│  │  │ - Use useAuth() to get user data                    │  │ │
│  │  │ - Access user, userType, isAuthenticated            │  │ │
│  │  │ - Call updateUserProfile()                          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Update Diagram

```
BEFORE (Legacy):
┌────────────────────────────────┐
│ jobseekers / employers         │
├────────────────────────────────┤
│ _id                            │
│ name                           │
│ emailId                        │
│ password (hashed)              │ ← Will be removed
│ userType                       │
│ profileImage (optional)        │
│ skills                         │
│ jobPreference                  │
│ ...other fields                │
└────────────────────────────────┘


AFTER (With Clerk):
┌────────────────────────────────┐
│ jobseekers / employers         │
├────────────────────────────────┤
│ _id                            │
│ clerkId ★ (NEW)                │ ← From Clerk
│ name                           │
│ emailId                        │
│ password (hashed, optional)    │ ← Can be removed
│ userType                       │
│ profileImage                   │ ← Can come from Clerk
│ skills                         │
│ jobPreference                  │
│ authMethod ★ (NEW)             │ ← 'clerk' or 'password'
│ clerkConnected ★ (NEW)         │ ← Is account linked?
│ profileCompleted ★ (NEW)       │ ← Setup complete?
│ createdAt ★ (NEW)              │ ← When created
│ lastUpdated ★ (NEW)            │ ← Last update
│ ...other fields                │
└────────────────────────────────┘

★ = New fields added for Clerk integration
```

---

## Error Handling Flow

```
API Request with Clerk Token
        ↓
┌─────────────────────────────┐
│ ClerkAuthMiddleware         │
│ - Verify JWT                │
└─────┬───────────────────────┘
      ↓
   ┌─ Valid? ─ No → 403 Unauthorized
   │         
   Yes
   │
   ↓
ClerkAuthController
   ↓
┌────────────────────────────┐
│ Verify clerkId exists      │
│ Query MongoDB              │
└─────┬──────────────────────┘
      ↓
   ┌─ Found? ─ No → Create new user
   │
   Yes
   │
   ↓
Process Request
   ↓
┌────────────────────────────┐
│ Validate input data        │
└─────┬──────────────────────┘
      ↓
   ┌─ Valid? ─ No → 400 Bad Request
   │
   Yes
   │
   ↓
Update/Create in MongoDB
   ↓
┌────────────────────────────┐
│ Return result              │
└────────────────────────────┘
```

---

## Deployment Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      Production Deployment                      │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐      ┌─────────────────────────┐  │
│  │   Vercel (Frontend)     │      │  Render (Backend)       │  │
│  ├─────────────────────────┤      ├─────────────────────────┤  │
│  │ React SPA               │      │ Node.js Express         │  │
│  │ - Built with Vite       │      │ - REST API              │  │
│  │ - Deployed automatically│      │ - MongoDB connection    │  │
│  │   from Git              │      │ - Socket.io (optional)  │  │
│  │                         │      │                         │  │
│  │ Environment:            │      │ Environment:            │  │
│  │ VITE_API_URL=           │      │ CLERK_SECRET_KEY=       │  │
│  │ https://api.example.com │      │ sk_live_xxxxx           │  │
│  │ VITE_CLERK_PUBLISHABLE  │      │ CLERK_PUBLISHABLE_KEY=  │  │
│  │ _KEY=pk_live_xxxxx      │      │ pk_live_xxxxx           │  │
│  │                         │      │ MONGODB_URL=            │  │
│  │                         │      │ mongodb+srv://...       │  │
│  └────────┬────────────────┘      └────────┬────────────────┘  │
│           │                                │                    │
│           └────────────────┬───────────────┘                    │
│                            ↓                                    │
│        ┌──────────────────────────────────────┐                │
│        │   Clerk (External Service)           │                │
│        ├──────────────────────────────────────┤                │
│        │ - Authentication                     │                │
│        │ - Token generation                   │                │
│        │ - OAuth providers                    │                │
│        │ - Webhook delivery                   │                │
│        │                                      │                │
│        │ Configuration:                       │                │
│        │ - Domains added                      │                │
│        │ - OAuth apps configured              │                │
│        │ - Email templates set                │                │
│        └──────────────────────────────────────┘                │
│                                                                  │
│        ┌──────────────────────────────────────┐                │
│        │   MongoDB Atlas (Database)           │                │
│        ├──────────────────────────────────────┤                │
│        │ - jobseekers collection              │                │
│        │ - employers collection               │                │
│        │ - Other collections                  │                │
│        └──────────────────────────────────────┘                │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## Environment Setup Diagram

```
Configuration Files:

┌─────────────────────────────────────────┐
│ backend/.env (LOCAL DEVELOPMENT)        │
├─────────────────────────────────────────┤
│ NODE_ENV=development                    │
│ PORT=5001                               │
│ MONGODB_URL=mongodb://localhost:27017   │
│ JWT_SECRET=dev-secret                   │
│ FRONTEND_URL=http://localhost:3000      │
│ CLERK_SECRET_KEY=sk_test_xxxxx          │
│ CLERK_PUBLISHABLE_KEY=pk_test_xxxxx     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ frontend/.env (LOCAL DEVELOPMENT)       │
├─────────────────────────────────────────┤
│ VITE_API_URL=http://localhost:5001      │
│ VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx  │
└─────────────────────────────────────────┘

         ↓ Deploy ↓

┌─────────────────────────────────────────┐
│ Render Environment Variables             │
├─────────────────────────────────────────┤
│ NODE_ENV=production                     │
│ PORT=5001                               │
│ MONGODB_URL=mongodb+srv://...           │
│ CLERK_SECRET_KEY=sk_live_xxxxx          │
│ CLERK_PUBLISHABLE_KEY=pk_live_xxxxx     │
│ FRONTEND_URL=https://app.vercel.app     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Vercel Environment Variables             │
├─────────────────────────────────────────┤
│ VITE_API_URL=https://api.example.com    │
│ VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxx  │
└─────────────────────────────────────────┘
```

---

These diagrams provide a complete visual understanding of:
- How components interact
- Authentication flows
- System architecture
- Database schema changes
- Deployment setup

Refer to these diagrams when implementing or debugging the system!
