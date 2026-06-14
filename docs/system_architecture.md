# System Architecture & Technical Specifications

This document defines the architectural components, database schema configurations, and scanning routines for CyberShield AI.

## 1. Technological Architecture

```
                                +-------------------+
                                |   Web Browser     |
                                | (React Frontend)  |
                                +-------------------+
                                          |
                                    HTTPS Request
                                          v
                                +-------------------+
                                |    API Gateway    |
                                |  (Flask Backend)  |
                                +-------------------+
                                  /               \
                            Database Queries   HTTP Checks / Socket Scans
                                /                   \
                               v                     v
                    +--------------------+     +-------------------+
                    |   SQLite Database  |     |   Target Server   |
                    +--------------------+     +-------------------+
```

- **Frontend**: Designed using Vite React.js with TypeScript for static bundle efficiency. Uses Tailwind CSS for CSS themes, Lucide-React for interface vectors, Framer Motion for slide animations, and Recharts for dashboard analytics.
- **Backend**: Built using a lightweight Python Flask REST structure. Uses SQLAlchemy as an Object Relational Mapper (ORM), Werkzeug for cryptographically secure hashing, and Flask-JWT-Extended for token scopes.
- **Scanning engine**: Requests and socket bindings are completed via Python's standard `requests`, `ssl`, and `socket` modules.
- **Reporting engine**: Compiles layout structures via ReportLab canvas blocks.

## 2. Database Models (SQLite)

### Users Table
- `id` (INTEGER, Primary Key)
- `username` (VARCHAR, Unique, Nullable=False)
- `email` (VARCHAR, Unique, Nullable=False)
- `password_hash` (VARCHAR, Nullable=False)
- `role` (VARCHAR, Default='user')
- `created_at` (DATETIME, Default=utcnow)

### Scans Table
- `id` (INTEGER, Primary Key)
- `user_id` (INTEGER, ForeignKey -> users.id)
- `target_url` (VARCHAR, Nullable=False)
- `risk_score` (INTEGER, Default=0)
- `risk_level` (VARCHAR, Default='Low')
- `status` (VARCHAR, Default='Pending')
- `created_at` (DATETIME, Default=utcnow)
- `results_json` (TEXT, Nullable=True)

## 3. Data Integrity & Security Controls
- **Password Protection**: Hashed using PBKDF2 with HMAC-SHA256 (Werkzeug native generator).
- **Session Scopes**: Access tokens expire after a predefined duration (default 15 minutes), requiring token refreshment or re-authentication.
- **Scan Sanitization**: Targets are validated via standard URL formats before requests are dispatched, mitigating server-side request forgery (SSRF) risks on internal subnets.
