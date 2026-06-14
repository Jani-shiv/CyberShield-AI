# API Specifications & Endpoint Mappings

All REST requests to the Flask gateway must use JSON payloads. Protected routes require authorization tokens inside the standard authorization header (`Authorization: Bearer <JWT_TOKEN>`).

---

## 1. Authentication Blueprint (`/api/auth`)

### Register Account
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "username": "candidate01",
    "email": "candidate01@msc-university.edu",
    "password": "strongPassword123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "username": "candidate01",
      "email": "candidate01@msc-university.edu",
      "role": "admin",
      "created_at": "2026-06-14T13:42:19"
    }
  }
  ```

### User Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "email": "candidate01@msc-university.edu",
    "password": "strongPassword123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "candidate01",
      "email": "candidate01@msc-university.edu",
      "role": "admin",
      "created_at": "2026-06-14T13:42:19"
    }
  }
  ```

---

## 2. Scan Engine Blueprint (`/api/scans`)

### Trigger Vulnerability Sweep
- **URL**: `/api/scans`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Payload**:
  ```json
  {
    "target_url": "https://example.com"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "target_url": "https://example.com",
    "risk_score": 45,
    "risk_level": "High",
    "status": "Completed",
    "created_at": "2026-06-14T13:45:00",
    "results": { ... }
  }
  ```

### Download PDF Compliance Report
- **URL**: `/api/scans/<scan_id>/report`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters**:
  - `student_name` (optional): "Student Name Placeholder"
  - `guide_name` (optional): "Advisor Name"
- **Response**: Returns a downloadable standard lettersize PDF binary `application/pdf`.

---

## 3. Administrative Operations (`/api/admin`)

### List Users
- **URL**: `/api/admin/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Response (200 OK)**: Returns list of user objects.
