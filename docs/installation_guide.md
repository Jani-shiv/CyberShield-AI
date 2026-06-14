# Installation & Deployment Manual

CyberShield AI can be run locally on a developer host machine or inside containerized networks via Docker Compose.

---

## Method 1: Local Deployment (Bare-Metal)

### 1. Backend Setup
1. **Navigate to backend**:
   ```bash
   cd backend
   ```
2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. **Install python packages**:
   ```bash
   pip install -r ../requirements.txt
   ```
4. **Copy environmental configurations**:
   ```bash
   cp ../.env.example ../.env
   ```
5. **Run the Flask application gateway**:
   ```bash
   python app.py
   ```
   *Note: Server starts listening on `http://localhost:5000`*

### 2. Frontend Setup
1. **Navigate to frontend**:
   ```bash
   cd frontend
   ```
2. **Install Node packages**:
   ```bash
   npm install
   ```
3. **Launch the Vite development server**:
   ```bash
   npm run dev
   ```
   *Note: Vite opens local server on `http://localhost:3000` with requests automatically proxied to target backend on `5000`*

---

## Method 2: Containerized Deployment (Docker Compose)

Ensure you have Docker and Docker Compose configured on your host.

1. **Verify workspace root is configured** (ensure `docker-compose.yml` is present).
2. **Run compose build and start up**:
   ```bash
   docker-compose up --build
   ```
3. Docker starts:
   - **Frontend Container**: exposes interface on `http://localhost:3000`
   - **Backend Container**: maps REST api on `http://localhost:5000`
