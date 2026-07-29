# Kampala Capital City Authority (KCCA) Internship Management System

A modern, responsive, and accessible government portal frontend and monorepo backend for Kampala Capital City Authority (KCCA).

## Tech Stack

### Frontend
- **Framework**: React.js 18 + Vite
- **Styling**: Tailwind CSS (v3) + Framer Motion Animations
- **Icons**: Lucide Icons
- **Routing**: React Router v6
- **Form Management**: React Hook Form + Zod
- **Analytics**: Chart.js + react-chartjs-2
- **Authentication**: JWT Token Simulation & Role-based Access Control

### User Roles & Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| **Applicant** | `applicant@kcca.go.ug` | `password123` |
| **HR Officer** | `hr@kcca.go.ug` | `password123` |
| **System Administrator** | `admin@kcca.go.ug` | `password123` |

## Getting Started

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

## Features Included
- **Landing Page**: Hero banner, live stats, feature cards, department tags, open vacancies preview, testimonials, footer.
- **Authentication**: Role-based Login, Registration, Password Reset, Email Verification OTP.
- **Applicant Portal**: Dashboard matching reference design, Internship browser with search & filters, 5-Step Application Wizard, Application Timeline & Offer download, Interview Module, Document Repository, Messaging, Profile editor, Settings, Notifications.
- **HR Officer Portal**: Dashboard with KPI cards & Chart.js visualizations, Internship posting CRUD, Advanced Application filtering & bulk actions, Interview scheduling with SMS/Email reminders, PDF/Excel/CSV report generation.
- **System Admin Portal**: Role & Permissions matrix, User management, Audit trail logs, System backup & database restore.
