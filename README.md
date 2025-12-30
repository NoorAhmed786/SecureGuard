# SecureGuard AI – Next-Gen Cybersecurity SaaS 🛡️

SecureGuard AI is a high-performance, premium-grade SaaS platform designed to protect organizations from modern cyber threats. It features **real-time phishing defense**, a **unified security scanner**, a **RAG-powered AI Security Assistant**, and **interactive awareness training**.

![Main Interface](screenshots/home.png)

Designed for **visual excellence**, **high-speed performance**, and **Clean Architecture**.

---

## 🚀 Quick Start (Dockerized)

The fastest way to get SecureGuard running is using Docker. This starts the Frontend, Backend, and PostgreSQL database with a single command.

### 1. Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed and running.

### 2. Launch
```bash
# Clone the repository
git clone https://github.com/NoorAhmed786/SecureGuard.git
cd SecureGuard

# Start the entire stack
docker-compose up --build
```
> [!NOTE]
> - **Frontend**: [http://localhost:3000](http://localhost:3000)
> - **Backend (API Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📸 Platform Showcase

### 🖥️ Dashboard & Command Center
A premium dashboard providing real-time metrics, threat visualizations, and actionable insights.
![Dashboard](screenshots/dashboard.png)

### 🛡️ Unified Security Scanner
Analyze suspicious emails for phishing and scan public-facing websites for vulnerabilities.
![Scanner](screenshots/scanner.png)

### 🤖 AI Security Assistant (RAG)
An intelligent security companion that can answer technical questions and analyze threats based on a proprietary knowledge base.
![AI Assistant](screenshots/rag.png)

### 🚨 Real-time Alerts
Instant notifications delivered to the Dashboard whenever a threat is detected.
![Alerts](screenshots/alerts.png)

### 🎓 Cybersecurity Awareness Training
Interactive courses to educate employees about modern security threats.
![Courses](screenshots/courses.png)

### 🔌 Edge Protection Widget
Lightweight JavaScript snippet to protect client websites at the edge.
![Widget](screenshots/widget.png)

### 💳 Subscription & Payments
Stripe-integrated billing for seamless enterprise scaling.
![Payment](screenshots/payment.png)

---

## 🏛️ Engineering & Architecture

This project is built for scale and maintainability, strictly adhering to **SOLID principles** and **Layered Clean Architecture**.

### Architecture Layers:
- **Application Layer**: Business use cases and REST API routers (FastAPI).
- **Infrastructure Layer**: Technical implementations—PostgreSQL (SQLAlchemy), Stripe, AI Providers, and Security Scanners.
- **Domain Layer**: Core business entities and logic (Pydantic schemas/models).

### Tech Stack
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy | High-performance async API |
| **Frontend** | Next.js 14+, React, TypeScript | Modern SPA with SSR |
| **Database** | PostgreSQL | Persistent data storage |
| **UI/UX** | Tailwind CSS, Framer Motion | Premium, fluid animations |
| **AI/ML** | Scikit-learn, VectorStore | Phishing detection & RAG |

---

## 🛠️ Manual Developer Setup

If you prefer to run services locally without Docker:

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Linux: source venv/bin/activate
pip install -r requirements.txt
# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and delivery. The pipeline is defined in `.github/workflows/main.yml`.

### Workflow Stages
1.  **Backend Quality**:
    - Installs Python dependencies.
    - Runs `ruff` for fast linting and code quality checks.
2.  **Frontend Quality**:
    - Installs Node.js dependencies.
    - Runs `npm run lint` (ESLint) to ensure type safety and code quality.
3.  **Build & Publish**:
    - **Trigger**: Only on push to `main` branch.
    - Builds production-ready Docker images for Frontend and Backend.
    - Pushes images to **GitHub Container Registry (GHCR)**.

### 🚀 How to Run
The pipeline is **automatic**. To trigger a full build and deployment:
```bash
git add .
git commit -m "feat: your amazing change"
git push origin main
```
Monitor the progress in the **Actions** tab of your GitHub repository.

> [!IMPORTANT]
> Ensure all linting checks pass locally before pushing code.
> - **Backend**: `cd backend && ruff check .`
> - **Frontend**: `cd frontend && npm run lint`

### ✅ Project Verification Checks
The following checks were implemented and passed to ensure a robust deployment:
| Component | Check Type | Tool | Command | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Backend** | Linting & Style | `ruff` | `ruff check .` | ✅ Passed |
| **Frontend** | Static Analysis | `ESLint` | `npm run lint` | ✅ Passed |
| **Frontend** | Compilation | `Next.js` | `npm run build` | ✅ Passed |

---

## 📂 Project Structure
```text
SecureGuard/
├── backend/            # FastAPI source code & Dockerfile
├── frontend/           # Next.js source code & Dockerfile
├── screenshots/        # UI screenshots & assets
├── docker-compose.yml  # Multi-container orchestration
└── README.md           # This file
```

---

## 📸 Final UI Reference
Built with a professional dark theme, glassmorphism, and smooth animations.
![Login Page](screenshots/login.png)

---

## ⚖️ License
Licensed under the **MIT License**.

*Built for Security. Designed for Excellence.* 🛡️
