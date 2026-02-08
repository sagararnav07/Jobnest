<p align="center">
  <img src="frontend/Screenshot/Screenshot%202026-01-06%20at%201.09.41%20AM.png" alt="JobNest Banner" width="100%" />
</p>

<h1 align="center">🏠 JobNest — AI-Powered Personality-Based Job Matching Platform</h1>

<p align="center">
  <strong>A full-stack MERN application that revolutionizes hiring by matching candidates to companies based on personality traits, not just resumes.</strong>
</p>

<p align="center">
  <strong>Created by:</strong> Arnav Sagar
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.IO-Real--time-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS%204-DaisyUI-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## 📌 About

**JobNest** is a production-grade job portal where candidates take a **Big Five (OCEAN) personality assessment** and get matched to employers based on personality compatibility — going beyond traditional keyword-based hiring. The platform features real-time messaging, PDF report generation, email notifications, and an AI chatbot assistant.

> **What makes this different?** Most job portals match on skills alone. JobNest scores candidates on **Openness, Conscientiousness, Extraversion, Agreeableness, and Neuroticism** — then uses a weighted algorithm (50% personality tags, 25% job preferences, 25% skills) to surface the best human-fit matches.

---

## ✨ Key Features

### 🧠 Personality-Based Matching (Core Feature)
- Big Five (OCEAN) personality assessment with **Likert scale** scoring
- Reverse-scored question handling for accuracy
- Weighted match algorithm (**50%** personality, **25%** preferences, **25%** skills)
- Auto-generated personality tags applied to both jobseekers and employers
- PDF assessment report with career recommendations via **PDFKit**
- Interactive results dashboard with **Recharts** (Pie + Radar charts)

### 🔐 Authentication & Security
- **Clerk SSO** integration (Google, GitHub, email/password)
- JWT-based session management with backend sync
- Role-based access control (Jobseeker vs. Employer)
- Protected route guards with optimistic loading from localStorage
- CAPTCHA verification and OTP email verification
- bcrypt password hashing (salt rounds: 11)

### 💬 Real-Time Messaging
- **Socket.IO** powered bi-directional chat
- Online/offline status indicators with green pulse
- Live typing indicators (debounced)
- Unread message count badges
- Conversation management (clear chat, delete conversations)
- Responsive split-pane layout (sidebar + chat window)

### 👤 Jobseeker Features
- Personalized dashboard with matched job count and quick stats
- AI-matched job discovery with multi-filter system (search, location, type, experience)
- List/Grid view toggle for job browsing
- One-click job applications with cover letter support
- Application tracking with color-coded status pipeline
- Resume & cover letter file uploads via **Multer**
- Social profiles management

### 🏢 Employer Features
- Command center dashboard with animated stat counters
- Full job CRUD (create, edit, delete postings)
- Interactive skills tag input with Enter-to-add
- Company logo upload with preview
- Applicant review with detailed modal views
- Status pipeline management (Applied → In Progress → Interview → Hired/Rejected)
- Email notifications on status changes

### 📧 Email Notifications
- **5-provider failover chain**: Elastic Email → Brevo → Mailjet → Resend → SMTP → console fallback
- Rich HTML email templates with gradient headers and responsive design
- Application confirmation and status change notifications

### 🤖 AI Chatbot
- **Botpress Webchat v3.3** integration as floating widget
- Context-aware job search assistance

