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
-- **Authentication**: Role-based Login, Registration, Password Reset.
- **Applicant Portal**: Dashboard matching reference design, Internship browser with search & filters, 5-Step Application Wizard, Application Timeline & Offer download, Interview Module, Document Repository, Messaging, Profile editor, Settings, Notifications.
- **HR Officer Portal**: Dashboard with KPI cards & Chart.js visualizations, Internship posting CRUD, Advanced Application filtering & bulk actions, Interview scheduling with SMS/Email reminders, PDF/Excel/CSV report generation.
- **System Admin Portal**: Role & Permissions matrix, User management, Audit trail logs, System backup & database restore.

## Deployment

Quick steps to run with Docker Compose (recommended for production-like local testing):

1. Copy `.env.example` to `backend/.env` and fill required values (especially `DATABASE_URL`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`).

2. Start services:

```bash
docker-compose up --build -d
```

3. Backend will be available on `http://localhost:5000` and frontend on `http://localhost:5173` (or `5175` if port shift occurs).

Running migrations:

Place SQL migration files under `database/migrations/` and use the included `backend/scripts/run_migration.js` script (requires `DATABASE_URL` set) to apply them.

Notes:
- Ensure `JWT_SECRET` is set to a strong secret in production.
- For SMTP, prefer a dedicated email service or Gmail App Password with `SMTP_HOST`/`SMTP_PORT` configured.

## CI/CD & Kubernetes

- CI now includes image build & push and a migrations job; configure repository secrets:
	- `GITHUB_TOKEN` (provided by GitHub Actions automatically) is used to push to GitHub Container Registry (GHCR).
	- `DATABASE_URL` — required for the migrations job.
	- For publishing to external registries (Docker Hub) add suitable secrets.

To deploy to Kubernetes (example):
1. Create namespace and secrets from `k8s/secret.yaml.template` (fill values).
2. Apply manifests:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/ingress.yaml
```

You'll need an ingress controller (e.g. nginx) and DNS pointing `kcca.example.com` to the ingress.
