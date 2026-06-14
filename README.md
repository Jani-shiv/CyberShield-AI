# CyberShield AI – Website Security Vulnerability Assessment & Scanner

CyberShield AI is a modern SaaS-style web security application built for MSc Cyber Security final year project portfolios. It performs deep vulnerability checks against target websites, calculates dynamic risk parameters, and compiles professional printable PDF reports.

## Features
- **User Authentication**: Login, signup, password resets, and session management using cryptographically hashed values and JWT tokens.
- **Dynamic Threat Scanner**: Evaluates target hosts for SSL certificates validity, HTTP security headers configuration, script injections (SQLi, XSS), open redirects, directory brute-force, and TCP network port listening services.
- **Interactive Security Dashboard**: Visualizes scan counts, risk classifications, and threat progression graphs using Recharts.
- **Thesis-Ready Reports**: Generates formal university format PDF reports via ReportLab, complete with student/guide placeholders.
- **Administrative Control Panel**: Monitors user accounts and database records.

---

## Technical Specifications
- **Frontend**: React.js, Vite, TypeScript, Tailwind CSS, Recharts, Framer Motion, Lucide icons.
- **Backend**: Python Flask REST API, SQLAlchemy, Werkzeug.
- **Database**: SQLite (local server database).
- **Deployment**: Docker, Docker Compose.

---

## Quick Start (Local)

### Step 1: Run Backend API
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix: source venv/bin/activate
pip install -r ../requirements.txt
python app.py
```

### Step 2: Run Frontend UI
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` inside your browser to start.

---

## Containerized Deployment (Docker Compose)
To run frontend and backend in unified networks:
```bash
docker-compose up --build
```
Access portal on `http://localhost:3000`.

---

## Documentation Referrals
For detailed academic writeups, review the documents:
- [Project Synopsis](file:///e:/All%20About%20Brand/yagnik/docs/project_synopsis.md)
- [System Architecture](file:///e:/All%20About%20Brand/yagnik/docs/system_architecture.md)
- [API Specifications](file:///e:/All%20About%20Brand/yagnik/docs/api_documentation.md)
- [Installation Guide](file:///e:/All%20About%20Brand/yagnik/docs/installation_guide.md)
