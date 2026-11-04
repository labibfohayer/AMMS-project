# AMMS - Al Modina Model Madrasah & Research Institute Management System

An enterprise-grade, full-stack educational institution management platform and Progressive Web Application (PWA). Engineered with a Django REST Framework backend, a Next.js 16 frontend, and a Node.js WhatsApp automation microservice.

---

## Project Overview

AMMS (Al Modina Model Madrasah Management System) is an integrated digital management system designed to automate administrative, academic, financial, and communication workflows for educational institutions. The platform centralizes student admissions, academic record keeping, daily attendance, examination tabulation, automated fee collection, hostel and library management, and real-time guardian notifications dispatched via WhatsApp.

---

## System Architecture

The application is structured into three decoupled, production-ready modules:

1. Backend Core (`/backend`): High-performance Django REST Framework API powering 12 discrete domain applications with role-based access control (RBAC), JSON Web Token (SimpleJWT) authentication, ReportLab automated PDF report generation, and OpenAPI/Swagger schema documentation.
2. Frontend Application (`/frontend`): Progressive Web Application built with Next.js 16 (App Router), React 19, TanStack React Query, and Tailwind CSS, featuring full offline capability, responsive mobile-first views, and smooth scroll kinematics.
3. WhatsApp Messaging Microservice (`/whatsapp-service`): Node.js background service utilizing `whatsapp-web.js` to dispatch real-time attendance alerts, examination marksheets, and fee payment receipts directly to parent mobile numbers.

---

## Key Features & Core Domain Modules

The backend architecture is organized into modular Django applications:

- `academic`: Class definitions, section allocations, subject assignments, curriculum schedules, and academic session transitions.
- `accounts`: User authentication, JWT issuance and refresh, role-based authorization (Super Admin, Principal, Teacher, Accountant, Student, Guardian).
- `attendance`: Daily student and staff biometric/manual attendance logging, leave application processing, and real-time absentee calculations.
- `exams`: Examination schedule configuration, grade scales, continuous assessments, mark sheets, and automated GPA calculation.
- `fees`: Customized fee categories, tuition invoices, online/offline payment processing, discount policies, and automated receipt issuance.
- `hostel`: Dormitory management, room allocations, occupancy tracking, and meal/boarding coordination.
- `library`: ISBN book cataloging, borrow/return lifecycle logs, automated late fine computations, and inventory auditing.
- `notices`: Institutional announcements, circular publishing, and audience-targeted noticeboard feeds.
- `notifications`: Internal application alerts and dispatch hooks for the WhatsApp messaging service.
- `reports`: Dynamic PDF generation using ReportLab (Tabulation sheets, student transcripts, fee vouchers, and monthly financial summaries) and Excel data exports via openpyxl.
- `students`: Admission workflows, guardian records, document storage, and academic progression history.
- `teachers`: Faculty records, salary grading, subject specializations, and weekly timetable scheduling.

---

## Tech Stack

### Backend
- Framework: Django 6.x and Django REST Framework 3.18
- Authentication: SimpleJWT (JSON Web Tokens)
- Database: PostgreSQL (Production) / SQLite (Development)
- Document Generation: ReportLab (PDFs), openpyxl (Excel)
- Documentation: drf-spectacular (OpenAPI 3.0 / Swagger UI)
- Production Server: Gunicorn and WhiteNoise static asset compression

### Frontend
- Framework: Next.js 16.3.5 (App Router)
- UI Library: React 19.2.8
- Server State: TanStack React Query v5
- Styling: Tailwind CSS 3.4 and PostCSS
- PWA Engine: next-pwa (Service workers and offline caching)
- Motion and Feedback: Lenis Smooth Scroll, React Hot Toast, Lucide React

### Notification Microservice
- Runtime: Node.js 18+
- Automation: whatsapp-web.js and Express

---

## Directory Structure

```
AMMS-project/
├── backend/
│   ├── apps/
│   │   ├── academic/          # Classes, subjects, and schedules
│   │   ├── accounts/          # RBAC and JWT authentication
│   │   ├── attendance/        # Student & teacher attendance records
│   │   ├── exams/             # Exam scheduling, marking, and GPA
│   │   ├── fees/              # Student billing and payment ledgers
│   │   ├── hostel/            # Room allocations and dorm management
│   │   ├── library/           # Book inventory and borrowing logs
│   │   ├── notices/           # Institutional circulars and news
│   │   ├── notifications/     # Event dispatchers for external webhooks
│   │   ├── reports/           # ReportLab PDF & openpyxl generators
│   │   ├── students/          # Student registration and records
│   │   └── teachers/          # Faculty roster and scheduling
│   ├── config/                # Django project settings and root URLs
│   ├── manage.py              # Django management executable
│   ├── requirements.txt       # Python backend dependencies
│   └── .env.example           # Backend environment configuration template
├── frontend/
│   ├── app/                   # Next.js App Router pages and layouts
│   ├── components/            # Reusable UI widgets and data tables
│   ├── hooks/                 # React Query data fetching hooks
│   ├── package.json           # Frontend dependencies and scripts
│   └── tailwind.config.js     # Tailwind design system configuration
├── whatsapp-service/
│   ├── index.js               # WhatsApp bot client and Express webhook listener
│   └── package.json           # Microservice dependencies
├── DEPLOY_GUIDE.md            # Detailed production deployment manual
└── render.yaml                # Infrastructure-as-code blueprint for Render
```

---

## Installation and Setup Guide

### Prerequisites
- Python 3.11 or higher
- Node.js 18.x or higher
- PostgreSQL (or local SQLite)

### 1. Clone the Repository
```bash
git clone https://github.com/labibfohayer/AMMS-project.git
cd AMMS-project
```

### 2. Backend Setup (Django)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

pip install -r requirements.txt
cp .env.example .env      # Configure your database and secret keys
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
The Django REST API will be accessible at `http://localhost:8000`. Swagger documentation is available at `http://localhost:8000/api/schema/swagger-ui/`.

### 3. Frontend Setup (Next.js)
```bash
cd ../frontend
npm install
npm run dev
```
The frontend portal will be live at `http://localhost:3000`.

### 4. WhatsApp Service Setup (Optional)
```bash
cd ../whatsapp-service
npm install
npm start
```
Scan the terminal-generated QR code using the institution's official WhatsApp application to link the notification service.

---

## Production Deployment

- Backend: Deployable to Render or any standard Linux VPS via Gunicorn and PostgreSQL. Configuration blueprints are provided in `render.yaml` and `DEPLOY_GUIDE.md`.
- Frontend: Deployable to Vercel or Cloudflare Pages with automatic edge CDN routing.
- Database: Managed PostgreSQL instance (e.g., Render Postgres, Supabase, or AWS RDS).

---

## Author and Contact

Architected and developed by **Labib Fohayer**.

- GitHub: [https://github.com/labibfohayer](https://github.com/labibfohayer)
- Portfolio: [https://labibfohayer.github.io](https://labibfohayer.github.io)

---

## License

All rights reserved. Designed and engineered for Al Modina Model Madrasah and Research Institute.