### 🎨 UI/UX
- **Framer Motion** animations throughout (page transitions, staggered reveals, hover effects, floating particles)
- Video background hero on landing page
- Glassmorphism design elements
- Dark/Light theme toggle
- Fully responsive (mobile sidebar, adaptive chat layout)
- Error boundaries for graceful failure handling

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 7, React Router v7 |
| **Styling** | Tailwind CSS 4, DaisyUI 5, Framer Motion |
| **Charts** | Recharts (PieChart, RadarChart) |
| **Auth** | Clerk React SDK, JWT |
| **State Management** | React Context API (AuthContext, ChatContext) |
| **HTTP Client** | Axios with interceptors |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB with Mongoose 8 (indexed schemas) |
| **Real-Time** | Socket.IO 4 |
| **File Uploads** | Multer (disk storage, file type/size validation) |
| **PDF Generation** | PDFKit |
| **Email** | Nodemailer, Brevo, Mailjet, Resend, Elastic Email |
| **Chatbot** | Botpress Webchat SDK |
| **Deployment** | Docker, Docker Compose, Render, Vercel |
| **Dev Tools** | Nodemon, ESLint, Vite HMR |

---

## 📁 Project Structure

```
JobNest/
├── backend/
│   ├── Controllers/
│   │   ├── ApplicationController.js    # Job application lifecycle + email notifications
│   │   ├── AuthController.js           # Registration, login, JWT, CAPTCHA, OTP
│   │   ├── ClerkAuthController.js      # Clerk SSO sync + webhooks
│   │   ├── EmployeerController.js      # Employer profile + company management
│   │   ├── JobController.js            # Job CRUD + match scoring algorithm
│   │   ├── JobSeekerController.js      # Jobseeker profile + dashboard stats
│   │   ├── MessageController.js        # Real-time chat + conversation management
│   │   ├── QuizController.js           # OCEAN personality assessment engine
│   │   └── ViewJobController.js        # Job discovery with preference matching
│   ├── middewares/
│   │   ├── AuthMiddleware.js           # JWT verification + role extraction
│   │   └── ClerkAuthMiddleware.js      # Clerk token validation
│   ├── Routes/                         # RESTful API route definitions
│   ├── utlities/
│   │   ├── connection.js               # Mongoose schemas + DB connection
│   │   ├── emailService.js             # 5-provider email failover chain
│   │   ├── multerSetup.js              # File upload config (resume, logo)
│   │   ├── pdfReportGenerator.js       # PDFKit assessment report generator
│   │   ├── socketServer.js             # Socket.IO server + auth + events
│   │   └── Validation.js              # Input validation utilities
│   ├── data/
│   │   ├── Reports/                    # Generated PDF reports
│   │   └── Uploads/                    # User uploaded files
│   ├── Dockerfile
│   └── app.js                          # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/                        # Axios services (auth, jobseeker, employer, messaging, quiz)
│   │   ├── components/ui/              # 20+ reusable UI components
│   │   ├── contexts/                   # AuthContext (Clerk+JWT), ChatContext (Socket.IO)
│   │   ├── layouts/                    # DashboardLayout, AuthLayout, StaticLayout
│   │   ├── pages/
│   │   │   ├── auth/                   # LoginClerk, RegisterClerk, AuthCallback
│   │   │   ├── home/                   # Landing page with video hero
│   │   │   ├── jobseeker/              # Dashboard, Jobs, Assessment, Applications, Profile
│   │   │   ├── employer/               # Dashboard, Jobs, CreateJob, Applications, Profile
│   │   │   ├── messaging/              # Real-time chat interface
│   │   │   └── static/                 # About, Contact, FAQ, Privacy, Terms, Blog, Careers, Help
│   │   ├── router/                     # AppRouter + ProtectedRoute guards
│   │   └── hooks/                      # Custom hooks (useDebounce)
│   ├── Dockerfile
│   └── vite.config.js
│
├── docker-compose.yml                  # Full-stack Docker orchestration
├── render.yaml                         # Render deployment config
└── vercel.json                         # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **Clerk** account ([clerk.com](https://clerk.com)) for authentication

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jobnest.git
cd jobnest
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5001
MONGODB_URL=mongodb://127.0.0.1:27017/Jobnest
JWT_SECRET=your_jwt_secret

# Clerk Auth
CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Email (configure at least one provider)
ELASTIC_EMAIL_API_KEY=your_key
BREVO_API_KEY=your_key
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5001/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
```

Start the frontend:

```bash
npm run dev
```

