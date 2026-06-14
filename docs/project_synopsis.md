# Project Synopsis: CyberShield AI

## 1. Project Title
**CyberShield AI – Intelligent Website Security Assessment and Vulnerability Scanner**

## 2. Category
- Web Application Security
- Automated Security Assessment
- Penetration Testing & Vulnerability Analysis

## 3. Problem Statement
Modern web infrastructures face continuous, automated scans from malicious threat actors searching for code injections, exposed configs, directory indexes, and insecure HTTP response profiles. Small organizations and academic teams lack access to easy-to-use, high-fidelity security assessment panels that highlight web vulnerabilities and compile downloadable, printable compliance auditing reports out of the box.

## 4. Proposed Solution
CyberShield AI is built as a responsive, dark-themed SaaS website security scanner platform. Authorized candidates can trigger dynamic sweeps checking:
1. **SSL/TLS Certificates validity**: parsing expiries and certification authorities.
2. **HTTP Security Response Headers configuration**: flagging missing properties (CSP, HSTS, X-Frame-Options, Permissions-Policy).
3. **Common Script Injections**: scanning input forms for Reflected Cross-Site Scripting (XSS) and SQL Injection entrypoints.
4. **Directory Leak Detection**: checking common exposed folders (`/admin`, `/.git`, `/backup`).
5. **Open Network Port Services**: executing rapid multi-thread TCP socket connections checks.

All findings are mapped into a standardized risk matrix score (0-100) and compiled into professional, printable PDF assessment documents suited for MSc Cyber Security thesis panels.

## 5. System Architecture
```
+--------------------------------------------------------+
|                      React Client                      |
+--------------------------------------------------------+
                           |
            (JWT Authentication / REST Requests)
                           v
+--------------------------------------------------------+
|                 Flask API Router App                   |
+--------------------------------------------------------+
             |                                |
   (SQLAlchemy CRUD)                (Scan Sweeps)
             v                                v
+--------------------------+    +------------------------+
|    SQLite Database       |    |  Vulnerability Scanner |
+--------------------------+    +------------------------+
                                             |
                                 (TCP Check / HTTP Requests)
                                             v
                                +------------------------+
                                |     Target Website     |
                                +------------------------+
```

## 6. Project Modules
1. **User Authentication Module**: Registration and login validations with password hashing and JWT scopes.
2. **Vulnerability Scanning Engine**: Evaluates HTTPS security and injection vulnerabilities.
3. **Network Port Scopes**: Scans TCP services with host fail-safes.
4. **Risk Calculations Engine**: Evaluates risk score matrixes.
5. **Report Compiler**: Outputs formatted PDFs via ReportLab.
6. **Admin Control Dashboard**: Database maintenance portal.
