# SecureGuard AI – Next-Gen Cybersecurity SaaS 🛡️

SecureGuard AI is a high-performance, premium-grade SaaS platform designed to protect organizations from modern cyber threats. It features **real-time phishing defense**, a **unified security scanner**, a **RAG-powered AI Security Assistant**, and **interactive awareness training**.

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

## 📂 Project Structure
```text
SecureGuard/
├── backend/            # FastAPI source code & Dockerfile
├── frontend/           # Next.js source code & Dockerfile
├── docker-compose.yml  # Multi-container orchestration
└── README.md           # This file
```

---

## ✨ Key Features
- **🛡️ Unified Security Scanner**: Analysis of emails and websites for vulnerabilities.
- **🚨 Real-time Phishing Alerts**: WebSocket-based notifications.
- **🤖 RAG-powered AI Assistant**: Context-aware security intelligence.
- **📊 Security Command Center**: Premium dashboard with threat visualizations.
- **🔌 Widget Integration**: Edge protection via JS snippet.

---

## 📸 Final UI Reference
Built with a professional dark theme, glassmorphism, and smooth animations.

---

## ⚖️ License
Licensed under the **MIT License**.

*Built for Security. Designed for Excellence.* 🛡️