### 4. Docker (Alternative)

```bash
docker-compose up --build
```

The app will be available at **http://localhost:5173** (frontend) and **http://localhost:5001** (API).

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/clerk/sync` | Sync Clerk user with backend |
| `POST` | `/api/v1/user/register` | Register (email/password) |
| `POST` | `/api/v1/user/login` | Login (email/password) |
| `GET` | `/api/v1/user/me` | Get current user profile |
| `POST` | `/api/v1/jobSeeker/updateProfile` | Update jobseeker profile (multipart) |
| `GET` | `/api/v1/jobSeeker/jobs` | Get personality-matched jobs |
| `GET` | `/api/v1/jobSeeker/dashboard` | Jobseeker dashboard stats |
| `GET` | `/api/v1/jobs` | List all jobs |
| `POST` | `/api/v1/jobs/create` | Create job posting |
| `PUT` | `/api/v1/jobs/:id` | Update job |
| `DELETE` | `/api/v1/jobs/:id` | Delete job |
| `POST` | `/api/v1/applications/apply/:jobId` | Apply for a job |
| `GET` | `/api/v1/applications/my-applications` | Jobseeker's applications |
| `PUT` | `/api/v1/applications/:id/status` | Update application status |
| `GET` | `/api/v1/quiz/questions` | Get assessment questions |
| `POST` | `/api/v1/quiz/submit` | Submit assessment answers |
| `GET` | `/api/v1/messages/conversations` | Get all conversations |
| `POST` | `/api/v1/messages/send` | Send a message |
| `GET` | `/health` | Health check |

---

## 🧪 Matching Algorithm

```
Match Score = (Tag Match × 0.50) + (Preference Match × 0.25) + (Skill Match × 0.25)
```

1. **Personality Tag Match (50%)** — Overlap between jobseeker's OCEAN-derived tags and employer's culture tags
2. **Job Preference Match (25%)** — Work style compatibility (Day Shift, Remote, Hybrid, etc.)
3. **Skills Match (25%)** — Technical skills overlap between candidate and job requirements

Jobs are sorted by match score (highest first), ensuring the best personality-fit opportunities surface at the top.

---

## 📊 Personality Assessment (OCEAN Model)

| Trait | Description | Career Mapping |
|-------|-------------|----------------|
| **O** — Openness | Creativity, curiosity, imagination | Design, Research, Innovation roles |
| **C** — Conscientiousness | Organization, discipline, reliability | Management, Finance, Operations |
| **E** — Extraversion | Social energy, assertiveness, enthusiasm | Sales, Marketing, Leadership |
| **A** — Agreeableness | Cooperation, empathy, teamwork | HR, Customer Service, Healthcare |
| **N** — Neuroticism | Emotional sensitivity, attention to detail | Support roles, Detail-oriented work |

The assessment generates a downloadable **PDF report** with:
- Personality profile bar charts
- Top personality traits visualization
- Career recommendations based on trait combinations
- Job match scores mapped from personality profile

---

## 🖼️ Screenshots

<p align="center">
  <img src="frontend/Screenshot/Screenshot%202026-01-06%20at%201.09.41%20AM.png" alt="JobNest Home" width="80%" />
</p>

<p align="center">
  <img src="frontend/Screenshot/Screenshot%202026-01-06%20at%201.09.49%20AM.png" alt="JobNest Dashboard" width="80%" />
</p>

---

## 🐳 Deployment

| Platform | Config File | Notes |
|----------|-------------|-------|
| **Docker** | `docker-compose.yml` | Full-stack with MongoDB, backend, frontend (Nginx) |
| **Render** | `render.yaml` | Backend as web service |
| **Vercel** | `vercel.json` | Frontend SPA deployment |

---

## 📄 License

ISC License

---

<p align="center">
  Built with ❤️ by <strong>Arnav Sagar</strong> using the MERN Stack
  <br /><br />
  <strong>⭐ Star this repo if you find it useful!</strong>
</p>
