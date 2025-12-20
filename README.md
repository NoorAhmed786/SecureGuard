# SecureGuard AI – Enterprise Cybersecurity Platform 🛡️

SecureGuard AI is a high-performance, premium-grade SaaS platform designed to protect organizations from modern cyber threats. It features **real-time phishing defense**, **automated website vulnerability scanning**, a **RAG-powered AI Security Assistant**, and an **interactive employee training module**.

The platform is designed with a focus on **visual excellence**, **high-speed performance**, and **enterprise-scale architecture**.

---

## 🏛️ Project Highlights & Architecture
The project follows a **Layered Clean Architecture** inspired by Hexagonal (Ports & Adapters) patterns and strictly adheres to **SOLID principles** for maximum maintainability and testability.

### Key Components:
- **Responsive Frontend**: Next.js 16 with a professional "no-scroll" hero UI and premium glass-morphism.
- **Robust Backend**: Asynchronous FastAPI service with a clean separation of concerns.
- **AI Integration**: Custom RAG (Retrieval-Augmented Generation) for intelligent security assistance.
- **Enterprise Security**: Automated vulnerability scanning and a real-time threat stream.
- **Developer First**: Fully documented with a focus on clean code and design patterns.

### SOLID Implementation:
- **S**RP: Distinct modules for Auth, Payments, Scanning, and AI.
- **O**CP: Pluggable provider system for Security Scanners and AI engines.
- **L**SP: Standardized interfaces for interchangeable infrastructure adapters.
- **I**SP: Specialized API routers ensuring clients only interact with relevant endpoints.
- **D**IP: High-level logic depends on abstractions, not low-level database details.

---

## ✨ Features Walkthrough
- **Smart Auth Gating**: Intelligent redirection logic that remembers user intent and sends them straight to their destination post-login.
- **Live Interactive Demo**: A sandbox environment for visitors to experience the AI Assistant and Scanner without an account.
- **Real-time Threat Stream**: Live visual indicators of blocks and mitigations within the platform.
- **Embeddable Protection**: A lightweight JavaScript widget to protect client websites at the edge.

---

## 🚀 Quick Start (Local Setup)

### 1. Requirements
- **Node.js**: ≥ 20
- **Python**: ≥ 3.11
- **Docker**: Optional (for containerized deployment)

### 2. Backend Setup
From the **root directory**:
```powershell
# Install dependencies
pip install -r backend/requirements.txt

# Run the backend (Windows compatible)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Enterprise Docker Deployment
The platform is fully containerized for production reliability using multi-stage builds and optimized images.

### 1. Launch the Full Stack
Run the entire environment (Frontend, Backend, Postgres, Redis) with a single command:
```bash
docker-compose up --build
```

### 2. Implementation Details
- **Frontend Optimization**: Uses Next.js **Output Standalone** mode to reduce production image size by over 80%.
- **Backend package isolation**: Configured to maintain internal dependency structures within the container.
- **Persistent Storage**: Production-ready PostgreSQL 15 configuration with managed volumes.
- **Service Orchestration**: Healthcheck-aware dependencies ensuring stable startup.

This will launch the **FastAPI Backend (8000)** and the **Next.js Frontend (3000)** simultaneously.


---

## 📸 UI Reference
The platform features a professional, centered hero section with a dynamic background matching the sleek authentication suite.

![SecureGuard UI](file:///C:/Users/FC/.gemini/antigravity/brain/7546a492-0574-40d4-b461-fa281449f305/home_page_1766180016525.png)

---

## ⚖️ License
Licensed under the **MIT License**.

*Built for Security. Designed for Excellence.* 🛡️
