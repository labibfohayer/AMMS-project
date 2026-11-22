<div align="center">

# 🎓 AMMS — Enterprise Educational Institution Management System
### Full-Stack Madrasah & School ERP with Automated WhatsApp Dispatches Powered by Django 6 & Next.js 16

[![Live Production Portal](https://img.shields.io/badge/Live%20Portal-almadinamadrasa.pages.dev-2E7D32?style=for-the-badge&logo=cloudflare&logoColor=white)](https://almadinamadrasa.pages.dev/)
[![Django 6](https://img.shields.io/badge/Django-6.0-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![WhatsApp Automation](https://img.shields.io/badge/WhatsApp-Automation-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/pedroslopez/whatsapp-web.js)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://almadinamadrasa.pages.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br/>

**[⚡ View Live Production Portal](https://almadinamadrasa.pages.dev/)** &nbsp;•&nbsp; **[📦 GitHub Repository](https://github.com/labibfohayer/AMMS-project)**

<br/>

<img src="assets/amms-showcase.png" alt="AMMS Showcase" width="100%" style="border-radius: 12px;"/>

</div>

---

## 📌 Architectural Overview

**AMMS (Al Modina Model Madrasah Management System)** is an enterprise-grade, full-stack educational institution management platform and Progressive Web Application (PWA). Designed to digitize the entire academic and financial lifecycle of educational institutions, AMMS automates student admissions, exam mark tabulation, fee collection, hostel management, and parent communications.

The architecture comprises a robust **Django 6 REST Framework** backend, an offline-capable **Next.js 16 (App Router)** PWA frontend, and an asynchronous **Node.js WhatsApp microservice** (`whatsapp-web.js`) dispatching real-time notifications directly to guardians.

---

## ⚡ Key Engineering Highlights

1. **Academic LMS & Exam Tabulation Engine:**
   - Multi-branch curriculum support (General Play-Class 6 and Islamic Hifz/Noorani programs).
   - Automated grade-sheet calculation and ReportLab PDF marksheet compilation.

2. **Financial Management & Accounting:**
   - Automated student fee billing, overdue tracking, voucher generation, and staff payroll ledgers.

3. **Guardian WhatsApp Alert Microservice:**
   - Event-driven notifications dispatched via WhatsApp for student absences, fee receipts, and official institutional circulars.

4. **Fine-Grained Role-Based Access Control (RBAC):**
   - JWT-authenticated portals tailored for Super Admins, Branch Directors, Teachers, and Guardians.

---

## 🛠️ Tech Stack & Production Architecture

| Component | Technologies | Purpose |
| :--- | :--- | :--- |
| **Backend Core** | Django 6, Django REST Framework, PostgreSQL | 12 discrete domain applications with RBAC and OpenAPI schemas |
| **Frontend PWA** | Next.js 16, React 19, TanStack Query, Tailwind | Offline-first progressive web application with instant hydration |
| **Messaging Service**| Node.js, Express, whatsapp-web.js | Automated parent notification gateway |
| **Document Engine** | Python ReportLab | Server-side cryptographic vector PDF report generation |
| **Edge CDN** | Cloudflare Pages, Edge Network | Low-latency static frontend delivery |

---

## 🚀 Getting Started & Local Development

```bash
# Clone the repository
git clone https://github.com/labibfohayer/AMMS-project.git
cd AMMS-project

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup (in a new terminal)
cd ../frontend
npm install
npm run dev
```

---

## 📄 License
This project is open-source and distributed under the [MIT License](LICENSE).
