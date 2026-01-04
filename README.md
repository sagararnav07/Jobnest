# JobNest 🏠💼

A modern full-stack job portal platform connecting job seekers with employers.

**Created by:** Arnav Sagar

---

## 📋 Overview

JobNest is a comprehensive job portal application that bridges the gap between job seekers and employers. The platform offers a seamless experience for job hunting and recruitment, featuring real-time messaging, skill assessments, and an intelligent matching system.

### Key Features

**For Job Seekers:**
- 🔍 Browse and search job listings with advanced filters
- 📝 Apply to jobs with resume and cover letter uploads
- 🧠 Take personality/skill assessments to match with suitable roles
- 📊 Get personalized job recommendations based on assessment results
- 💬 Real-time messaging with employers
- 📄 Auto-generated PDF assessment reports

**For Employers:**
- 📢 Post and manage job listings
- 👥 Review and manage applications
- 📋 View candidate profiles, resumes, and assessment scores
- 💬 Direct messaging with applicants
- 🏷️ Tag-based candidate matching

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| DaisyUI | UI Components |
| Framer Motion | Animations |
| React Router | Routing |
| Socket.io Client | Real-time Communication |
| Recharts | Data Visualization |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express 5 | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |
| Socket.io | Real-time Communication |
| JWT | Authentication |
| Nodemailer | Email Service |
| PDFKit | PDF Generation |
| Multer | File Uploads |
| bcryptjs | Password Hashing |

## 📁 Project Structure

```
jobnest-main/
├── backend/
│   ├── Controllers/       # Business logic
│   ├── Routes/           # API endpoints
│   ├── models/           # Database schemas
│   ├── middlewares/      # Auth & other middleware
│   ├── utilities/        # Helper functions
│   ├── data/             # Uploads & reports storage
│   └── app.js            # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/          # API service layer
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React context providers
│   │   ├── hooks/        # Custom hooks
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Route pages
│   │   ├── router/       # App routing
│   │   └── utils/        # Helper utilities
│   └── public/           # Static assets
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/jobnest.git
   cd jobnest-main
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5001
   MONGODB_URL=mongodb://127.0.0.1:27017/Jobnest
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=10h
   FRONTEND_URL=http://localhost:5173
   
   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # reCAPTCHA (optional)
   RECAPTCHA_SECRET_KEY=your_recaptcha_key
   SKIP_CAPTCHA=true
   ```

4. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Run the Application**

   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

   Start the frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5001/api/v1

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/user/auth/signup` | Register new user |
| POST | `/api/v1/user/auth/login` | User login |
| POST | `/api/v1/user/auth/send-otp` | Email verification |
| GET | `/api/v1/jobs` | Get all jobs |
| POST | `/api/v1/jobs` | Create job (employer) |
| POST | `/api/v1/applications` | Apply for job |
| GET | `/api/v1/quiz/questions` | Get assessment questions |
| POST | `/api/v1/quiz/submit` | Submit assessment |
| GET | `/api/v1/messages` | Get conversations |

## ✨ Features in Detail

### 🔐 Authentication
- Email OTP verification for registration
- JWT-based session management
- Password encryption with bcrypt
- Role-based access control (Job Seeker / Employer)

### 💬 Real-time Messaging
- WebSocket-based instant messaging
- Online/offline status indicators
- Typing indicators
- Message persistence

### 📊 Skill Assessment
- Personality and skill-based questionnaire
- Automatic tag generation based on responses
- PDF report generation with results
- Job matching based on assessment tags

### 📄 File Management
- Resume and cover letter uploads (PDF, DOC, DOCX)
- Secure file storage
- Downloadable assessment reports

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

---

**Made with ❤️ by Arnav Sagar**
# Jobnest
